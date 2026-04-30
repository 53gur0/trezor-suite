import { EVM_ABI } from './constants/evm';
import { createParser } from './parser/createParser';

export const Parser = {
    evm: {
        ens: {
            getAddress: createParser({ abi: EVM_ABI.ens.getAddress }),
            getResolver: createParser({ abi: EVM_ABI.ens.getResolver }),
            getName: createParser({ abi: EVM_ABI.ens.getName }),
            getNameForAddr: createParser({ abi: EVM_ABI.ens.getNameForAddr }),
            universalResolver: {
                resolve: createParser({ abi: EVM_ABI.ens.universalResolver.resolve }),
                reverse: createParser({ abi: EVM_ABI.ens.universalResolver.reverse }),
            },
        },
    },
} as const;
