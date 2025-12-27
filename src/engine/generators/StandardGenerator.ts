// Standard text generator - client-side deterministic generation

import { SENTENCES, type SentenceCategory } from '../../data/corpus/sentences';
import { TextProcessor } from '../text-utils';
import { COMMON_WORDS, PROGRAMMING_WORDS, NUMBERS, PUNCTUATION, SYMBOLS } from '../../data/corpus/words';

export interface GeneratorOptions {
    wordCount: number;
    category: SentenceCategory | 'words' | 'mixed';
    includeNumbers: boolean;
    includePunctuation: boolean;
    includeSymbols: boolean;
    capitalization: 'lowercase' | 'normal' | 'random';
}

const DEFAULT_OPTIONS: GeneratorOptions = {
    wordCount: 50,
    category: 'common',
    includeNumbers: false,
    includePunctuation: false,
    includeSymbols: false,
    capitalization: 'lowercase'
};

/**
 * Applies text transformations based on options
 */
const applyTransformations = (
    text: string,
    options: GeneratorOptions
): string => {
    return TextProcessor.process(text, options);
};

/**
 * Generates text from sentence corpus
 */
const generateFromSentences = (
    category: SentenceCategory,
    wordCount: number
): string => {
    const sentences = SENTENCES[category];
    const selectedSentences: string[] = [];
    let currentWordCount = 0;

    // Shuffle sentences for variety
    const shuffled = [...sentences].sort(() => Math.random() - 0.5);

    for (const sentence of shuffled) {
        if (currentWordCount >= wordCount) break;

        selectedSentences.push(sentence);
        currentWordCount += sentence.split(/\s+/).length;
    }

    // If we need more words than available sentences, repeat
    while (currentWordCount < wordCount) {
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        selectedSentences.push(randomSentence);
        currentWordCount += randomSentence.split(/\s+/).length;
    }

    // Join and trim to approximate word count
    const fullText = selectedSentences.join(' ');
    const words = fullText.split(/\s+/);
    return words.slice(0, wordCount).join(' ');
};

/**
 * Generates text from word corpus with optional modifiers
 */
const generateFromWords = (
    options: GeneratorOptions
): string => {
    const wordList = options.category === 'mixed'
        ? [...COMMON_WORDS, ...PROGRAMMING_WORDS]
        : options.category === 'words'
            ? COMMON_WORDS
            : COMMON_WORDS;

    const words: string[] = [];

    for (let i = 0; i < options.wordCount; i++) {
        let word = wordList[Math.floor(Math.random() * wordList.length)];

        // Add numbers
        if (options.includeNumbers && Math.random() < 0.12) {
            const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
            const num2 = Math.random() < 0.3
                ? NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
                : '';
            word = Math.random() < 0.5 ? num + num2 + word : word + num + num2;
        }

        // Add punctuation
        if (options.includePunctuation && Math.random() < 0.1) {
            const punct = PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
            word = word + punct;
        }

        // Add symbols
        if (options.includeSymbols && Math.random() < 0.08) {
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            word = Math.random() < 0.5 ? symbol + word : word + symbol;
        }

        words.push(word);
    }

    return words.join(' ');
};

/**
 * Main generator function
 */
export const generateStandardText = (
    partialOptions: Partial<GeneratorOptions> = {}
): string => {
    const options: GeneratorOptions = { ...DEFAULT_OPTIONS, ...partialOptions };

    let text: string;

    // Check if using sentence-based categories
    if (['common', 'programming', 'literature', 'quotes'].includes(options.category)) {
        text = generateFromSentences(
            options.category as SentenceCategory,
            options.wordCount
        );
    } else {
        // Use word-based generation
        text = generateFromWords(options);
    }

    // Apply transformations
    text = applyTransformations(text, options);

    return text;
};

/**
 * Generate practice text for specific problem keys
 */
