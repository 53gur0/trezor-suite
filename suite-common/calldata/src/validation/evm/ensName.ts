import { toHex } from 'viem';
import { normalize, packetToBytes } from 'viem/ens';

import { type ValidateFn, createValidator } from '../createValidator';

// UTS46-normalize the input to catch malformed ENS names early. The normalized
// form is what UniversalResolver hashes internally, so checking here keeps the
// "looks valid → normalizes" contract honest before we reach the encoder.
export const findEnsNameIssue: ValidateFn<string> = input => {
    try {
        normalize(input);

        return null;
    } catch {
        return 'INVALID_ENS_NAME';
    }
};

// Encodes an ENS name into DNS wire format: each label prefixed with its byte
// length, terminated by a zero byte. UniversalResolver's `resolve(bytes name, …)`
// expects this shape for the outer name parameter.
export const validateEnsName = createValidator<string, `0x${string}`>({
    validate: [findEnsNameIssue],
    normalize: input => toHex(packetToBytes(normalize(input))),
});
