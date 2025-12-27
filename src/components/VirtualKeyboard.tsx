import React, { useEffect, useState } from 'react';
import { TyperEngine } from '../engine/TyperEngine';

const ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

interface VirtualKeyboardProps {
    engine: TyperEngine | null;
    size?: 'small' | 'medium' | 'large';
    style?: 'solid' | 'outline' | 'glass';
}

const SIZE_MAP = {
    small: { key: 36, gap: 4, font: 0.75 },
    medium: { key: 44, gap: 6, font: 0.85 },
    large: { key: 52, gap: 8, font: 1 }
};

export const VirtualKeyboard = React.memo(({
    engine,
    size = 'medium',
    style = 'solid'
}: VirtualKeyboardProps) => {
    const sizeConfig = SIZE_MAP[size];
    const [pressedKey, setPressedKey] = useState<{ key: string; status: 'correct' | 'incorrect' | 'neutral' } | null>(null);

    useEffect(() => {
        if (!engine) return;

        const handleKeyUpdate = (key: string, status: 'correct' | 'incorrect' | 'neutral') => {
            setPressedKey({ key, status });
            setTimeout(() => setPressedKey(null), 100);
        };

        engine.addKeyListener(handleKeyUpdate);

        return () => {
            engine.removeKeyListener(handleKeyUpdate);
        };
    }, [engine]);

    const getKeyStyle = (char: string, isActive: boolean, status?: string) => {
        const base: React.CSSProperties = {
            width: char === ' ' ? sizeConfig.key * 6 : sizeConfig.key,
            height: sizeConfig.key,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${sizeConfig.font}rem`,
            textTransform: 'uppercase',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            userSelect: 'none'
        };

        // Style variants
        if (style === 'solid') {
            return {
                ...base,
                backgroundColor: isActive
                    ? (status === 'correct' ? 'rgba(255,255,255,0.15)' :
                        status === 'incorrect' ? 'rgba(202, 71, 84, 0.5)' : 'rgba(255,255,255,0.15)')
                    : 'rgba(255,255,255,0.03)',
                color: isActive ? 'var(--text-color)' : 'var(--subtle-color)',
                border: '1px solid rgba(255,255,255,0.05)',
                transform: isActive ? 'translateY(2px)' : 'none',
                boxShadow: isActive && status === 'incorrect' ? '0 0 12px var(--error-color)' : 'none'
            };
        } else if (style === 'outline') {
            return {
                ...base,
                backgroundColor: 'transparent',
                color: isActive ? 'var(--text-color)' : 'var(--subtle-color)',
                border: isActive
                    ? (status === 'incorrect' ? '2px solid var(--error-color)' : '2px solid var(--primary-color)')
                    : '1px solid rgba(255,255,255,0.1)',
                transform: isActive ? 'scale(0.95)' : 'none'
            };
        } else { // glass
            return {
                ...base,
                backgroundColor: isActive
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(10px)',
                color: isActive ? 'var(--text-color)' : 'var(--subtle-color)',
                border: '1px solid rgba(255,255,255,0.08)',
                transform: isActive ? 'translateY(1px)' : 'none',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            };
        }
    };

    return (
        <div className="keyboard" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: sizeConfig.gap,
            marginTop: '2.5rem',
            userSelect: 'none',
            opacity: 0.6
        }}>
            {ROWS.map((row, i) => (
                <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: sizeConfig.gap,
                    marginLeft: i === 1 ? sizeConfig.key * 0.3 : i === 2 ? sizeConfig.key * 0.8 : 0
                }}>
                    {row.map((char) => {
                        const isActive = pressedKey?.key.toLowerCase() === char;
                        const status = isActive ? pressedKey?.status : undefined;
                        return (
                            <div key={char} style={getKeyStyle(char, isActive, status)}>
                                {char}
                            </div>
                        );
                    })}
                </div>
            ))}

            {/* Spacebar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: sizeConfig.gap }}>
                <div style={getKeyStyle(' ', pressedKey?.key === ' ', pressedKey?.key === ' ' ? pressedKey?.status : undefined)} />
            </div>

            <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                fontSize: '0.7rem',
                color: 'var(--subtle-color)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                opacity: 0.7
            }}>
                Start typing to begin
            </div>
        </div>
    );
});
