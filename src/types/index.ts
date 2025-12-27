export interface KeyStat {
    total: number;
    errors: number;
    speedSum: number;
    count: number;
}

export interface TypingStats {
    wpm: number;
    accuracy: number;
    correct: number;
    errors: number;
    timeLeft?: number | null;
    keyStats?: Record<string, KeyStat>;
    finished?: boolean;
    paused?: boolean;
    timeElapsed?: number; // Added for ResultScreen calculation
}

export type StatsCallback = (stats: TypingStats) => void;

export type KeyCallback = (key: string, status: 'correct' | 'incorrect' | 'neutral') => void;