export const generatePracticeText = (
    problemKeys: string[],
    wordCount: number = 40
): string => {
    const wordsByChar: Record<string, string[]> = {
        'a': ['about', 'again', 'always', 'away', 'after', 'animal', 'answer', 'area', 'abstract', 'array'],
        'b': ['before', 'between', 'both', 'bring', 'begin', 'build', 'better', 'black', 'boolean', 'break'],
        'c': ['could', 'come', 'change', 'create', 'can', 'center', 'close', 'call', 'class', 'const'],
        'd': ['different', 'does', 'done', 'down', 'during', 'develop', 'day', 'debug', 'default', 'data'],
        'e': ['even', 'every', 'example', 'end', 'each', 'else', 'early', 'enough', 'export', 'error'],
        'f': ['first', 'find', 'follow', 'from', 'for', 'form', 'feel', 'few', 'function', 'false'],
        'g': ['good', 'great', 'give', 'group', 'get', 'going', 'game', 'general', 'global', 'git'],
        'h': ['have', 'here', 'high', 'help', 'home', 'however', 'hand', 'head', 'hook', 'html'],
        'i': ['into', 'important', 'include', 'interest', 'if', 'idea', 'issue', 'increase', 'import', 'interface'],
        'j': ['just', 'job', 'join', 'jump', 'justice', 'journey', 'judge', 'joyful', 'json', 'javascript'],
        'k': ['know', 'keep', 'kind', 'key', 'known', 'knowledge', 'kick', 'king', 'keyword', 'keydown'],
        'l': ['like', 'little', 'long', 'look', 'last', 'life', 'large', 'leave', 'let', 'loop'],
        'm': ['make', 'more', 'much', 'most', 'many', 'might', 'money', 'moment', 'method', 'module'],
        'n': ['now', 'never', 'new', 'need', 'next', 'number', 'nothing', 'name', 'null', 'node'],
        'o': ['only', 'other', 'over', 'out', 'own', 'often', 'once', 'open', 'object', 'operator'],
        'p': ['people', 'place', 'point', 'part', 'problem', 'provide', 'public', 'power', 'promise', 'props'],
        'q': ['question', 'quick', 'quite', 'quality', 'quarter', 'quiet', 'queen', 'quote', 'query', 'queue'],
        'r': ['right', 'really', 'run', 'read', 'result', 'reason', 'require', 'rather', 'return', 'render'],
        's': ['some', 'still', 'state', 'should', 'say', 'same', 'seem', 'several', 'string', 'static'],
        't': ['that', 'their', 'then', 'there', 'think', 'time', 'turn', 'through', 'type', 'true'],
        'u': ['under', 'until', 'use', 'upon', 'usually', 'understand', 'united', 'update', 'undefined', 'union'],
        'v': ['very', 'view', 'value', 'voice', 'various', 'version', 'visit', 'video', 'variable', 'void'],
        'w': ['with', 'would', 'world', 'work', 'want', 'where', 'while', 'without', 'window', 'webpack'],
        'x': ['example', 'exact', 'exist', 'expect', 'explain', 'express', 'extra', 'box', 'export', 'extend'],
        'y': ['year', 'young', 'your', 'you', 'yes', 'yet', 'yourself', 'yesterday', 'yield', 'yarn'],
        'z': ['zero', 'zone', 'size', 'organize', 'realize', 'amazing', 'frozen', 'puzzle', 'lazy', 'zip']
    };

    const practiceWords: string[] = [];

    for (let i = 0; i < wordCount; i++) {
        const problemChar = problemKeys[i % problemKeys.length].toLowerCase();
        const words = wordsByChar[problemChar] || ['the', 'and', 'for'];
        const word = words[Math.floor(Math.random() * words.length)];
        practiceWords.push(word);
    }

    // Shuffle for variety
    for (let i = practiceWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [practiceWords[i], practiceWords[j]] = [practiceWords[j], practiceWords[i]];
    }

    return practiceWords.join(' ');
};
