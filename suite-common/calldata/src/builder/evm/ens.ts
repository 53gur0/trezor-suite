import { EVM_ABI } from '../../constants/evm';
import { createEvmEncoder } from '../../encoder/evm';
import { createPolicy } from '../../policy/createPolicy';
import { validateAddress } from '../../validation/evm/address';
import { validateEnsNode } from '../../validation/evm/ens';
import { validateEnsName } from '../../validation/evm/ensName';
import { validateBigint } from '../../validation/shared/bigint';
import { validateBytes } from '../../validation/shared/bytes';
import { createBuilder } from '../createBuilder';
import { createParam } from '../createParam';

const nodeParam = createParam<string, `0x${string}`, Record<string, unknown>>({
    validate: validateEnsNode,
    policy: createPolicy({ ZERO_AMOUNT: 'error' }),
});

const addrParam = createParam<string, `0x${string}`, Record<string, unknown>>({
    validate: validateAddress,
    policy: createPolicy({ ZERO_AMOUNT: 'error' }),
});

const ensNameParam = createParam<string, `0x${string}`, Record<string, unknown>>({
    validate: validateEnsName,
});

const bytesParam = createParam<`0x${string}`, `0x${string}`, Record<string, unknown>>({
    validate: validateBytes,
});

const lookupAddressParam = createParam<string, `0x${string}`, Record<string, unknown>>({
    validate: validateAddress,
});

const coinTypeParam = createParam<bigint, bigint, Record<string, unknown>>({
    validate: validateBigint,
});

export const buildEnsGetAddress = createBuilder({
    params: {
        node: nodeParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.getAddress),
});

export const buildEnsGetResolver = createBuilder({
    params: {
        node: nodeParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.getResolver),
});

export const buildEnsGetName = createBuilder({
    params: {
        node: nodeParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.getName),
});

export const buildEnsGetNameForAddr = createBuilder({
    params: {
        addr: addrParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.getNameForAddr),
});

// UniversalResolver.resolve(name, data) — outer dispatch for ENSIP-10 +
// CCIP-Read forward resolution. The `name` param accepts a human-readable ENS
// name and gets DNS-encoded by the validator; `data` is pre-encoded inner
// calldata (e.g. the result of buildEnsGetAddress for an address lookup).
export const buildUniversalResolverResolve = createBuilder({
    params: {
        name: ensNameParam,
        data: bytesParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.universalResolver.resolve),
});

// UniversalResolver.reverse(lookupAddress, coinType) — outer dispatch for
// ENSIP-19 reverse resolution across L1 and L2s. `coinType` is the SLIP-44
// coin type (60 for Ethereum L1; ENSIP-19 derives per-L2 values from chain id).
export const buildUniversalResolverReverse = createBuilder({
    params: {
        lookupAddress: lookupAddressParam,
        coinType: coinTypeParam,
    },
    encode: createEvmEncoder(EVM_ABI.ens.universalResolver.reverse),
});
