// AI Response Cache - reduces API costs by caching generated text

const CACHE_KEY = 'typer-world-ai-cache';
const MAX_CACHE_SIZE = 50; // Maximum number of cached responses
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheEntry {
    text: string;
    timestamp: number;
    wordCount: number;
    topic?: string;
    style?: string;
}

interface AICache {
    entries: Record<string, CacheEntry>;
}

const loadCache = (): AICache => {
    try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load AI cache:', e);
    }
    return { entries: {} };
};

const saveCache = (cache: AICache): void => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Failed to save AI cache:', e);
    }
};

const generateCacheKey = (wordCount: number, topic?: string, style?: string): string => {
    return `${wordCount}-${topic || 'general'}-${style || 'casual'}`;
};

const cleanOldEntries = (cache: AICache): AICache => {
    const now = Date.now();
    const entries: Record<string, CacheEntry> = {};

    // Keep only valid entries (not expired)
    Object.entries(cache.entries).forEach(([key, entry]) => {
        if (now - entry.timestamp < CACHE_TTL) {
            entries[key] = entry;
        }
    });

    // If still too many, remove oldest
    const keys = Object.keys(entries);
    if (keys.length > MAX_CACHE_SIZE) {
        const sorted = keys.sort((a, b) => entries[a].timestamp - entries[b].timestamp);
        sorted.slice(0, keys.length - MAX_CACHE_SIZE).forEach(key => {
            delete entries[key];
        });
    }

    return { entries };
};

/**
 * Get cached AI response if available
 */
export const getCachedResponse = (wordCount: number, topic?: string, style?: string): string | null => {
    const cache = loadCache();
    const key = generateCacheKey(wordCount, topic, style);
    const entry = cache.entries[key];

    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.text;
    }

    return null;
};

/**
 * Store AI response in cache
 */
export const cacheResponse = (text: string, wordCount: number, topic?: string, style?: string): void => {
    let cache = loadCache();
    cache = cleanOldEntries(cache);

    const key = generateCacheKey(wordCount, topic, style);
    cache.entries[key] = {
        text,
        timestamp: Date.now(),
        wordCount,
        topic,
        style
    };

    saveCache(cache);
};

/**
 * Clear all cached responses
 */
export const clearCache = (): void => {
    localStorage.removeItem(CACHE_KEY);
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { count: number; oldestAge: number } => {
    const cache = loadCache();
    const entries = Object.values(cache.entries);
    const now = Date.now();

    if (entries.length === 0) {
        return { count: 0, oldestAge: 0 };
    }

    const oldest = Math.min(...entries.map(e => e.timestamp));
    return {
        count: entries.length,
        oldestAge: Math.floor((now - oldest) / (60 * 60 * 1000)) // hours
    };
};
