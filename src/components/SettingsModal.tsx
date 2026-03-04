import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import StorageService from '../services/StorageService';

export interface AISettings {
    temperature: number;
    top_k: number;
    top_p: number;
    n_predict: number;
}

export const DEFAULT_SETTINGS: AISettings = {
    temperature: 0.7,
    top_k: 40,
    top_p: 0.95,
    n_predict: 512,
};

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (settings: AISettings) => void;
}

const SettingsModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
    const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        if (visible) {
            loadSettings();
        }
    }, [visible]);

    const loadSettings = async () => {
        const saved = await StorageService.loadSettings();
        if (saved) {
            setSettings(saved);
        }
    };

    const handleSave = async () => {
        await StorageService.saveSettings(settings);
        onSave(settings);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>AI Settings ⚙️</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollArea}>
                        {/* Temperature */}
                        <View style={styles.settingGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Temperature</Text>
                                <Text style={styles.value}>{settings.temperature.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.desc}>Controls randomness (higher = more creative).</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, temperature: Math.max(0.1, s.temperature - 0.1) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>-</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, temperature: Math.min(1.5, s.temperature + 0.1) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
                            </View>
                        </View>

                        {/* Top_P */}
                        <View style={styles.settingGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Top-P</Text>
                                <Text style={styles.value}>{settings.top_p.toFixed(2)}</Text>
                            </View>
                            <Text style={styles.desc}>Nucleus sampling threshold.</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, top_p: Math.max(0.1, s.top_p - 0.05) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>-</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, top_p: Math.min(1.0, s.top_p + 0.05) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>+</Text></TouchableOpacity>
                            </View>
                        </View>

                        {/* Max Tokens */}
                        <View style={styles.settingGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Max Tokens (n_predict)</Text>
                                <Text style={styles.value}>{settings.n_predict}</Text>
                            </View>
                            <Text style={styles.desc}>Maximum length of AI response.</Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, n_predict: Math.max(128, s.n_predict - 128) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>-128</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => setSettings(s => ({ ...s, n_predict: Math.min(2048, s.n_predict + 128) }))} style={styles.adjustBtn}><Text style={styles.adjustText}>+128</Text></TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.resetBtn} onPress={() => setSettings(DEFAULT_SETTINGS)}>
                            <Text style={styles.resetText}>Default</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Save Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        height: '75%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: FONTS.sizes.xl,
        fontWeight: 'bold',
    },
    closeBtn: {
        color: COLORS.textSecondary,
        fontSize: 24,
        padding: SPACING.xs,
    },
    scrollArea: {
        flex: 1,
    },
    settingGroup: {
        backgroundColor: COLORS.surfaceCard,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        color: COLORS.textPrimary,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
    },
    value: {
        color: COLORS.primaryLight,
        fontSize: FONTS.sizes.lg,
        fontWeight: 'bold',
    },
    desc: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.xs,
        marginBottom: SPACING.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.xs,
    },
    adjustBtn: {
        backgroundColor: COLORS.surfaceLight,
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 8,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
    },
    adjustText: {
        color: COLORS.textPrimary,
        fontSize: FONTS.sizes.md,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        marginTop: SPACING.md,
        justifyContent: 'space-between',
    },
    resetBtn: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        backgroundColor: COLORS.surfaceCard,
        borderRadius: RADIUS.md,
    },
    resetText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    saveBtn: {
        flex: 1,
        marginLeft: SPACING.md,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    saveText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        fontSize: FONTS.sizes.md,
    },
});

export default SettingsModal;
