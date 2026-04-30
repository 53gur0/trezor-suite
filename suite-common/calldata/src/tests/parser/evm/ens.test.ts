import { Parser } from '../../../parser';

describe('ENS parsers', () => {
    it('parses getNameForAddr result (string)', () => {
        const result = Parser.evm.ens.getNameForAddr(
            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001864656661756c742e73776167616c6963696f75732e6574680000000000000000',
        );

        expect(result).toBe('default.swagalicious.eth');
    });

    it('parses getNameForAddr empty result', () => {
        const result = Parser.evm.ens.getNameForAddr(
            '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        );

        expect(result).toBe('');
    });

    it('parses getAddress result (address)', () => {
        const result = Parser.evm.ens.getAddress(
            '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
        );

        expect(result).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    });

    it('parses getResolver result (address)', () => {
        const result = Parser.evm.ens.getResolver(
            '0x0000000000000000000000004976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
        );

        expect(result).toBe('0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41');
    });
});
