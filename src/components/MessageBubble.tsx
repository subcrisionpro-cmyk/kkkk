// MessageBubble component - renders individual chat messages
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { ChatMessage } from '../types';

import Markdown from 'react-native-markdown-display';

// Custom Markdown styles for dark mode
const markdownStyles = StyleSheet.create({
    body: {
        color: COLORS.aiBubbleText,
        fontSize: FONTS.sizes.md,
        lineHeight: 22,
    },
    code_block: {
        backgroundColor: COLORS.surfaceCard,
        color: COLORS.primaryLight,
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    code_inline: {
        backgroundColor: COLORS.surfaceCard,
        color: COLORS.primaryLight,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    fence: {
        backgroundColor: COLORS.surfaceCard,
        color: COLORS.primaryLight,
        borderRadius: RADIUS.sm,
        padding: SPACING.md,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginTop: SPACING.sm,
        marginBottom: SPACING.sm,
    },
});

interface Props {
    message: ChatMessage;
    isLast?: boolean;
}

const MessageBubble: React.FC<Props> = ({ message, isLast }) => {
    const isUser = message.role === 'user';
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 12,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.aiContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                },
            ]}>
            {!isUser && (
                <View style={styles.avatarContainer}>
                    <View style={styles.aiAvatar}>
                        <Text style={styles.avatarText}>✨</Text>
                    </View>
                </View>
            )}
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                ]}>
                {isUser ? (
                    <Text
                        style={[
                            styles.messageText,
                            styles.userText,
                        ]}
                        selectable>
                        {message.content}
                    </Text>
                ) : (
                    <View>
                        <Markdown style={markdownStyles}>
                            {message.content + (message.isStreaming ? ' ▊' : '')}
                        </Markdown>
                    </View>
                )}

                <Text
                    style={[
                        styles.timestamp,
                        isUser ? styles.userTimestamp : styles.aiTimestamp,
                    ]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>
            {isUser && (
                <View style={styles.avatarContainer}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: SPACING.xs,
        marginHorizontal: SPACING.md,
        alignItems: 'flex-end',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginHorizontal: SPACING.xs,
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarText: {
        fontSize: 14,
    },
    bubble: {
        maxWidth: '72%',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
    },
    userBubble: {
        backgroundColor: COLORS.userBubble,
        borderBottomRightRadius: RADIUS.sm,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    aiBubble: {
        backgroundColor: COLORS.aiBubble,
        borderBottomLeftRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    messageText: {
        fontSize: FONTS.sizes.md,
        lineHeight: 22,
    },
    userText: {
        color: COLORS.userBubbleText,
    },
    aiText: {
        color: COLORS.aiBubbleText,
    },
    timestamp: {
        fontSize: FONTS.sizes.xs,
        marginTop: SPACING.xs,
    },
    userTimestamp: {
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'right',
    },
    aiTimestamp: {
        color: COLORS.textMuted,
    },
    cursor: {
        color: COLORS.primaryLight,
        fontSize: FONTS.sizes.md,
    },
});

export default MessageBubble;
