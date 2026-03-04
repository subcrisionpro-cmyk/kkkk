// ChatScreen - Main chat interface
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { ChatMessage } from '../types';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import LlamaService from '../services/LlamaService';
import StorageService from '../services/StorageService';
import SettingsModal, { AISettings, DEFAULT_SETTINGS } from '../components/SettingsModal';

interface Props {
    modelName: string;
    onBack: () => void;
}

const ChatScreen: React.FC<Props> = ({ modelName, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_SETTINGS);
    const flatListRef = useRef<FlatList>(null);
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const loadData = async () => {
            const history = await StorageService.loadChatHistory(modelName);
            if (history && history.length > 0) {
                setMessages(history);
            } else {
                // Add welcome message if no history
                const welcome: ChatMessage = {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Hello! I'm your offline AI assistant powered by ${modelName}. I run entirely on your device — no internet needed! 🔒\n\nHow can I help you today?`,
                    timestamp: Date.now(),
                };
                setMessages([welcome]);
            }

            const savedSettings = await StorageService.loadSettings();
            if (savedSettings) {
                setAiSettings(savedSettings);
            }
        };

        loadData();
    }, [modelName, headerAnim]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleSend = async (text: string) => {
        if (isGenerating) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        const newMessagesWithUser = [...messages, userMessage];
        setMessages(newMessagesWithUser);
        StorageService.saveChatHistory(modelName, newMessagesWithUser);
        scrollToBottom();

        // Create AI message placeholder
        const aiMessageId = `ai-${Date.now()}`;
        const aiMessage: ChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsGenerating(true);
        scrollToBottom();

        try {
            // Build message history for context
            const chatHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, content: m.content }));
            chatHistory.push({ role: 'user', content: text });

            // Stream response
            let finalAiMessage = '';
            await LlamaService.generateResponse(
                chatHistory,
                (token: string) => {
                    finalAiMessage += token;
                    setMessages(prev =>
                        prev.map(m =>
                            m.id === aiMessageId
                                ? { ...m, content: m.content + token }
                                : m,
                        ),
                    );
                    scrollToBottom();
                },
                aiSettings
            );

            // Save after generation completes
            setMessages(prev => {
                const finalMessages = prev.map(m =>
                    m.id === aiMessageId ? { ...m, isStreaming: false } : m
                );
                StorageService.saveChatHistory(modelName, finalMessages);
                return finalMessages;
            });

            // Mark streaming as done
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiMessageId
                        ? { ...m, isStreaming: false, timestamp: Date.now() }
                        : m,
                ),
            );
        } catch (error: any) {
            // Show error in AI message
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiMessageId
                        ? {
                            ...m,
                            content: `❌ Error: ${error.message || 'Failed to generate response'}`,
                            isStreaming: false,
                        }
                        : m,
                ),
            );
        } finally {
            setIsGenerating(false);
            scrollToBottom();
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => (
        <MessageBubble message={item} />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Start a conversation!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={COLORS.surface} barStyle="light-content" />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    <Text style={styles.modelTag} numberOfLines={1} ellipsizeMode="middle">
                        {modelName}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setSettingsVisible(true)}
                    style={styles.settingsButton}
                >
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        StorageService.clearChatHistory(modelName);
                        // Reset to just welcome message
                        const welcome: ChatMessage = {
                            id: 'welcome',
                            role: 'assistant',
                            content: `Hello! I'm your offline AI assistant powered by ${modelName}. I run entirely on your device — no internet needed! 🔒\n\nHow can I help you today?`,
                            timestamp: Date.now(),
                        };
                        setMessages([welcome]);
                    }}
                    style={styles.clearButton}
                >
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.chatArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                    onContentSizeChange={scrollToBottom}
                />

                {/* Typing indicator */}
                {
                    isGenerating && (
                        <View style={styles.typingIndicator}>
                            <TypingDots />
                        </View>
                    )
                }

                <ChatInput
                    onSend={handleSend}
                    disabled={isGenerating}
                    placeholder={
                        isGenerating ? 'AI is thinking...' : 'Type your message...'
                    }
                />
            </KeyboardAvoidingView >

            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                onSave={(newSettings) => {
                    setAiSettings(newSettings);
                    setSettingsVisible(false);
                }}
            />
        </View>
    );
};

// Animated typing dots
const TypingDots: React.FC = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        };

        animate(dot1, 0);
        animate(dot2, 150);
        animate(dot3, 300);

        return () => {
            dot1.stopAnimation();
            dot2.stopAnimation();
            dot3.stopAnimation();
        };
    }, []);

    const dotStyle = (anim: Animated.Value) => ({
        opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        }),
        transform: [
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                }),
            },
        ],
    });

    return (
        <View style={typingStyles.container}>
            <Animated.View style={[typingStyles.dot, dotStyle(dot1)]} />
            <Animated.View style={[typingStyles.dot, dotStyle(dot2)]} />
            <Animated.View style={[typingStyles.dot, dotStyle(dot3)]} />
        </View>
    );
};

const typingStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.xs,
        gap: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primaryLight,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || SPACING.xxl : SPACING.xxl,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 24,
        color: COLORS.textPrimary,
        fontWeight: '300',
        marginTop: -2,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    headerTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    modelTag: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        opacity: 0.8,
        maxWidth: 200,
    },
    clearButton: {
        padding: SPACING.md,
    },
    settingsButton: {
        padding: SPACING.md,
        marginRight: -SPACING.md,
    },
    settingsIcon: {
        fontSize: 18,
    },
    clearText: {
        fontSize: 14,
        color: COLORS.error || '#ef4444',
        fontFamily: FONTS.medium,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SPACING.xs,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        flex: 1,
    },
    headerRight: {},
    offlineBadge: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.success,
        backgroundColor: 'rgba(16,185,129,0.1)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.pill,
        borderWidth: 1,
        borderColor: 'rgba(16,185,129,0.2)',
        overflow: 'hidden',
    },
    chatArea: {
        flex: 1,
    },
    messagesList: {
        paddingVertical: SPACING.md,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: FONTS.sizes.lg,
        color: COLORS.textMuted,
    },
    typingIndicator: {
        paddingLeft: SPACING.md,
    },
});

export default ChatScreen;
