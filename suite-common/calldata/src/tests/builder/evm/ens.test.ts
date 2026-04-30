import { buildEnsGetAddress, buildEnsGetNameForAddr, buildEnsGetResolver } from '../../../builder/evm/ens';
import { asEvmAddress } from '../../../types/evm';

const ENS_NAME = 'vitalik.eth';
const ADDRESS = asEvmAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

describe('ENS builders', () => {
    it('encodes getResolver calldata', () => {
        const result = buildEnsGetResolver({ node: ENS_NAME });

        expect(result.isValid).toBe(true);
        expect(result.data).toBe(
            '0x0178b8bfee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835',
        );
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('encodes getAddress calldata', () => {
        const result = buildEnsGetAddress({ node: ENS_NAME });

        expect(result.isValid).toBe(true);
        expect(result.data).toBe(
            '0x3b3b57deee6c4522aab0003e8d14cd40a6af439055fd2577951148c14b6cea9a53475835',
        );
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('encodes getNameForAddr calldata', () => {
        const result = buildEnsGetNameForAddr({ addr: ADDRESS });

        expect(result.isValid).toBe(true);
        expect(result.data).toBe(
            '0x4ec3bd23000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
        );
        expect(result.errors).toEqual([]);
        expect(result.warnings).toEqual([]);
    });

    it('returns error for invalid ENS node input', () => {
        const result = buildEnsGetResolver({ node: 'not a valid ens name' });

        expect(result.isValid).toBe(false);
        expect(result.data).toBe(null);
        expect(result.errors).toEqual([
            { code: 'INVALID_BYTES32', path: 'node', severity: 'error' },
        ]);
        expect(result.warnings).toEqual([]);
    });

    it('returns error for invalid address input', () => {
        const result = buildEnsGetNameForAddr({ addr: 'not-an-address' });

        expect(result.isValid).toBe(false);
        expect(result.data).toBe(null);
        expect(result.errors).toEqual([
            { code: 'INVALID_ADDRESS', path: 'addr', severity: 'error' },
        ]);
        expect(result.warnings).toEqual([]);
    });
});
