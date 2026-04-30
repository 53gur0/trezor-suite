import { type ValidateFn, createValidator } from '../createValidator';

// Generic dynamic bytes (not the fixed-32 bytes32). Must be 0x-prefixed and
// even-length hex; empty (`0x`) is allowed for "no data" payloads.
export const findBytesIssue: ValidateFn<string> = input =>
    /^0x([0-9a-fA-F]{2})*$/.test(input) ? null : 'INVALID_BYTES';

export const validateBytes = createValidator<`0x${string}`, `0x${string}`>({
    validate: [findBytesIssue],
    normalize: input => input.toLowerCase() as `0x${string}`,
});
