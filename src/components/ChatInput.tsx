// ChatInput component - message input bar with send button
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Keyboard,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';

interface Props {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const ChatInput: React.FC<Props> = ({
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
}) => {
    const [text, setText] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled) return;

        // Button press animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.85,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 200,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();

        onSend(trimmed);
        setText('');
        Keyboard.dismiss();
    };

    const canSend = text.trim().length > 0 && !disabled;

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    maxLength={2000}
                    editable={!disabled}
                    returnKeyType="send"
                    blurOnSubmit
                    onSubmitEditing={handleSend}
                />
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!canSend}
                        activeOpacity={0.7}>
                        <View style={styles.sendIcon}>
                            <View style={styles.sendArrow} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.xxl,
        paddingLeft: SPACING.lg,
        paddingRight: SPACING.xs,
        paddingVertical: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        fontSize: FONTS.sizes.md,
        color: COLORS.textPrimary,
        maxHeight: 100,
        paddingVertical: SPACING.sm,
        lineHeight: 20,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.sm,
    },
    sendButtonActive: {
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.surfaceCard,
    },
    sendIcon: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 0,
        borderTopWidth: 6,
        borderBottomWidth: 6,
        borderLeftColor: '#FFFFFF',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
        marginLeft: 3,
    },
});

export default ChatInput;
