// Expanded word corpus for typing practice

export const COMMON_WORDS = [
    // Basic words (original 80)
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    // Extended common words (120 more)
    "new", "want", "because", "any", "these", "give", "day", "most", "us", "very",
    "thing", "man", "world", "life", "hand", "part", "child", "eye", "woman", "place",
    "case", "week", "company", "system", "program", "question", "government", "number", "night", "point",
    "home", "water", "room", "mother", "area", "money", "story", "fact", "month", "lot",
    "right", "study", "book", "word", "business", "issue", "side", "kind", "head", "house",
    "service", "friend", "father", "power", "hour", "game", "line", "end", "member", "law",
    "car", "city", "community", "name", "president", "team", "minute", "idea", "kid", "body",
    "information", "nothing", "ago", "lead", "social", "understand", "whether", "watch", "together", "follow",
    "around", "parent", "stop", "face", "anything", "create", "public", "already", "speak", "others",
    "read", "level", "allow", "add", "office", "spend", "door", "health", "person", "art",
    "sure", "such", "war", "history", "party", "within", "grow", "result", "open", "change",
    "morning", "walk", "reason", "low", "win", "research", "girl", "guy", "early", "food"
];

export const PROGRAMMING_WORDS = [
    "function", "variable", "const", "let", "class", "interface", "type", "export", "import", "return",
    "async", "await", "promise", "callback", "array", "object", "string", "number", "boolean", "null",
    "undefined", "void", "typeof", "instanceof", "extends", "implements", "static", "public", "private", "protected",
    "constructor", "method", "property", "parameter", "argument", "default", "module", "package", "namespace", "abstract",
    "virtual", "override", "final", "enum", "switch", "case", "break", "continue", "throw", "catch",
    "try", "finally", "error", "exception", "debug", "console", "logging", "testing", "unit", "integration",
    "component", "service", "controller", "model", "view", "template", "render", "hook", "state", "props",
    "context", "reducer", "action", "dispatch", "store", "selector", "middleware", "router", "route", "path",
    "request", "response", "header", "body", "query", "param", "endpoint", "api", "rest", "graphql",
    "schema", "mutation", "subscription", "resolver", "database", "table", "column", "row", "index", "query"
];

export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PUNCTUATION = ['.', ',', '!', '?', ';', ':', "'", '"', '-', '(', ')'];

export const SYMBOLS = ['@', '#', '$', '%', '&', '*', '+', '=', '<', '>', '/', '\\', '|', '_', '~', '^'];

export interface WordCorpus {
    common: string[];
    programming: string[];
}

export const WORDS: WordCorpus = {
    common: COMMON_WORDS,
    programming: PROGRAMMING_WORDS
};

export const getRandomWords = (
    corpus: 'common' | 'programming' | 'mixed',
    count: number
): string[] => {
    let wordList: string[];

    if (corpus === 'mixed') {
        wordList = [...COMMON_WORDS, ...PROGRAMMING_WORDS];
    } else {
        wordList = WORDS[corpus];
    }

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
        result.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }
    return result;
};
