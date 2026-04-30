// v1 ENS resolution — manual two-step flow against the ENS Registry and the
// per-name Resolver contract. Kept alongside v2 for explicit access and as a
// reference path; the public dispatcher in `resolveNamedAddress.ts` defaults to
// v2 (UniversalResolver). Do not import this module directly from feature code
// unless you specifically need to bypass v2.
import { Calldata, type EvmAddress, Parser, asEvmAddress } from '@suite-common/calldata';
import { type NetworkSymbol } from '@suite-common/wallet-config';
import {
    getResolverAddressBySymbol,
    getReverseResolverAddressBySymbol,
    getRpcBySymbol,
    isAddressValid,
} from '@suite-common/wallet-utils';

import { callEthContract } from './rpc';

type Builder<P> = (params: P) => { isValid: boolean; data: `0x${string}` | null };

export const buildCalldata = <P>(builder: Builder<P>, params: P): `0x${string}` => {
    const result = builder(params);
    if (!result.isValid || !result.data) {
        throw new Error('Failed to build calldata');
    }

    return result.data;
};

const queryResolverWithAddress = async (value: string, rpc: string, resolverAddress: string) =>
    Parser.evm.ens.getAddress(
        await callEthContract(
            rpc,
            resolverAddress,
            buildCalldata(Calldata.evm.ens.getAddress, { node: value }),
        ),
    );

const queryAddressOfResolver = async (value: string, symbol: NetworkSymbol, rpc: string) => {
    const raw = await callEthContract(
        rpc,
        getResolverAddressBySymbol(symbol),
        buildCalldata(Calldata.evm.ens.getResolver, { node: value }),
    );

    // Some RPC providers return a bare "0x" instead of 32 zero-bytes when no resolver is
    // registered for the node. Treat as "no resolver" rather than letting the ABI decoder
    // throw — that way HTTP/RPC errors stay distinct from "no record" outcomes.
    if (raw === '0x') return null;

    return Parser.evm.ens.getResolver(raw);
};

// Canonical ENS reverse-record name. The label is the address as lowercase hex without
// the 0x prefix, followed by `.addr.reverse`. See ENSIP-3.
const buildReverseLookupName = (address: EvmAddress) =>
    `${address.toLowerCase().replace(/^0x/, '')}.addr.reverse`;

const queryNameOnResolver = async (
    reverseName: string,
    rpc: string,
    resolverAddress: string,
) => {
    const response = await callEthContract(
        rpc,
        resolverAddress,
        buildCalldata(Calldata.evm.ens.getName, { node: reverseName }),
    );

    // "0x" means the resolver returned no data — most often because the address has no
    // primary name set. Treat as "no reverse name" rather than throwing in the parser.
    if (response === '0x') return null;

    try {
        return Parser.evm.ens.getName(response);
    } catch {
        return null;
    }
};

// ENSIP-19 reverse: a single call against a reverse-resolver contract that takes the
// address directly and returns the primary name. Used as a fallback for setups that
// store reverse records outside the ENS Registry.
const queryNameForAddrOnResolver = async (
    address: EvmAddress,
    symbol: NetworkSymbol,
    rpc: string,
) => {
    const response = await callEthContract(
        rpc,
        getReverseResolverAddressBySymbol(symbol),
        buildCalldata(Calldata.evm.ens.getNameForAddr, { addr: address }),
    );

    if (response === '0x') return null;

    try {
        return Parser.evm.ens.getNameForAddr(response);
    } catch {
        return null;
    }
};

export const resolveViaRPCv1 = async (value: string, symbol: NetworkSymbol) => {
    const rpc = getRpcBySymbol(symbol);
    // Surrounding whitespace would change the ENS namehash and produce a wrong (or zero)
    // resolver for inputs that are otherwise valid (e.g. "vitalik.eth ").
    const trimmed = value.trim();

    // A zero-address response from either step means the name is not registered or has no
    // address record. That is an expected outcome for arbitrary user input, so we return
    // null instead of throwing — throwing here would trigger react-query's retry loop and
    // surface noisy "Resolver is not set" errors in the console.
    const addressOfResolver = await queryAddressOfResolver(trimmed, symbol, rpc);
    if (!addressOfResolver || BigInt(addressOfResolver) === 0n) return null;

    const data = await queryResolverWithAddress(trimmed, rpc, addressOfResolver);
    if (BigInt(data) === 0n) return null;

    return data;
};

export const reverseViaRPCv1 = async (value: string, symbol: NetworkSymbol) => {
    const rpc = getRpcBySymbol(symbol);
    const trimmed = value.trim();
    // Defense in depth: callers gate on isAddressValid, but this guard pins the contract
    // of buildReverseLookupName / queryNameForAddrOnResolver (both expect a hex address).
    if (!isAddressValid(trimmed, symbol)) return null;
    const address = asEvmAddress(trimmed);
    const reverseName = buildReverseLookupName(address);

    // Path A — canonical ENSIP-3: ENS Registry → resolver(reverseNode) → name(reverseNode).
    // Works for addresses that set a primary name via the standard ReverseRegistrar.
    // Decoder failures inside queryAddressOfResolver are now turned into a `null` result
    // (see the "0x" short-circuit there), so transport / RPC errors bubble up naturally
    // and react-query can retry transient HTTP failures instead of silently falling
    // through to Path B.
    const addressOfResolver = await queryAddressOfResolver(reverseName, symbol, rpc);
    if (addressOfResolver && BigInt(addressOfResolver) !== 0n) {
        const name = await queryNameOnResolver(reverseName, rpc, addressOfResolver);
        if (name) return name;
    }

    // Path B — ENSIP-19 fallback: query the reverse-resolver contract directly with the
    // address. Some networks/setups (e.g. L2-style primary names, or reverse records that
    // aren't registered in the ENS Registry) only resolve through this interface.
    return queryNameForAddrOnResolver(address, symbol, rpc);
};
