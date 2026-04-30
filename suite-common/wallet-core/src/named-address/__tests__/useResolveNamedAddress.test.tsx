/**
 * @jest-environment jsdom
 */
import { renderHookWithQueryClient, waitFor } from '@suite-common/test-utils';

import { useResolveNamedAddress } from '../useResolveNamedAddress';

// The `@suite-common/wallet-utils` barrel transitively loads `@stellar/stellar-sdk`,
// which references `TextEncoder` at module scope and breaks under jsdom. Stub the
// barrel with the real `namedAddressUtils` implementations so the hook still gets
// truthful `isSymbolSupportingNamedAddress` / `looksLikeNamedAddress` behavior.
jest.mock('@suite-common/wallet-utils', () =>
    jest.requireActual('@suite-common/wallet-utils/src/namedAddressUtils'),
);

jest.mock('@trezor/react-utils', () => ({
    ...jest.requireActual('@trezor/react-utils'),
    useDebouncedValue: <T,>(value: T) => value,
}));

const mockResolveViaRPC = jest.fn();

jest.mock('../resolveNamedAddress', () => ({
    resolveViaRPC: (...args: unknown[]) => mockResolveViaRPC(...args),
}));

const RESOLVED_HEX = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('useResolveNamedAddress', () => {
    beforeEach(() => {
        mockResolveViaRPC.mockReset();
    });

    describe('idle mode (no fetch)', () => {
        it('is idle for an unsupported symbol', () => {
            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('vitalik.eth', 'btc'),
            );

            expect(result.current.mode).toBe('idle');
            expect(result.current.isResolving).toBe(false);
            expect(result.current.resolvedAddress).toBeUndefined();
            expect(mockResolveViaRPC).not.toHaveBeenCalled();
        });

        it('is idle when the symbol is null', () => {
            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('vitalik.eth', null),
            );

            expect(result.current.mode).toBe('idle');
            expect(mockResolveViaRPC).not.toHaveBeenCalled();
        });

        it('is idle when the value looks like a hex address (no dot)', () => {
            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress(RESOLVED_HEX, 'eth'),
            );

            expect(result.current.mode).toBe('idle');
            expect(mockResolveViaRPC).not.toHaveBeenCalled();
        });

        it('is idle for a bare identifier without a dot', () => {
            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('vitalik', 'eth'),
            );

            expect(result.current.mode).toBe('idle');
            expect(mockResolveViaRPC).not.toHaveBeenCalled();
        });
    });

    describe('forward mode (resolves via RPC)', () => {
        it('resolves a named input on eth mainnet', async () => {
            mockResolveViaRPC.mockResolvedValueOnce(RESOLVED_HEX);

            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('vitalik.eth', 'eth'),
            );

            expect(result.current.mode).toBe('forward');

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toBe(RESOLVED_HEX);
            expect(result.current.resolvedAddress).toBe(RESOLVED_HEX);
            expect(result.current.isResolveError).toBe(false);
            expect(mockResolveViaRPC).toHaveBeenCalledWith('vitalik.eth', 'eth');
        });

        it('resolves a named input on tsep', async () => {
            mockResolveViaRPC.mockResolvedValueOnce(RESOLVED_HEX);

            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('vitalik.eth', 'tsep'),
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.resolvedAddress).toBe(RESOLVED_HEX);
            expect(mockResolveViaRPC).toHaveBeenCalledWith('vitalik.eth', 'tsep');
        });

        it('trims whitespace before calling resolveViaRPC', async () => {
            mockResolveViaRPC.mockResolvedValueOnce(RESOLVED_HEX);

            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('  vitalik.eth  ', 'eth'),
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(mockResolveViaRPC).toHaveBeenCalledWith('vitalik.eth', 'eth');
        });

        it('treats a null result (no record) as a resolve error', async () => {
            mockResolveViaRPC.mockResolvedValueOnce(null);

            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('nope.eth', 'eth'),
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toBeNull();
            expect(result.current.resolvedAddress).toBeUndefined();
            expect(result.current.isResolveError).toBe(true);
        });
    });

    describe('error states', () => {
        it('surfaces a query error when resolveViaRPC throws', async () => {
            mockResolveViaRPC.mockRejectedValue(new Error('not found'));

            const { result } = renderHookWithQueryClient(() =>
                useResolveNamedAddress('nope.eth', 'eth'),
            );

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeInstanceOf(Error);
            expect((result.current.error as Error).message).toBe('not found');
            expect(result.current.isResolveError).toBe(true);
            expect(result.current.resolvedAddress).toBeUndefined();
        });
    });
});
