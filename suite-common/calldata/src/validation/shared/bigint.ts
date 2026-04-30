import { createValidator } from '../createValidator';

// Pass-through validator for already-narrow `bigint` inputs (e.g. constant
// coinTypes). Use validateUint256 instead when the input is user-supplied and
// may be negative, fractional, or oversized.
export const validateBigint = createValidator<bigint, bigint>({
    validate: [],
    normalize: input => input,
});
