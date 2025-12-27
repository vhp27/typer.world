import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SoundManager } from '../utils/SoundManager';

export interface Settings {
    showVirtualKeyboard: boolean;
    caretStyle: 'line' | 'block' | 'underline' | 'off';
    focusMode: boolean;
    showLiveWpm: boolean;
    soundEnabled: boolean;
    soundVolume: number;
    theme: 'midnight' | 'serika' | 'carbon' | 'cyberpunk';
    keyboardSize: 'small' | 'medium' | 'large';
    keyboardStyle: 'solid' | 'outline' | 'glass';
    includeNumbers: boolean;
    includePunctuation: boolean;
    includeSymbols: boolean;
    stopOnError: boolean;
    forgiveErrors: boolean;
    // Text generation settings
    textCategory: 'common' | 'programming' | 'literature' | 'quotes' | 'words' | 'mixed';
    capitalization: 'lowercase' | 'normal' | 'random';
}

const defaultSettings: Settings = {
    showVirtualKeyboard: true,
    caretStyle: 'line',
    focusMode: false,
    showLiveWpm: true,
    soundEnabled: false,
    soundVolume: 0.5,
    theme: 'midnight',
    keyboardSize: 'medium',
    keyboardStyle: 'solid',
    includeNumbers: false,
    includePunctuation: false,
    includeSymbols: false,
    stopOnError: false,
    forgiveErrors: false,
    // Text generation defaults
    textCategory: 'common',
    capitalization: 'lowercase'
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = 'typer-world-settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...defaultSettings, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
        return defaultSettings;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }, [settings]);

    // Apply theme
    useEffect(() => {
        document.documentElement.className = `theme-${settings.theme}`;
    }, [settings.theme]);

    // Sync sound settings
    useEffect(() => {
        SoundManager.setEnabled(settings.soundEnabled);
        SoundManager.setVolume(settings.soundVolume);
    }, [settings.soundEnabled, settings.soundVolume]);

    const updateSettings = (partial: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};
