import { buildApprove } from './builder/evm/approve';
import { buildClaim } from './builder/evm/claim';
import { buildDeposit } from './builder/evm/deposit';
import {
    buildEnsGetAddress,
    buildEnsGetName,
    buildEnsGetNameForAddr,
    buildEnsGetResolver,
    buildUniversalResolverResolve,
    buildUniversalResolverReverse,
} from './builder/evm/ens';
import { buildRedeem } from './builder/evm/redeem';
import { buildTransfer } from './builder/evm/transfer';
import { buildWithdraw } from './builder/evm/withdraw';
import { buildTrc20Transfer } from './builder/tron/trc20/transfer';

export const Calldata = {
    evm: {
        erc20: {
            approve: buildApprove,
            transfer: buildTransfer,
        },
        erc4626: {
            deposit: buildDeposit,
            withdraw: buildWithdraw,
            redeem: buildRedeem,
        },
        ens: {
            getAddress: buildEnsGetAddress,
            getResolver: buildEnsGetResolver,
            getName: buildEnsGetName,
            getNameForAddr: buildEnsGetNameForAddr,
            universalResolver: {
                resolve: buildUniversalResolverResolve,
                reverse: buildUniversalResolverReverse,
            },
        },
        distributor: {
            claim: buildClaim,
        },
    },
    tron: {
        trc20: {
            transfer: buildTrc20Transfer,
        },
    },
} as const;
