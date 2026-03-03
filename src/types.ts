// Type definitions for the Offline Chat app

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}

export interface ModelInfo {
    path: string;
    name: string;
    size: number; // in bytes
    loaded: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    modelPath: string;
    createdAt: number;
    updatedAt: number;
}

export type AppScreen = 'model-loader' | 'chat';
