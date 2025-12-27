// AI text generator - calls server-side proxy
// Implementation: Shared Server Pool (Client is thin)
// API key is NEVER exposed to client

import { generateStandardText, type GeneratorOptions } from './StandardGenerator';
import { TextProcessor } from '../text-utils';

export interface AIGeneratorOptions {
    topic?: string;
    wordCount: number;
    style?: 'formal' | 'casual' | 'technical';
}

/**
 * Check if AI mode is available (server endpoint exists)
 */
export const isAIAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/generate', { method: 'GET' });
        return response.ok;
    } catch {
        console.warn('AI endpoint unavailable.');
        return false;
    }
};

/**
 * Generate text via server-side shared pool
 */
export const generateAIText = async (
    options: AIGeneratorOptions,
    fallbackOptions?: Partial<GeneratorOptions>
): Promise<string> => {
    console.log('[AI Client] Requesting text from server pool...');

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();

        if (data.text) {
            console.log(`[AI Client] Received text (Server pool remaining: ${data.poolRemaining})`);
            // Apply transformations locally!
            return applyTransformations(data.text, fallbackOptions);
        }

        throw new Error('No text returned from server');

    } catch (e) {
        console.error('[AI Client] Generation failed:', e);
        console.info('Falling back to standard generator');
        return generateStandardText({
            wordCount: options.wordCount,
            category: options.style === 'technical' ? 'programming' : 'common',
            ...fallbackOptions
        });
    }
};

/**
 * Post-Processing: Inject numbers/symbols if requested
 * This makes settings "instant" without asking AI.
 */
function applyTransformations(text: string, options?: Partial<GeneratorOptions>): string {
    if (!options) return text;
    return TextProcessor.process(text, options);
}


/**
 * Generate practice text 
 */
export const generateAIPracticeText = async (
    problemKeys: string[],
    wordCount: number = 40
): Promise<string | null> => {
    if (!problemKeys.length) return null;

    const keysKey = problemKeys.join(', ');
    const topic = `words containing letters: ${keysKey}. Practice these specific keys.`;

    return generateAIText({
        wordCount,
        topic,
        style: 'casual'
    });
};
