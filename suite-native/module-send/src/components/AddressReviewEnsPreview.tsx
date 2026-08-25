import { useSelector } from 'react-redux';

import {
    type SendRootState,
    selectSendFormDraftOutputsByAccountKey,
} from '@suite-common/wallet-core';
import { type AccountKey, type TokenAddress } from '@suite-common/wallet-types';
import { looksLikeNamedAddress } from '@suite-common/wallet-utils';
import { Text, VStack } from '@suite-native/atoms';
import { Translation } from '@suite-native/intl';

type AddressReviewEnsPreviewProps = {
    accountKey: AccountKey;
    tokenContract?: TokenAddress;
};

/**
 * The send draft keeps the name the user typed on `address` and the onchain address it resolved to
 * on `resolvedAddress`. Both are shown here so the user can match the name they entered against the
 * address the device displays.
 */
export const AddressReviewEnsPreview = ({
    accountKey,
    tokenContract,
}: AddressReviewEnsPreviewProps) => {
    const outputs = useSelector((state: SendRootState) =>
        selectSendFormDraftOutputsByAccountKey(state, accountKey, tokenContract),
    );

    const { address, resolvedAddress } = outputs?.[0] ?? {};

    if (!address || !resolvedAddress || !looksLikeNamedAddress(address)) return null;

    return (
        <VStack spacing="sp4">
            <Text variant="body-sm" color="contentSecondary">
                <Translation
                    id="moduleSend.review.address.ensSendingTo"
                    values={{ ensName: address }}
                />
            </Text>
            <Text variant="body-sm" color="contentSecondary">
                <Translation
                    id="moduleSend.review.address.ensWalletAddress"
                    values={{ address: resolvedAddress }}
                />
            </Text>
        </VStack>
    );
};
