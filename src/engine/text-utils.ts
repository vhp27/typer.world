/**
 * Shared Text Processing Utility
 * Centralizes logic for capitalization, punctuation, and noise injection.
 */

export interface TextProcessingOptions {
    includeNumbers?: boolean;
    includePunctuation?: boolean;
    includeSymbols?: boolean;
    capitalization?: 'lowercase' | 'normal' | 'random';
}

export class TextProcessor {
    /**
     * Main transformation pipeline
     */
    static process(text: string, options: TextProcessingOptions): string {
        let result = text;

        // 1. Strip unwanted characters (if explicitly disabled)
        // Note: For AI mode, we usually request clean text, but this ensures safety.
        if (options.includePunctuation === false) {
            result = result.replace(/[.,!?;:'"()\-]/g, '');
        }

        if (options.includeSymbols === false) {
            result = result.replace(/[@#$%&*+=<>\/\\|_~^]/g, '');
        }

        // 2. Clean up spacing
        result = result.replace(/\s+/g, ' ').trim();

        // 3. Inject noise (Numbers/Symbols) if requested
        // We do this BEFORE capitalization to avoid capitalizing injected chars (though irrelevant for numbers/symbols)
        if (options.includeNumbers || options.includeSymbols) {
            result = this.injectNoise(result, options);
        }

        // 4. Apply capitalization
        result = this.applyCapitalization(result, options.capitalization || 'normal');

        return result;
    }

    /**
     * Injects numbers and symbols into the text
     */
    private static injectNoise(text: string, options: TextProcessingOptions): string {
        const chars = text.split('');

        if (options.includeNumbers) {
            const count = Math.ceil(chars.length * 0.05); // 5% density
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * chars.length);
                if (chars[idx] !== ' ') {
                    chars[idx] = Math.floor(Math.random() * 10).toString();
                }
            }
        }

        if (options.includeSymbols) {
            const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const count = Math.ceil(chars.length * 0.04); // 4% density
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * chars.length);
                if (chars[idx] !== ' ') {
                    chars[idx] = symbols[Math.floor(Math.random() * symbols.length)];
                }
            }
        }

        return chars.join('');
    }

    /**
     * Applies capitalization rules
     */
    private static applyCapitalization(text: string, mode: 'lowercase' | 'normal' | 'random'): string {
        switch (mode) {
            case 'lowercase':
                return text.toLowerCase();
            case 'random':
                return text
                    .split('')
                    .map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase())
                    .join('');
            case 'normal':
            default:
                return text;
        }
    }
}
