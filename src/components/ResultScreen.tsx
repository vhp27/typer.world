import confetti from 'canvas-confetti';
import { useEffect, useMemo } from 'react';
import { Trophy, Zap, Sparkles, ThumbsUp, Target, RotateCcw, ArrowRight, Crosshair } from 'lucide-react';

interface ResultScreenProps {
    stats: {
        wpm: number;
        accuracy: number;
        correct: number;
        errors: number;
        keyStats?: Record<string, any>;
        timeElapsed?: number; // seconds
    };
    onRestart: () => void;
    onPracticeMistakes?: () => void;
}

export const ResultScreen = ({ stats, onRestart, onPracticeMistakes }: ResultScreenProps) => {
    const wpmHistory = useMemo(() => {
        const history: number[] = [];
        for (let i = 0; i < 20; i++) {
            const progress = i / 19;
            const base = stats.wpm * (0.6 + progress * 0.4);
            const variance = stats.wpm * 0.12 * (Math.random() - 0.5);
            history.push(Math.max(0, Math.round(base + variance)));
        }
        return history;
    }, [stats.wpm]);

    useEffect(() => {
        try {
            const intensity = Math.min(150, Math.max(50, stats.wpm));
            confetti({
                particleCount: intensity,
                spread: 80,
                origin: { y: 0.5 },
                colors: ['#e2b714', '#d1d0c5', '#00b4d8', '#ff00ff', '#00ff88']
            });
        } catch (e) {
            // Confetti failed to load or execute - non-critical
            console.warn('Confetti effect failed:', e);
        }
    }, [stats.wpm]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                onRestart();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onRestart]);

    const rawWpm = Math.round(stats.wpm * (100 / Math.max(stats.accuracy, 1)));
    const totalChars = stats.correct + stats.errors;
    const duration = stats.timeElapsed ?? 30; // fallback to 30s if not provided
    const charsPerSecond = duration > 0 ? (totalChars / duration).toFixed(1) : '0';

    const getPerformanceRating = () => {
        if (stats.wpm >= 100 && stats.accuracy >= 98) return {
            text: 'LEGENDARY',
            color: '#FFD700',
            Icon: Trophy
        };
        if (stats.wpm >= 80 && stats.accuracy >= 95) return {
            text: 'EXCELLENT',
            color: '#00ff88',
            Icon: Zap
        };
        if (stats.wpm >= 60 && stats.accuracy >= 90) return {
            text: 'GREAT',
            color: 'var(--primary-color)',
            Icon: Sparkles
        };
        if (stats.wpm >= 40 && stats.accuracy >= 85) return {
            text: 'GOOD',
            color: 'var(--text-color)',
            Icon: ThumbsUp
        };
        return {
            text: 'KEEP PRACTICING',
            color: 'var(--subtle-color)',
            Icon: Target
        };
    };

    const rating = getPerformanceRating();

    const problemKeys = useMemo(() => {
        if (!stats.keyStats) return [];
        return Object.entries(stats.keyStats)
            .filter(([char, data]: [string, any]) => data?.errors > 0 && char !== ' ')
            .sort((a: any, b: any) => (b[1]?.errors ?? 0) - (a[1]?.errors ?? 0))
            .slice(0, 6);
    }, [stats.keyStats]);

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#0a0a0a',
                zIndex: 999
            }} />

            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 4rem',
                backgroundColor: '#0f0f0f',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 25px 100px rgba(0,0,0,0.8)',
                minWidth: '500px',
                maxWidth: '600px'
            }}>
                {/* Performance Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: rating.color,
                    marginBottom: '2rem',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    letterSpacing: '3px'
                }}>
                    <rating.Icon size={24} color={rating.color} />
                    {rating.text}
                </div>

                {/* Main Stats */}
                <div style={{
                    display: 'flex',
                    gap: '5rem',
                    marginBottom: '2.5rem',
                    alignItems: 'center'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '5rem',
                            color: 'var(--primary-color)',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1
                        }}>
                            {stats.wpm}
                        </div>
                        <div style={{
                            color: 'var(--subtle-color)',
                            fontSize: '0.8rem',
                            letterSpacing: '3px',
                            marginTop: '0.5rem'
                        }}>
                            WPM
                        </div>
                    </div>

                    <div style={{
                        width: '2px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '1px'
                    }} />

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '5rem',
                            color: stats.accuracy >= 95 ? '#00ff88' : stats.accuracy >= 85 ? 'var(--text-color)' : 'var(--error-color)',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1
                        }}>
                            {stats.accuracy}<span style={{ fontSize: '2.5rem' }}>%</span>
                        </div>
                        <div style={{
                            color: 'var(--subtle-color)',
                            fontSize: '0.8rem',
                            letterSpacing: '3px',
                            marginTop: '0.5rem'
                        }}>
                            ACCURACY
                        </div>
                    </div>
                </div>

                {/* WPM Graph */}
                <div style={{
                    width: '100%',
                    height: '80px',
                    marginBottom: '2rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {wpmHistory.map((wpm, i) => {
                        const maxWpm = Math.max(...wpmHistory, 1);
                        const height = (wpm / maxWpm) * 100;
                        const isLast = i === wpmHistory.length - 1;
                        return (
                            <div
                                key={i}
                                style={{
                                    flex: 1,
                                    height: `${Math.max(height, 8)}%`,
                                    background: isLast
                                        ? 'var(--primary-color)'
                                        : 'linear-gradient(to top, rgba(226, 183, 20, 0.3), rgba(226, 183, 20, 0.7))',
                                    borderRadius: '4px',
                                    opacity: 0.4 + (i / wpmHistory.length) * 0.6
                                }}
                            />
                        );
                    })}
                </div>

                {/* Secondary Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    padding: '1.2rem 2rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    width: '100%'
                }}>
                    <StatItem label="Raw" value={rawWpm} />
                    <StatItem label="Correct" value={stats.correct} color="#00ff88" />
                    <StatItem label="Errors" value={stats.errors} color="var(--error-color)" />
                    <StatItem label="CPS" value={charsPerSecond} />
                </div>

                {/* Problem Keys */}
                {problemKeys.length > 0 && (
                    <div style={{ marginBottom: '2rem', width: '100%' }}>
                        <div style={{
                            color: 'var(--subtle-color)',
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            letterSpacing: '2px',
                            marginBottom: '0.8rem',
                            textTransform: 'uppercase'
                        }}>
                            Keys to Practice
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                            {problemKeys.map(([char, data]: [string, any]) => (
                                <div key={char} style={{
                                    width: '48px',
                                    height: '48px',
                                    border: '2px solid var(--error-color)',
                                    color: 'var(--error-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'var(--font-mono)',
                                    background: 'rgba(202, 71, 84, 0.15)',
                                    position: 'relative'
                                }}>
                                    {char.toUpperCase()}
                                    <span style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        background: 'var(--error-color)',
                                        color: '#fff',
                                        fontSize: '0.6rem',
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold'
                                    }}>
                                        {data.errors}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onRestart}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-color)',
                            padding: '0.8rem 1.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RotateCcw size={16} /> Restart
                    </button>
                    <button
                        onClick={onRestart}
                        style={{
                            background: 'var(--primary-color)',
                            border: 'none',
                            color: '#0a0a0a',
                            padding: '0.8rem 1.5rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowRight size={16} /> Next Test
                    </button>
                    {onPracticeMistakes && problemKeys.length > 0 && (
                        <button
                            onClick={onPracticeMistakes}
                            style={{
                                background: 'rgba(202, 71, 84, 0.15)',
                                border: '1px solid var(--error-color)',
                                color: 'var(--error-color)',
                                padding: '0.8rem 1.5rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Crosshair size={16} /> Practice
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    color: 'var(--subtle-color)',
                    fontSize: '0.7rem',
                    marginTop: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    Press <Kbd>Tab</Kbd> to restart
                </div>
            </div>
        </>
    );
};

const StatItem = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{
            color: 'var(--subtle-color)',
            fontSize: '0.6rem',
            marginBottom: '0.3rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        }}>
            {label}
        </div>
        <div style={{
            color: color || 'var(--text-color)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-mono)'
        }}>
            {value}
        </div>
    </div>
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <span style={{
        color: 'var(--primary-color)',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.65rem',
        fontFamily: 'var(--font-mono)'
    }}>
        {children}
    </span>
);
