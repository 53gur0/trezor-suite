// v2 ENS resolution — single-call flow through UniversalResolver. UniversalResolver
// internally walks the registry, handles ENSIP-10 wildcards, and (when supported)
// follows CCIP-Read for offchain / L2 names. This client is RPC-only, so any name
// that requires CCIP-Read surfaces as `OffchainLookupError` and is mapped to a
// null result by the dispatcher — practically: "we cannot resolve this name today,
// even though it may be valid". When the resolution layer moves to Blockbook the
// gateway-following step gets handled there and v2 keeps working unchanged.
import { Calldata, type EvmAddress, Parser, asEvmAddress } from '@suite-common/calldata';
import { type NetworkSymbol } from '@suite-common/wallet-config';
import {
    getRpcBySymbol,
    getUniversalResolverAddressBySymbol,
    isAddressValid,
} from '@suite-common/wallet-utils';

import { buildCalldata } from './resolveNamedAddressV1';
import { OffchainLookupError, callEthContract } from './rpc';

// SLIP-44 Ethereum mainnet coin type — used as the default for L1 reverse lookups.
// ENSIP-19 derives per-L2 coin types from chain id; we only call from mainnet today.
const ETH_COIN_TYPE = 60n;

const ZERO_BYTES = '0x' as const;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const resolveViaRPCv2 = async (value: string, symbol: NetworkSymbol) => {
    const rpc = getRpcBySymbol(symbol);
    const universalResolver = getUniversalResolverAddressBySymbol(symbol);
    // Trim at the entry — UniversalResolver hashes both the DNS-encoded outer name
    // and the inner namehash, so any whitespace inconsistency would otherwise cause
    // a wrong hash and a zero result. The ensName / ensNode validators inside the
    // builders perform the actual UTS46 normalization.
    const trimmed = value.trim();

    const innerData = buildCalldata(Calldata.evm.ens.getAddress, { node: trimmed });
    const calldata = buildCalldata(Calldata.evm.ens.universalResolver.resolve, {
        name: trimmed,
        data: innerData,
    });

    let response: `0x${string}`;
    try {
        response = await callEthContract(rpc, universalResolver, calldata);
    } catch (e) {
        // CCIP-Read names (ENSv2 / L2 / offchain) — return null rather than throw so
        // react-query treats this as a settled "no result" instead of retrying.
        if (e instanceof OffchainLookupError) return null;
        throw e;
    }

    // Some RPCs return bare "0x" for `ResolverNotFound` / `ResolverNotContract`
    // reverts that the node didn't decode. Treat as "name not registered".
    if (response === ZERO_BYTES) return null;

    let resultBytes: `0x${string}`;
    try {
        const [decoded] = Parser.evm.ens.universalResolver.resolve(response);
        resultBytes = decoded;
    } catch {
        return null;
    }

    if (resultBytes === ZERO_BYTES) return null;

    let address: `0x${string}`;
    try {
        address = Parser.evm.ens.getAddress(resultBytes);
    } catch {
        return null;
    }

    if (address === ZERO_ADDRESS) return null;

    return address;
};

export const reverseViaRPCv2 = async (value: string, symbol: NetworkSymbol) => {
    const rpc = getRpcBySymbol(symbol);
    const universalResolver = getUniversalResolverAddressBySymbol(symbol);
    const trimmed = value.trim();
    // Defense in depth: callers gate on isAddressValid; this guard keeps the contract
    // of `asEvmAddress` honest.
    if (!isAddressValid(trimmed, symbol)) return null;
    const address: EvmAddress = asEvmAddress(trimmed);

    const calldata = buildCalldata(Calldata.evm.ens.universalResolver.reverse, {
        lookupAddress: address,
        coinType: ETH_COIN_TYPE,
    });

    let response: `0x${string}`;
    try {
        response = await callEthContract(rpc, universalResolver, calldata);
    } catch (e) {
        if (e instanceof OffchainLookupError) return null;
        throw e;
    }

    if (response === ZERO_BYTES) return null;

    try {
        const [primary] = Parser.evm.ens.universalResolver.reverse(response);

        return primary || null;
    } catch {
        return null;
    }
};
