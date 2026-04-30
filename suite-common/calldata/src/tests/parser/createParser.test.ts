import { parseAbi } from 'viem';

import { createParser } from '../../parser/createParser';

describe('createParser', () => {
    describe('factory', () => {
        it('throws when ABI has no functions', () => {
            expect(() =>
                createParser({
                    // @ts-expect-error
                    abi: parseAbi([]),
                }),
            ).toThrow('No function in ABI');
        });

        it('throws when ABI has multiple functions', () => {
            expect(() =>
                createParser({ abi: parseAbi(['function foo()', 'function bar()']) }),
            ).toThrow('ABI must contain exactly one function');
        });
    });

    describe('parser', () => {
        it('throws when result hex is malformed', () => {
            const parser = createParser({
                abi: parseAbi(['function foo() view returns (string)']),
            });

            expect(() => parser('0xdeadbeef')).toThrow();
        });
    });
});
