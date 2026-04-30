import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Box, CircularSpinner, HStack, Text } from '@suite-native/atoms';
import { Icon } from '@suite-native/icons';
import { Translation } from '@suite-native/intl';

type EnsResolutionMessageProps =
    | { state: 'resolving' }
    | { state: 'resolved'; address: string }
    | { state: 'reverseResolved'; name: string }
    | { state: 'error' };

const SPINNER_SIZE = 16;

export const EnsResolutionMessage = (props: EnsResolutionMessageProps) => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
        <HStack spacing="sp4" marginLeft="sp12" alignItems="center">
            {props.state === 'resolving' && (
                // CircularSpinner is absolutely positioned, so it needs a sized wrapper
                // to occupy layout space and prevent the sibling text from overlapping it.
                <Box style={{ width: SPINNER_SIZE, height: SPINNER_SIZE }}>
                    <CircularSpinner size={SPINNER_SIZE} color="contentSecondary" width={2} />
                </Box>
            )}
            {(props.state === 'resolved' || props.state === 'reverseResolved') && (
                <Icon name="check" size="medium" color="contentSecondary" />
            )}
            {props.state === 'error' && (
                <Icon name="warning" size="medium" color="contentWarning" />
            )}
            <Box flex={1}>
                <Text
                    variant="body-xs"
                    color={props.state === 'error' ? 'contentWarning' : 'contentSecondary'}
                >
                    {props.state === 'resolving' && (
                        <Translation id="moduleSend.outputs.recipients.ens.resolving" />
                    )}
                    {props.state === 'resolved' && (
                        <Translation
                            id="moduleSend.outputs.recipients.ens.resolvedTo"
                            values={{ address: props.address }}
                        />
                    )}
                    {props.state === 'reverseResolved' && (
                        <Translation
                            id="moduleSend.outputs.recipients.ens.resolvesTo"
                            values={{ name: props.name }}
                        />
                    )}
                    {props.state === 'error' && (
                        <Translation id="moduleSend.outputs.recipients.ens.resolveFailed" />
                    )}
                </Text>
            </Box>
        </HStack>
    </Animated.View>
);
