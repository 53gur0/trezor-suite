import { Box, Text, VStack } from '@suite-native/atoms';
import { Translation } from '@suite-native/intl';

type AddressReviewEnsPreviewProps = {
    ensName: string;
    resolvedAddress: string;
};

export const AddressReviewEnsPreview = ({
    ensName,
    resolvedAddress,
}: AddressReviewEnsPreviewProps) => (
    <Box marginHorizontal="sp4">
        <VStack spacing="sp4">
            <Text variant="body-sm" color="contentSecondary">
                <Translation
                    id="moduleSend.review.address.ensSendingTo"
                    values={{ ensName }}
                />
            </Text>
            <Text variant="body-sm" color="contentSecondary">
                <Translation
                    id="moduleSend.review.address.ensResolvedTo"
                    values={{ address: resolvedAddress }}
                />
            </Text>
        </VStack>
    </Box>
);
