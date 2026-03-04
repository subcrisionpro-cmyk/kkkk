// LlamaService - Wraps llama.rn for model loading and inference
import { initLlama, LlamaContext } from 'llama.rn';

class LlamaService {
    private context: LlamaContext | null = null;
    private isLoading: boolean = false;

    async loadModel(
        modelPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<boolean> {
        if (this.isLoading) {
            console.warn('Model is already loading');
            return false;
        }

        try {
            this.isLoading = true;

            // Release previous context if exists
            if (this.context) {
                await this.context.release();
                this.context = null;
            }

            console.log('Loading model from:', modelPath);

            this.context = await initLlama({
                model: modelPath,
                use_mlock: true,
                n_ctx: 2048,
                n_batch: 512,
                n_threads: 4,
                n_gpu_layers: 0, // CPU only for maximum compatibility
            });

            console.log('Model loaded successfully!');
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('Failed to load model:', error);
            this.isLoading = false;
            return false;
        }
    }

    async generateResponse(
        messages: Array<{ role: string; content: string }>,
        onToken?: (token: string) => void,
        settings?: any,
    ): Promise<string> {
        if (!this.context) {
            throw new Error('Model not loaded. Please load a model first.');
        }

        try {
            // Format messages into a prompt
            const prompt = this.formatPrompt(messages);

            let fullResponse = '';

            const defaultOpts = {
                n_predict: 512,
                temperature: 0.7,
                top_k: 40,
                top_p: 0.95,
            };

            const runOpts = { ...defaultOpts, ...settings };

            const result = await this.context.completion(
                {
                    prompt,
                    n_predict: runOpts.n_predict,
                    temperature: runOpts.temperature,
                    top_k: runOpts.top_k,
                    top_p: runOpts.top_p,
                    stop: ['<end_of_turn>', '<eos>', '</s>', 'User:', 'Human:'],
                },
                (data: any) => {
                    // Streaming token callback
                    const token = data.token;
                    if (token && onToken) {
                        fullResponse += token;
                        onToken(token);
                    }
                },
            );

            return fullResponse || result.text || '';
        } catch (error) {
            console.error('Generation error:', error);
            throw error;
        }
    }

    private formatPrompt(
        messages: Array<{ role: string; content: string }>,
    ): string {
        // Gemma chat format
        let prompt = '';
        for (const msg of messages) {
            if (msg.role === 'user') {
                prompt += `<start_of_turn>user\n${msg.content}<end_of_turn>\n`;
            } else if (msg.role === 'assistant') {
                prompt += `<start_of_turn>model\n${msg.content}<end_of_turn>\n`;
            } else if (msg.role === 'system') {
                prompt += `<start_of_turn>user\n[System: ${msg.content}]<end_of_turn>\n`;
            }
        }
        prompt += '<start_of_turn>model\n';
        return prompt;
    }

    isModelLoaded(): boolean {
        return this.context !== null;
    }

    getIsLoading(): boolean {
        return this.isLoading;
    }

    async release(): Promise<void> {
        if (this.context) {
            await this.context.release();
            this.context = null;
        }
    }
}

export default new LlamaService();
