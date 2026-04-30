import { parseAbi } from 'viem';

export const EVM_ABI = {
    erc20: {
        approve: parseAbi(['function approve(address spender, uint256 amount)']),
        transfer: parseAbi(['function transfer(address to, uint256 amount)']),
    },
    erc4626: {
        deposit: parseAbi(['function deposit(uint256 assets, address receiver)']),
        withdraw: parseAbi(['function withdraw(uint256 assets, address receiver, address owner)']),
        redeem: parseAbi(['function redeem(uint256 shares, address receiver, address owner)']),
    },
    ens: {
        // v1 — direct ENS Registry / per-name Resolver primitives.
        getAddress: parseAbi(['function addr(bytes32 node) view returns (address)']),
        getResolver: parseAbi(['function resolver(bytes32 node) view returns (address)']),
        getName: parseAbi(['function name(bytes32 node) view returns (string)']),
        getNameForAddr: parseAbi(['function nameForAddr(address addr) view returns (string)']),
        // v2 — UniversalResolver dispatch (ENSIP-10 + ENSIP-19, CCIP-Read aware).
        universalResolver: {
            resolve: parseAbi([
                'function resolve(bytes name, bytes data) view returns (bytes result, address resolver)',
            ]),
            reverse: parseAbi([
                'function reverse(bytes lookupAddress, uint256 coinType) view returns (string primary, address resolver, address reverseResolver)',
            ]),
        },
    },
    distributor: {
        claim: parseAbi([
            'function claim(address[] users, address[] tokens, uint256[] amounts, bytes32[][] proofs)',
        ]),
    },
} as const;
