import { Translation } from '@suite/intl';
import { BulletList, Card, Column, H3, H4, Text } from '@trezor/components';
import { spacings } from '@trezor/theme';

import { TransactionReviewOutputTimer } from './TransactionReviewOutputTimer';

type VerifyAddressProps = {
    networkType: string;
    deadline?: number;
    onTryAgain: (close: boolean) => void;
    isSending?: boolean;
    // When the user typed an ENS name, both the original input ("vitalik.eth") and the
    // resolved hex are surfaced so the user can cross-check them against the resolved
    // address shown on the Trezor device.
    ensName?: string;
    resolvedAddress?: string;
};

export const TransactionReviewVerifyAddress = ({
    networkType,
    deadline,
    onTryAgain,
    isSending,
    ensName,
    resolvedAddress,
}: VerifyAddressProps) => (
    <Card>
        <Column gap={spacings.xxl}>
            <Column gap={spacings.md}>
                <H3>
                    <Translation id="TR_SEND_ADDRESS_CONFIRMATION_HEADING" />
                </H3>
                {ensName && (
                    <Column gap={spacings.xxs}>
                        <Text typographyStyle="body-sm" color="contentSecondary">
                            <Translation
                                id="TR_SEND_ADDRESS_CONFIRMATION_ENS_NOTE"
                                values={{ ensName }}
                            />
                        </Text>
                        {resolvedAddress && (
                            <Text typographyStyle="body-sm" color="contentSecondary">
                                <Translation
                                    id="TR_SEND_ADDRESS_CONFIRMATION_ENS_RESOLVED_TO"
                                    values={{ address: resolvedAddress }}
                                />
                            </Text>
                        )}
                    </Column>
                )}
                {networkType === 'solana' && deadline && (
                    <TransactionReviewOutputTimer
                        deadline={deadline}
                        onTryAgain={onTryAgain}
                        isSending={isSending}
                    />
                )}
            </Column>
            <BulletList
                isOrdered
                bulletGap={spacings.md}
                titleGap={spacings.zero}
                gap={spacings.xxl}
            >
                <BulletList.Item
                    title={
                        <H4 typographyStyle="body-sm">
                            <Translation id="TR_SEND_ADDRESS_CONFIRMATION_ITEM_1_HEADING" />
                        </H4>
                    }
                />
                <BulletList.Item
                    title={
                        <H4 typographyStyle="body-sm">
                            <Translation id="TR_SEND_ADDRESS_CONFIRMATION_ITEM_2_HEADING" />
                        </H4>
                    }
                />
                <BulletList.Item
                    state="done"
                    title={
                        <H4 typographyStyle="body-sm">
                            <Translation id="TR_SEND_ADDRESS_CONFIRMATION_ITEM_3_HEADING" />
                        </H4>
                    }
                />
            </BulletList>
        </Column>
    </Card>
);
