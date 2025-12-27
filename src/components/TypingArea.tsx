import { useEffect, useRef, useState, useCallback } from 'react';
import { TyperEngine } from '../engine/TyperEngine';
import { generateTextSync, generateMistakePractice, generateText } from '../engine/TextEngine';
import { VirtualKeyboard } from './VirtualKeyboard';
import { ResultScreen } from './ResultScreen';
import { CustomTextModal } from './CustomTextModal';
import { useSettings } from '../context/SettingsContext';
import { SoundManager } from '../utils/SoundManager';
import { Sparkles, Loader2 } from 'lucide-react';

type TestType = 'time' | 'words' | 'custom';
type TimeMode = 15 | 30 | 60;
type WordMode = 25 | 50 | 100;

export const TypingArea = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<TyperEngine | null>(null);
    const { settings } = useSettings();

    const [stats, setStats] = useState<any>({ wpm: 0, accuracy: 100, timeLeft: null, correct: 0, errors: 0, keyStats: {} });
    const [isFocused, setIsFocused] = useState(true);
    const [lastKeyPress, setLastKeyPress] = useState<{ key: string, status: 'correct' | 'incorrect' | 'neutral' } | null>(null);

    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [showCustomModal, setShowCustomModal] = useState(false);

    const [testType, setTestType] = useState<TestType>('time');
    const [timeMode, setTimeMode] = useState<TimeMode>(30);
    const [wordMode, setWordMode] = useState<WordMode>(25);

    // AI Mode state
    const [aiEnabled, setAiEnabled] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Inactivity timer for pausing
    const inactivityPauseRef = useRef<number | null>(null);

    const getWordCount = useCallback(() => {
        if (testType === 'words') return wordMode;
        if (testType === 'time') {
            // For AI mode, optimize word count to prevent timeouts while ensuring enough text
            // Estimate regular typing speed ~60-100wpm. 
            // 15s -> 40 words, 30s -> 80 words, 60s -> 160 words
            if (aiEnabled) {
                return Math.max(40, Math.ceil(timeMode * 3));
            }
            return 200; // Standard mode is instant, so 200 is fine buffer
        }
        return 50;
    }, [testType, wordMode, timeMode, aiEnabled]);

    const generateTextContent = useCallback(async (): Promise<string> => {
        const wordCount = getWordCount();

        if (aiEnabled) {
            // Use async AI generation
            return generateText({
                mode: 'ai',
                wordCount,
                category: settings.textCategory,
                includeNumbers: settings.includeNumbers,
                includePunctuation: settings.includePunctuation,
                includeSymbols: settings.includeSymbols,
                capitalization: settings.capitalization
            });
        }

        // Use sync standard generation
        return generateTextSync({
            wordCount,
            category: settings.textCategory,
            includeNumbers: settings.includeNumbers,
            includePunctuation: settings.includePunctuation,
            includeSymbols: settings.includeSymbols,
            capitalization: settings.capitalization
        });
    }, [aiEnabled, getWordCount, settings.textCategory, settings.includeNumbers, settings.includePunctuation, settings.includeSymbols, settings.capitalization]);

    const startTest = useCallback(async (customText?: string) => {
        if (!engineRef.current) return;

        setIsGenerating(true);

        try {
            const text = customText || await generateTextContent();

            engineRef.current.reset();

            if (testType === 'time') {
                engineRef.current.setTimeLimit(timeMode);
                engineRef.current.setWordLimit(0);
            } else {
                engineRef.current.setTimeLimit(0);
                engineRef.current.setWordLimit(0);
            }

            // Apply typing assist settings
            engineRef.current.setStopOnError(settings.stopOnError);
            engineRef.current.setForgiveErrors(settings.forgiveErrors);

            engineRef.current.loadTest(text);

            setStats({ wpm: 0, accuracy: 100, timeLeft: testType === 'time' ? timeMode : null, correct: 0, errors: 0, keyStats: {} });
            setGameState('idle');
            setIsFocused(true);
        } finally {
            setIsGenerating(false);
        }
    }, [testType, timeMode, generateTextContent, settings.stopOnError, settings.forgiveErrors]);

    const handleCustomText = useCallback((text: string) => {
        startTest(text);
    }, [startTest]);

    const practiceMistakes = useCallback(async () => {
        const keyStats = stats.keyStats;
        if (!keyStats || Object.keys(keyStats).length === 0) return;

        // Get problem keys, excluding space
        const problemKeys = Object.entries(keyStats)
            .filter(([char, data]: any) => data?.errors > 0 && char !== ' ')
            .sort((a: any, b: any) => (b[1]?.errors ?? 0) - (a[1]?.errors ?? 0))
            .map(([key]) => key);

        if (problemKeys.length === 0) return;

        if (aiEnabled) {
            // Try AI-powered practice generation
            setIsGenerating(true);
            try {
                const { generateAIPracticeText } = await import('../engine/generators/AIGenerator');
                const aiPracticeText = await generateAIPracticeText(problemKeys, 40);

                if (aiPracticeText) {
                    await startTest(aiPracticeText);
                    return;
                }
            } catch (e) {
                console.warn('AI practice generation failed, using standard:', e);
            } finally {
                setIsGenerating(false);
            }
        }

        // Fallback to standard practice text
        const practiceText = generateMistakePractice(problemKeys, 40);
        startTest(practiceText);
    }, [stats, startTest, aiEnabled]);

    // Initialize engine
    useEffect(() => {
        if (containerRef.current && !engineRef.current) {
            engineRef.current = new TyperEngine(containerRef.current);

            engineRef.current.subscribe((s: any) => {
                setStats({
                    wpm: s.wpm,
                    accuracy: s.accuracy,
                    timeLeft: s.timeLeft,
                    correct: s.correct,
                    errors: s.errors,
                    keyStats: s.keyStats || {}
                });

                if (s.finished) {
                    setGameState('finished');
                    // Dispatch typing end event for Focus Mode
                    window.dispatchEvent(new CustomEvent('typer:typing-end'));
                    if (settings.soundEnabled) {
                        SoundManager.playSuccess();
                    }
                }
            }, (key, status) => {
                setLastKeyPress({ key, status });
                setTimeout(() => setLastKeyPress(null), 100);

                if (settings.soundEnabled) {
                    if (status === 'incorrect') {
                        SoundManager.playError();
                    } else {
                        SoundManager.playKey();
                    }
                }
            });

            startTest();
        }
    }, []);

    // Restart on mode change
    useEffect(() => {
        if (engineRef.current) {
            startTest();
        }
    }, [testType, timeMode, wordMode, settings.includeNumbers, settings.includePunctuation, settings.includeSymbols, aiEnabled]);

    // Click outside detection - blur and reset WITHOUT showing results
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const wrapper = wrapperRef.current;
            const target = e.target as HTMLElement;

            // Don't blur if clicking modals or settings
            if (target.closest('[data-modal]') || target.closest('header') || target.closest('footer')) {
                return;
            }

            if (wrapper && !wrapper.contains(target)) {
                setIsFocused(false);
                // Dispatch blur event for Focus Mode
                window.dispatchEvent(new CustomEvent('typer:typing-blur'));

                // Clear pause timer
                if (inactivityPauseRef.current) {
                    clearTimeout(inactivityPauseRef.current);
                    inactivityPauseRef.current = null;
                }

                if (gameState === 'playing') {
                    // Reset directly without triggering results
                    engineRef.current?.reset();
                    setGameState('idle');
                    // Regenerate test
                    startTest();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [gameState, startTest]);

    // Global keyboard handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                // Clear pause timer on restart
                if (inactivityPauseRef.current) {
                    clearTimeout(inactivityPauseRef.current);
                    inactivityPauseRef.current = null;
                }
                startTest();
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                if (gameState === 'playing') {
                    if (inactivityPauseRef.current) {
                        clearTimeout(inactivityPauseRef.current);
                        inactivityPauseRef.current = null;
                    }
                    engineRef.current?.forceFinish();
                    setGameState('finished');
                }
                return;
            }

            if (!isFocused || gameState === 'finished' || isGenerating) return;

            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }

            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === 'Shift' || e.key === 'CapsLock') return;

            // Clear existing pause timer
            if (inactivityPauseRef.current) {
                clearTimeout(inactivityPauseRef.current);
            }

            engineRef.current?.handleInput(e.key);

            if (gameState === 'idle') {
                setGameState('playing');
            }

            // Start new inactivity pause timer (3 seconds)
            inactivityPauseRef.current = window.setTimeout(() => {
                if (gameState === 'playing') {
                    engineRef.current?.pause();
                }
            }, 3000);

            // Always dispatch typing-start for Focus Mode (re-hides header)
            window.dispatchEvent(new CustomEvent('typer:typing-start'));
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (inactivityPauseRef.current) {
                clearTimeout(inactivityPauseRef.current);
            }
        };
    }, [isFocused, gameState, startTest, isGenerating]);

    // Show timer in focus mode, hide mode selector and other stats
    const showStats = !settings.focusMode || gameState !== 'playing';
    const showTimer = gameState === 'playing' && testType === 'time'; // Always show timer when playing

    return (
        <>
            <div
                ref={wrapperRef}
                className="typing-wrapper"
                style={{
                    width: '100%',
                    maxWidth: '1000px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0 2rem'
                }}
                onClick={() => setIsFocused(true)}
            >
                {/* Mode Selector */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: 'var(--subtle-color)',
                    fontSize: '0.85rem',
                    alignItems: 'center',
                    opacity: showStats ? 1 : 0.2,
                    transition: 'opacity 0.3s'
                }}>
                    {/* Time buttons */}
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {([15, 30, 60] as TimeMode[]).map((m) => (
                            <ModeButton
                                key={m}
                                label={`${m}s`}
                                active={testType === 'time' && timeMode === m}
                                onClick={() => { setTestType('time'); setTimeMode(m); }}
                            />
                        ))}
                    </div>

                    <Divider />

                    {/* Word buttons */}
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {([25, 50, 100] as WordMode[]).map((w) => (
                            <ModeButton
                                key={w}
                                label={`${w}w`}
                                active={testType === 'words' && wordMode === w}
                                onClick={() => { setTestType('words'); setWordMode(w); }}
                            />
                        ))}
                    </div>

                    <Divider />

                    <ModeButton
                        label="custom"
                        active={testType === 'custom'}
                        onClick={() => setShowCustomModal(true)}
                        accent
                    />

                    <Divider />

                    {/* AI Mode Toggle */}
                    <button
                        onClick={() => setAiEnabled(!aiEnabled)}
                        style={{
                            background: aiEnabled ? 'rgba(var(--primary-rgb), 0.15)' : 'none',
                            border: aiEnabled ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                            color: aiEnabled ? 'var(--primary-color)' : 'var(--subtle-color)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            fontWeight: aiEnabled ? 'bold' : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: aiEnabled ? '0 0 12px rgba(var(--primary-rgb), 0.3)' : 'none'
                        }}
                        title={aiEnabled ? 'AI Mode: ON - Generates unique text' : 'AI Mode: OFF - Uses standard corpus'}
                    >
                        <Sparkles size={14} />
                        AI
                    </button>
                </div>

                {/* Stats HUD */}
                <div style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '1rem',
                    padding: '0 0.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
                        {/* Timer - always visible when playing timed test */}
                        {showTimer && stats.timeLeft !== null && (
                            <div style={{
                                fontSize: '2.5rem',
                                color: stats.timeLeft < 10 ? 'var(--error-color)' : 'var(--primary-color)',
                                fontWeight: 'bold',
                                fontFamily: 'var(--font-mono)',
                                minWidth: '80px',
                                transition: 'opacity 0.3s'
                            }}>
                                {stats.timeLeft}
                            </div>
                        )}
                        {/* Live WPM - hidden in focus mode */}
                        {settings.showLiveWpm && gameState === 'playing' && !settings.focusMode && (
                            <div style={{ fontSize: '1.4rem', color: 'var(--subtle-color)', minWidth: '80px' }}>
                                {stats.wpm} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>wpm</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Typing Box */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: isFocused ? '0 0 40px rgba(0,0,0,0.3)' : 'none',
                    transition: 'all 0.3s'
                }}>
                    {gameState === 'finished' && (
                        <ResultScreen
                            stats={stats}
                            onRestart={() => startTest()}
                            onPracticeMistakes={practiceMistakes}
                        />
                    )}

                    <div
                        id="typing-container"
                        ref={containerRef}
                        tabIndex={0}
                        style={{
                            fontSize: '1.6rem',
                            lineHeight: '1.7',
                            outline: 'none',
                            width: '100%',
                            position: 'relative',
                            height: '150px',
                            maxHeight: '150px',
                            overflow: 'auto',
                            opacity: isFocused && gameState !== 'finished' && !isGenerating ? 1 : 0.3,
                            filter: !isFocused ? 'blur(4px)' : gameState === 'finished' ? 'blur(4px)' : 'none',
                            transition: 'opacity 0.3s, filter 0.3s',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.02em',
                            userSelect: 'none'
                        }}
                    />

                    {/* Loading overlay for AI generation */}
                    {isGenerating && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '16px',
                            gap: '0.8rem'
                        }}>
                            <Loader2 size={32} color="var(--primary-color)" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>Generating with AI...</span>
                        </div>
                    )}

                    {/* Click to focus overlay */}
                    {!isFocused && gameState !== 'finished' && !isGenerating && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '16px',
                            cursor: 'pointer'
                        }}>
                            <span style={{ color: 'var(--text-color)', fontSize: '1rem' }}>
                                Click to focus
                            </span>
                        </div>
                    )}
                </div>

                {/* Virtual Keyboard */}
                {settings.showVirtualKeyboard && (
                    <VirtualKeyboard
                        pressedKey={lastKeyPress}
                        size={settings.keyboardSize}
                        style={settings.keyboardStyle}
                    />
                )}
            </div>

            <CustomTextModal
                isOpen={showCustomModal}
                onClose={() => setShowCustomModal(false)}
                onSubmit={handleCustomText}
            />

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

// Helper components
const ModeButton = ({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent?: boolean }) => (
    <button
        onClick={onClick}
        style={{
            background: active ? 'var(--text-color)' : 'none',
            border: accent && !active ? '1px solid var(--primary-color)' : 'none',
            color: active ? 'var(--bg-color)' : accent ? 'var(--primary-color)' : 'inherit',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '5px 12px',
            borderRadius: '6px',
            transition: 'all 0.15s',
            fontWeight: active ? 'bold' : 'normal'
        }}
    >
        {label}
    </button>
);

const Divider = () => (
    <div style={{ width: '1px', height: '1rem', background: 'rgba(255,255,255,0.1)' }} />
);
