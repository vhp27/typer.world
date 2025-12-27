// Quotes for typing tests
export const QUOTES = {
    short: [
        "The only way to do great work is to love what you do.",
        "In the middle of difficulty lies opportunity.",
        "Life is what happens when you're busy making other plans.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "It does not matter how slowly you go as long as you do not stop."
    ],
    medium: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts. The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "The only limit to our realization of tomorrow will be our doubts of today. Let us move forward with strong and active faith.",
        "In three words I can sum up everything I've learned about life: it goes on. What lies behind us and what lies before us are tiny matters compared to what lies within us."
    ],
    long: [
        "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
        "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena."
    ]
};

export const getRandomQuote = (length: 'short' | 'medium' | 'long' = 'medium'): string => {
    const quotes = QUOTES[length];
    return quotes[Math.floor(Math.random() * quotes.length)];
};

// Common English words
export const COMMON_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way"
];

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const PUNCTUATION = ['.', ',', '!', '?', ';', ':', "'", '"'];
const SYMBOLS = ['@', '#', '$', '%', '&', '*', '(', ')', '-', '+', '='];

interface GenerateOptions {
    numbers?: boolean;
    punctuation?: boolean;
    symbols?: boolean;
}

export const generateWordTest = (wordCount: number, options: GenerateOptions = {}): string => {
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
        let word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];

        // Randomly add numbers
        if (options.numbers && Math.random() < 0.15) {
            const num = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
            word = Math.random() < 0.5 ? num + word : word + num;
        }

        // Randomly add punctuation
        if (options.punctuation && Math.random() < 0.1) {
            const punct = PUNCTUATION[Math.floor(Math.random() * PUNCTUATION.length)];
            word = word + punct;
        }

        // Randomly add symbols
        if (options.symbols && Math.random() < 0.08) {
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            word = Math.random() < 0.5 ? symbol + word : word + symbol;
        }

        words.push(word);
    }

    return words.join(' ');
};

export const generateNumbersOnlyTest = (length: number = 50): string => {
    const digits: string[] = [];
    for (let i = 0; i < length; i++) {
        digits.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
        if (i > 0 && i % 4 === 0) digits.push(' '); // Group in 4s
    }
    return digits.join('');
};
