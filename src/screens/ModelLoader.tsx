// ModelLoader screen - allows user to pick and load a GGUF model file
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { pick, types } from 'react-native-document-picker';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import LlamaService from '../services/LlamaService';

interface Props {
    onModelLoaded: (modelPath: string, modelName: string) => void;
}

const ModelLoader: React.FC<Props> = ({ onModelLoaded }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [statusText, setStatusText] = useState('');
    const [selectedFile, setSelectedFile] = useState<string>('');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subtle pulse animation on the load button
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                }),
            ]),
        ).start();
    }, []);

    const handlePickModel = async () => {
        try {
            const [result] = await pick({
                type: [types.allFiles],
                copyTo: 'documentDirectory',
            });

            if (result) {
                const filePath = result.fileCopyUri || result.uri;
                const fileName = result.name || 'Unknown Model';

                if (!fileName.endsWith('.gguf')) {
                    setStatus('error');
                    setStatusText('Please select a .gguf model file');
                    return;
                }

                setSelectedFile(fileName);
                setStatus('loading');
                setStatusText('Loading model... This may take a minute');

                // Animate button while loading
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 0.95,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ]),
                ).start();

                const success = await LlamaService.loadModel(filePath);

                if (success) {
                    setStatus('idle');
                    onModelLoaded(filePath, fileName);
                } else {
                    setStatus('error');
                    setStatusText('Failed to load model. Check file and try again.');
                }
            }
        } catch (err: any) {
            if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
                setStatus('error');
                setStatusText(`Error: ${err.message}`);
            }
        }
    };

    const borderColor = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.primaryDark, COLORS.primaryLight],
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🤖 Offline Chat</Text>
                <Text style={styles.subtitle}>
                    Powered by Gemma AI • 100% Private
                </Text>
            </View>

            {/* Main Card */}
            <Animated.View style={[styles.card, { borderColor }]}>
                <View style={styles.iconContainer}>
                    <Text style={styles.bigIcon}>🧠</Text>
                </View>

                <Text style={styles.cardTitle}>Load AI Model</Text>
                <Text style={styles.cardDescription}>
                    Select a .gguf model file from your device storage.
                    {'\n'}The model runs entirely on your device — no internet needed.
                </Text>

                {selectedFile ? (
                    <View style={styles.fileInfo}>
                        <Text style={styles.fileIcon}>📄</Text>
                        <Text style={styles.fileName} numberOfLines={1}>
                            {selectedFile}
                        </Text>
                    </View>
                ) : null}

                {status === 'loading' ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>{statusText}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.loadButton}
                        onPress={handlePickModel}
                        activeOpacity={0.8}>
                        <Text style={styles.loadButtonText}>
                            {selectedFile ? '🔄 Load Different Model' : '📂 Browse & Select Model'}
                        </Text>
                    </TouchableOpacity>
                )}

                {status === 'error' && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {statusText}</Text>
                    </View>
                )}
            </Animated.View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
                <Text style={styles.tipTitle}>💡 Tips</Text>
                <Text style={styles.tipText}>
                    • Copy your .gguf model to phone storage first
                </Text>
                <Text style={styles.tipText}>
                    • Recommended: 4GB+ RAM for smooth performance
                </Text>
                <Text style={styles.tipText}>
                    • Smaller models (Q4_K_S) run faster on phones
                </Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                All data stays on your device. No cloud. No tracking.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    title: {
        fontSize: FONTS.sizes.xxxl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.xxl,
        alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bigIcon: {
        fontSize: 36,
    },
    cardTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    cardDescription: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: SPACING.xl,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.lg,
        maxWidth: '100%',
    },
    fileIcon: {
        fontSize: 18,
        marginRight: SPACING.sm,
    },
    fileName: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.primaryLight,
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    loadingText: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
        marginTop: SPACING.md,
    },
    loadButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.pill,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    loadButtonText: {
        color: '#FFFFFF',
        fontSize: FONTS.sizes.md,
        fontWeight: '700',
    },
    errorContainer: {
        marginTop: SPACING.md,
        backgroundColor: 'rgba(239,68,68,0.1)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.sm,
        textAlign: 'center',
    },
    tipsContainer: {
        marginTop: SPACING.xxl,
        paddingHorizontal: SPACING.md,
    },
    tipTitle: {
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    tipText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textMuted,
        lineHeight: 22,
    },
    footer: {
        textAlign: 'center',
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        marginTop: SPACING.xxl,
        letterSpacing: 0.5,
    },
});

export default ModelLoader;
