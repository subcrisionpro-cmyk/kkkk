import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../types';

const CHAT_HISTORY_KEY = '@offline_chat_history';

class StorageService {
    /**
     * Save the entire chat history for a specific model
     */
    static async saveChatHistory(modelName: string, messages: ChatMessage[]): Promise<void> {
        try {
            const key = `${CHAT_HISTORY_KEY}_${modelName}`;
            const jsonValue = JSON.stringify(messages);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }

    /**
     * Load the chat history for a specific model
     */
    static async loadChatHistory(modelName: string): Promise<ChatMessage[]> {
        try {
            const key = `${CHAT_HISTORY_KEY}_${modelName}`;
            const jsonValue = await AsyncStorage.getItem(key);
            if (jsonValue != null) {
                return JSON.parse(jsonValue);
            }
        } catch (e) {
            console.error('Error loading chat history:', e);
        }
        return [];
    }

    /**
     * Clear the chat history for a specific model
     */
    static async clearChatHistory(modelName: string): Promise<void> {
        try {
            const key = `${CHAT_HISTORY_KEY}_${modelName}`;
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Error clearing chat history:', e);
        }
    }

    /**
     * Save AI Settings
     */
    static async saveSettings(settings: any): Promise<void> {
        try {
            await AsyncStorage.setItem('@offline_ai_settings', JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings', e);
        }
    }

    /**
     * Load AI settings
     */
    static async loadSettings(): Promise<any> {
        try {
            const jsonValue = await AsyncStorage.getItem('@offline_ai_settings');
            if (jsonValue != null) {
                return JSON.parse(jsonValue);
            }
        } catch (e) {
            console.error('Error loading settings', e);
        }
        return null;
    }
}

export default StorageService;
