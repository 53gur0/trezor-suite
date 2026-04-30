import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { type RouteProp, useRoute } from '@react-navigation/native';

import {
    type AccountsRootState,
    selectAccountNetworkSymbol,
    useResolveNamedAddress,
} from '@suite-common/wallet-core';
import { useFormContext } from '@suite-native/forms';
import { type SendStackParamList, type SendStackRoutes } from '@suite-native/navigation';

import { type SendOutputsFormValues } from '../../sendOutputsFormSchema';
import { getOutputFieldName } from '../../utils';

type UseResolvedAddressArgs = {
    inputIndex: number;
};

export const useResolvedAddress = ({ inputIndex }: UseResolvedAddressArgs) => {
    const {
        params: { accountKey },
    } = useRoute<RouteProp<SendStackParamList, SendStackRoutes.SendOutputs>>();
    const { watch, setValue, trigger } = useFormContext<SendOutputsFormValues>();
    const symbol = useSelector((state: AccountsRootState) =>
        selectAccountNetworkSymbol(state, accountKey),
    );

    const addressFieldName = getOutputFieldName(inputIndex, 'address');
    const resolvedAddressFieldName = getOutputFieldName(inputIndex, 'resolvedAddress');
    const addressValue = watch(addressFieldName) ?? '';

    const {
        mode,
        isResolving,
        isResolveError,
        resolvedAddress,
        reverseResolvedName,
        isFetching,
        isSuccess,
        isError,
        data,
    } = useResolveNamedAddress(addressValue, symbol);

    useEffect(() => {
        // Reverse resolution is purely informational — never write to resolvedAddress for
        // a hex input, otherwise we'd shadow the user's already-valid address with a name.
        if (mode !== 'forward') {
            setValue(resolvedAddressFieldName, undefined);

            return;
        }

        // Resolution is in flight (debouncing or fetching). Set to undefined — the schema
        // validator treats `undefined` as "still pending" and does not error on it.
        if (isFetching) {
            setValue(resolvedAddressFieldName, undefined);

            return;
        }

        if (isSuccess) {
            // `null` means the name is not registered — surfaced as success with no data
            // by resolveViaRPC. Treat it the same as an RPC-level failure for the form.
            const resolved = typeof data === 'string' ? data : '';
            setValue(resolvedAddressFieldName, resolved);
            // Re-run the address validator so its error state catches up with the
            // newly-resolved sibling value.
            trigger(addressFieldName);

            return;
        }

        if (isError) {
            // Sentinel: empty string marks an explicit resolution failure so the
            // validator can distinguish "still pending" (undefined) from "failed".
            setValue(resolvedAddressFieldName, '');
            trigger(addressFieldName);
        }
    }, [
        mode,
        isFetching,
        isSuccess,
        isError,
        data,
        addressFieldName,
        resolvedAddressFieldName,
        setValue,
        trigger,
    ]);

    return {
        isResolving,
        resolvedAddress,
        // Reverse failures are silent — a valid hex without an associated ENS just shows
        // nothing rather than a scary error.
        reverseResolvedName,
        isResolveError,
    };
};
