import { findEnsNodeIssue, validateEnsNode } from '../../../validation/evm/ens';

describe('findEnsNodeIssue', () => {
    it('returns null for valid ENS name', () => {
        expect(findEnsNodeIssue('vitalik.eth')).toBe(null);
    });

    it('returns INVALID_BYTES32 for invalid ENS name', () => {
        expect(findEnsNodeIssue('not a valid ens name')).toBe('INVALID_BYTES32');
    });
});

describe('validateEnsNode', () => {
    it('normalizes and hashes ENS name', () => {
        expect(validateEnsNode('vitalik.eth', 'node')).toEqual({
            value: '0xee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835',
            issues: [],
        });
    });

    it('returns issue for invalid ENS name', () => {
        expect(validateEnsNode('not a valid ens name', 'node')).toEqual({
            value: null,
            issues: [{ code: 'INVALID_BYTES32', path: 'node' }],
        });
    });
});
