import { useSettings } from '../context/SettingsContext';
import { Settings, X, Palette, Keyboard, Eye } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { settings, updateSettings } = useSettings();

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={handleBackdropClick}
        >
            <div style={{
                background: 'var(--bg-color)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                width: '520px',
                maxHeight: '85vh',
                overflowY: 'auto',
                color: 'var(--text-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.4rem' }}>
                        <Settings size={22} color="var(--primary-color)" /> Settings
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--subtle-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* APPEARANCE */}
                <Section title="APPEARANCE" icon={<Palette size={16} />}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Label>Theme</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                            {(['midnight', 'serika', 'carbon', 'cyberpunk'] as const).map(theme => (
                                <ThemeButton
                                    key={theme}
                                    name={theme}
                                    isActive={settings.theme === theme}
                                    onClick={() => updateSettings({ theme })}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Caret Style</Label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {(['line', 'block', 'underline', 'off'] as const).map(style => (
                                <ToggleButton
                                    key={style}
                                    label={style.charAt(0).toUpperCase() + style.slice(1)}
                                    isActive={settings.caretStyle === style}
                                    onClick={() => updateSettings({ caretStyle: style })}
                                />
                            ))}
                        </div>
                    </div>
                </Section>

                {/* BEHAVIOR */}
                <Section title="BEHAVIOR" icon={<Eye size={16} />}>
                    <SettingRow
                        label="Focus Mode"
                        description="Hide UI while typing"
                        value={settings.focusMode}
                        onChange={(v) => updateSettings({ focusMode: v })}
                    />
                    <SettingRow
                        label="Live WPM"
                        description="Show speed counter while typing"
                        value={settings.showLiveWpm}
                        onChange={(v) => updateSettings({ showLiveWpm: v })}
                    />
                    <SettingRow
                        label="Stop on Error"
                        description="Cursor stops until correct key is pressed"
                        value={settings.stopOnError}
                        onChange={(v) => updateSettings({ stopOnError: v })}
                    />
                    <SettingRow
                        label="Forgive Errors"
                        description="Auto-fix wrong characters and skips"
                        value={settings.forgiveErrors}
                        onChange={(v) => updateSettings({ forgiveErrors: v })}
                    />
                </Section>

                {/* TEXT GENERATION */}
                <Section title="TEXT GENERATION" icon={<Keyboard size={16} />}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Label>Capitalization</Label>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {(['lowercase', 'normal', 'random'] as const).map(cap => (
                                <ToggleButton
                                    key={cap}
                                    label={cap.charAt(0).toUpperCase() + cap.slice(1)}
                                    isActive={settings.capitalization === cap}
                                    onClick={() => updateSettings({ capitalization: cap })}
                                />
                            ))}
                        </div>
                    </div>

                    <SettingRow
                        label="Include Numbers"
                        description="Add digits to test text"
                        value={settings.includeNumbers}
                        onChange={(v) => updateSettings({ includeNumbers: v })}
                    />
                    <SettingRow
                        label="Include Punctuation"
                        description="Add .,!? and similar"
                        value={settings.includePunctuation}
                        onChange={(v) => updateSettings({ includePunctuation: v })}
                    />
                    <SettingRow
                        label="Include Symbols"
                        description="Add @#$% and similar"
                        value={settings.includeSymbols}
                        onChange={(v) => updateSettings({ includeSymbols: v })}
                    />
                </Section>

                {/* KEYBOARD & SOUND */}
                <Section title="KEYBOARD & SOUND" icon={<Keyboard size={16} />}>
                    <SettingRow
                        label="Show Virtual Keyboard"
                        description=""
                        value={settings.showVirtualKeyboard}
                        onChange={(v) => updateSettings({ showVirtualKeyboard: v })}
                    />

                    {settings.showVirtualKeyboard && (
                        <>
                            <div style={{ marginTop: '0.8rem', marginBottom: '0.8rem' }}>
                                <Label>Size</Label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {(['small', 'medium', 'large'] as const).map(size => (
                                        <ToggleButton
                                            key={size}
                                            label={size.charAt(0).toUpperCase() + size.slice(1)}
                                            isActive={settings.keyboardSize === size}
                                            onClick={() => updateSettings({ keyboardSize: size })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <Label>Style</Label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {(['solid', 'outline', 'glass'] as const).map(style => (
                                        <ToggleButton
                                            key={style}
                                            label={style.charAt(0).toUpperCase() + style.slice(1)}
                                            isActive={settings.keyboardStyle === style}
                                            onClick={() => updateSettings({ keyboardStyle: style })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <SettingRow
                            label="Key Sounds"
                            description="Play sounds when typing"
                            value={settings.soundEnabled}
                            onChange={(v) => updateSettings({ soundEnabled: v })}
                        />

                        {settings.soundEnabled && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--subtle-color)' }}>Volume</span>
                                    <span style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}>
                                        {Math.round(settings.soundVolume * 100)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.soundVolume * 100}
                                    onChange={(e) => updateSettings({ soundVolume: parseInt(e.target.value) / 100 })}
                                    style={{
                                        width: '100%',
                                        accentColor: 'var(--primary-color)',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </Section>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--subtle-color)', fontSize: '0.75rem', opacity: 0.6 }}>
                    typer.world v1.5.0
                </div>
            </div>
        </div>
    );
};

// Components
const Section = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
    <div style={{ marginBottom: '1.8rem' }}>
        <div style={{
            color: 'var(--subtle-color)',
            fontSize: '0.75rem',
            letterSpacing: '1.5px',
            marginBottom: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            {icon}
            {title}
        </div>
        {children}
    </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ color: 'var(--subtle-color)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
        {children}
    </div>
);

const ThemeButton = ({ name, isActive, onClick }: { name: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            border: isActive ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.08)',
            background: isActive ? 'rgba(226, 183, 20, 0.08)' : 'rgba(255,255,255,0.02)',
            color: 'var(--text-color)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            textTransform: 'capitalize',
            transition: 'all 0.15s'
        }}
    >
        <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            border: isActive ? '3px solid var(--primary-color)' : '2px solid var(--subtle-color)',
            background: isActive ? 'var(--primary-color)' : 'transparent'
        }} />
        {name}
    </button>
);

const ToggleButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        style={{
            padding: '0.35rem 0.7rem',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: isActive ? 'var(--text-color)' : 'transparent',
            color: isActive ? 'var(--bg-color)' : 'var(--subtle-color)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.15s'
        }}
    >
        {label}
    </button>
);

const SettingRow = ({
    label,
    description,
    value,
    onChange
}: {
    label: string;
    description: string;
    value: boolean;
    onChange: (v: boolean) => void
}) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.7rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        marginBottom: '0.4rem'
    }}>
        <div>
            {label && <div style={{ fontWeight: '500', marginBottom: description ? '0.15rem' : 0, fontSize: '0.9rem' }}>{label}</div>}
            {description && <div style={{ color: 'var(--subtle-color)', fontSize: '0.75rem' }}>{description}</div>}
        </div>
        <Switch value={value} onChange={onChange} />
    </div>
);

const Switch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
        onClick={() => onChange(!value)}
        style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            border: 'none',
            background: value ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s'
        }}
    >
        <span style={{
            position: 'absolute',
            top: '2px',
            left: value ? '22px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s'
        }} />
    </button>
);
