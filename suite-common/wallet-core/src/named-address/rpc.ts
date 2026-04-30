// JSON-RPC plumbing shared between v1 and v2 ENS resolution paths.
//
// We keep this layer deliberately thin and dependency-free of viem so that v1's
// "registry → resolver → addr" flow and v2's "UniversalResolver" flow can both
// reach the chain through the same `eth_call` machinery.

const isHexRpcResult = (value: unknown): value is `0x${string}` =>
    typeof value === 'string' && value.startsWith('0x');

const assertHexRpcResult = (value: unknown): `0x${string}` => {
    if (!isHexRpcResult(value)) {
        throw new Error('Malformed RPC response');
    }

    return value;
};

// CCIP-Read (ERC-3668) revert. UniversalResolver throws this whenever a name
// can only be resolved via an offchain HTTP gateway (e.g. ENSv2 / Namechain
// names, wildcard names with offchain backends, *.cb.id, *.linea.eth, etc.).
//
// The 4-byte selector is keccak256("OffchainLookup(address,string[],bytes,bytes4,bytes)")[:4].
// We surface this as a dedicated error so callers can treat it as "name lives
// offchain — unsupported by this RPC-only client" instead of a generic failure.
export const OFFCHAIN_LOOKUP_SELECTOR = '0x556f1830';

export class OffchainLookupError extends Error {
    constructor(public readonly data: `0x${string}`) {
        super(
            'ENS name requires CCIP-Read offchain lookup, which is not supported by this RPC-only client.',
        );
        this.name = 'OffchainLookupError';
    }
}

type RpcError = {
    message?: string;
    data?: unknown;
};

type RpcResponse = {
    result?: unknown;
    error?: RpcError;
};

const callJsonRpc = async (rpc: string, method: string, params: unknown[]) => {
    const response = await fetch(rpc, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
        }),
    });

    const result = (await response.json()) as RpcResponse;

    if (!('result' in result)) {
        const errorData = result.error?.data;
        if (
            typeof errorData === 'string' &&
            errorData.toLowerCase().startsWith(OFFCHAIN_LOOKUP_SELECTOR)
        ) {
            throw new OffchainLookupError(errorData as `0x${string}`);
        }
        throw new Error(result.error?.message ?? 'RPC call failed');
    }

    return assertHexRpcResult(result.result);
};

export const callEthContract = (rpc: string, to: string, data: string) =>
    callJsonRpc(rpc, 'eth_call', [
        {
            to,
            data,
        },
    ]);
