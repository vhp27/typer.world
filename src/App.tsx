import './App.css'
import { useState, useRef, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { TypingArea } from './components/TypingArea';
import { SettingsModal } from './components/SettingsModal';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Settings, Volume2, VolumeX, Type, ChevronDown } from 'lucide-react';
import { Logo } from './components/Logo';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
import { AboutModal } from './components/AboutModal';

// Wrapper to access settings in header
function AppContent() {
    const [showSettings, setShowSettings] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const { settings, updateSettings } = useSettings();

    // Focus mode state - hide header/footer during active typing
    const [isTypingActive, setIsTypingActive] = useState(false);
    const inactivityTimerRef = useRef<number | null>(null);

    // Listen for typing activity events from TypingArea
    useEffect(() => {
        const handleTypingStart = () => {
            if (settings.focusMode) {
                setIsTypingActive(true);
                // Clear any existing inactivity timer
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                    inactivityTimerRef.current = null;
                }
            }
        };

        const handleTypingPause = () => {
            // Start inactivity timer - header returns after 5 seconds
            if (settings.focusMode && isTypingActive) {
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                }
                inactivityTimerRef.current = window.setTimeout(() => {
                    setIsTypingActive(false);
                }, 5000);
            }
        };

        const handleTypingBlur = () => {
            // Immediately show header when user clicks outside
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
            setIsTypingActive(false);
        };

        const handleTypingEnd = () => {
            // Test finished - show header
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
            setIsTypingActive(false);
        };

        window.addEventListener('typer:typing-start', handleTypingStart);
        window.addEventListener('typer:typing-pause', handleTypingPause);
        window.addEventListener('typer:typing-blur', handleTypingBlur);
        window.addEventListener('typer:typing-end', handleTypingEnd);

        return () => {
            window.removeEventListener('typer:typing-start', handleTypingStart);
            window.removeEventListener('typer:typing-pause', handleTypingPause);
            window.removeEventListener('typer:typing-blur', handleTypingBlur);
            window.removeEventListener('typer:typing-end', handleTypingEnd);
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [settings.focusMode, isTypingActive]);

    // Reset when focus mode is toggled off
    useEffect(() => {
        if (!settings.focusMode) {
            setIsTypingActive(false);
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
        }
    }, [settings.focusMode]);

    const shouldHideUI = settings.focusMode && isTypingActive;

    return (
        <div className="app-container" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            padding: shouldHideUI ? '0.5rem 3rem' : '1.5rem 3rem',
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            transition: 'padding 0.3s ease'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: shouldHideUI ? '0' : '1rem',
                padding: '0.5rem 0',
                opacity: shouldHideUI ? 0 : 1,
                maxHeight: shouldHideUI ? '0' : '60px',
                overflow: shouldHideUI ? 'hidden' : 'visible',
                transition: 'opacity 0.3s ease, max-height 0.3s ease, margin-bottom 0.3s ease',
                pointerEvents: shouldHideUI ? 'none' : 'auto'
            }}>
                {/* Logo */}
                <Logo />

                {/* Quick Controls */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {/* Text Category Dropdown */}
                    <TextCategoryDropdown
                        value={settings.textCategory}
                        onChange={(cat) => updateSettings({ textCategory: cat })}
                    />

                    {/* Sound Toggle */}
                    <button
                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                        style={{
                            background: settings.soundEnabled ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                            border: settings.soundEnabled ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                            color: settings.soundEnabled ? 'var(--primary-color)' : 'var(--subtle-color)',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title={settings.soundEnabled ? 'Sound On' : 'Sound Off'}
                    >
                        {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(true)}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'var(--subtle-color)',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Main */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                <TypingArea />

            </main>

            {/* Footer */}
            <footer style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2.5rem',
                fontSize: '0.75rem',
                color: 'var(--subtle-color)',
                padding: shouldHideUI ? '0.5rem 0' : '1rem 0',
                opacity: shouldHideUI ? 0 : 0.7,
                maxHeight: shouldHideUI ? '0' : '40px',
                overflow: 'hidden',
                transition: 'opacity 0.3s ease, max-height 0.3s ease, padding 0.3s ease',
                pointerEvents: shouldHideUI ? 'none' : 'auto'
            }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <Kbd>tab</Kbd>
                    <span>restart</span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <Kbd>esc</Kbd>
                    <span>end test</span>
                </div>
                <div style={{ opacity: 0.5 }}>v1.5.0</div>

                {/* About Button */}
                <button
                    onClick={() => setShowAbout(true)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: 'inherit',
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                        textDecoration: 'underline'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    about
                </button>
            </footer>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            <AboutModal
                isOpen={showAbout}
                onClose={() => setShowAbout(false)}
            />
        </div>
    );
}

function App() {
    return (
        <HelmetProvider>
            <ErrorBoundary>
                <SettingsProvider>
                    <SEO />
                    <AppContent />
                    <Analytics />
                </SettingsProvider>
            </ErrorBoundary>
        </HelmetProvider>
    );
}

// Text Category Dropdown Component
const TextCategoryDropdown = ({
    value,
    onChange
}: {
    value: string;
    onChange: (cat: 'common' | 'programming' | 'literature' | 'quotes' | 'words') => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const categories = [
        { id: 'common', label: 'Common Words' },
        { id: 'programming', label: 'Programming' },
        { id: 'literature', label: 'Literature' },
        { id: 'quotes', label: 'Quotes' },
        { id: 'words', label: 'Words' }
    ] as const;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLabel = categories.find(c => c.id === value)?.label || 'Common Words';

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'var(--text-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                }}
            >
                <Type size={16} style={{ color: 'var(--primary-color)' }} />
                <span>{currentLabel}</span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    background: 'var(--bg-color)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '4px',
                    zIndex: 100,
                    minWidth: '160px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                onChange(cat.id);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                background: value === cat.id ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                                border: 'none',
                                color: value === cat.id ? 'var(--primary-color)' : 'var(--text-color)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'background 0.15s'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <span style={{
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '0.65rem',
        fontFamily: 'var(--font-mono)'
    }}>
        {children}
    </span>
);

export default App;
