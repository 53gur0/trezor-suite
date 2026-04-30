import { namehash, normalize } from 'viem/ens';

import { type ValidateFn, createValidator } from '../createValidator';

export const findEnsNodeIssue: ValidateFn<string> = input => {
    try {
        namehash(normalize(input));

        return null;
    } catch {
        return 'INVALID_BYTES32';
    }
};

export const validateEnsNode = createValidator<string, `0x${string}`>({
    validate: [findEnsNodeIssue],
    normalize: input => namehash(normalize(input)),
});
