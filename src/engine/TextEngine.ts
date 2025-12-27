// Text Engine - Main orchestrator for text generation
// Routes between Standard and AI modes

import { generateStandardText, generatePracticeText, type GeneratorOptions } from './generators/StandardGenerator';
import { generateAIText, isAIAvailable, type AIGeneratorOptions } from './generators/AIGenerator';
import type { SentenceCategory } from '../data/corpus/sentences';

export type TextMode = 'standard' | 'ai';
export type TextCategory = SentenceCategory | 'words' | 'mixed';
export type CapitalizationMode = 'lowercase' | 'normal' | 'random';

export interface TextEngineOptions {
    mode: TextMode;
    wordCount: number;
    category: TextCategory;
    includeNumbers: boolean;
    includePunctuation: boolean;
    includeSymbols: boolean;
    capitalization: CapitalizationMode;
    aiTopic?: string;
}

const DEFAULT_OPTIONS: TextEngineOptions = {
    mode: 'standard',
    wordCount: 50,
    category: 'common',
    includeNumbers: false,
    includePunctuation: false,
    includeSymbols: false,
    capitalization: 'lowercase'
};

/**
 * Main text generation function
 */
export const generateText = async (
    partialOptions: Partial<TextEngineOptions> = {}
): Promise<string> => {
    const options: TextEngineOptions = { ...DEFAULT_OPTIONS, ...partialOptions };

    if (options.mode === 'ai') {
        // Check if AI is available first
        const aiAvailable = await isAIAvailable();

        if (aiAvailable) {
            const aiOptions: AIGeneratorOptions = {
                wordCount: options.wordCount,
                topic: options.aiTopic,
                style: options.category === 'programming' ? 'technical' : 'casual'
            };

            return generateAIText(aiOptions, {
                category: options.category,
                includeNumbers: options.includeNumbers,
                includePunctuation: options.includePunctuation,
                includeSymbols: options.includeSymbols,
                capitalization: options.capitalization
            });
        }

        // Fall through to standard if AI unavailable
        console.info('AI mode requested but unavailable, using standard mode');
    }

    // Standard mode
    const generatorOptions: GeneratorOptions = {
        wordCount: options.wordCount,
        category: options.category,
        includeNumbers: options.includeNumbers,
        includePunctuation: options.includePunctuation,
        includeSymbols: options.includeSymbols,
        capitalization: options.capitalization
    };

    return generateStandardText(generatorOptions);
};

/**
 * Generate practice text for problem keys
 */
export const generateMistakePractice = (
    problemKeys: string[],
    wordCount: number = 40
): string => {
    return generatePracticeText(problemKeys, wordCount);
};

/**
 * Synchronous text generation (standard mode only)
 * Useful for initial render without async
 */
export const generateTextSync = (
    partialOptions: Partial<Omit<TextEngineOptions, 'mode'>> = {}
): string => {
    const options = { ...DEFAULT_OPTIONS, ...partialOptions, mode: 'standard' as const };

    return generateStandardText({
        wordCount: options.wordCount,
        category: options.category,
        includeNumbers: options.includeNumbers,
        includePunctuation: options.includePunctuation,
        includeSymbols: options.includeSymbols,
        capitalization: options.capitalization
    });
};

/**
 * Check if AI mode is available
 */
export const checkAIAvailability = isAIAvailable;

// Re-export types
export type { GeneratorOptions } from './generators/StandardGenerator';
export type { AIGeneratorOptions } from './generators/AIGenerator';
