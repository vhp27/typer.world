import { useState } from 'react';
import { PenTool, X } from 'lucide-react';

interface CustomTextModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
}

export const CustomTextModal = ({ isOpen, onClose, onSubmit }: CustomTextModalProps) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (trimmed.length < 10) {
            setError('Please enter at least 10 characters');
            return;
        }
        if (trimmed.length > 5000) {
            setError('Text is too long (max 5000 characters)');
            return;
        }
        setError('');
        onSubmit(trimmed);
        setText('');
        onClose();
    };

    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
            setText('');
            setError('');
        }
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
            onClick={handleBackdrop}
        >
            <div style={{
                background: 'var(--bg-color)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                width: '600px',
                maxWidth: '90vw',
                color: 'var(--text-color)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <PenTool size={20} color="var(--primary-color)" /> Custom Text Practice
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--subtle-color)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <p style={{ color: 'var(--subtle-color)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Paste or type any text you want to practice. Great for practicing specific passages, code snippets, or custom content.
                </p>

                <textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); setError(''); }}
                    placeholder="Enter your custom text here..."
                    style={{
                        width: '100%',
                        height: '200px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '1rem',
                        color: 'var(--text-color)',
                        fontSize: '1rem',
                        fontFamily: 'var(--font-mono)',
                        resize: 'vertical',
                        outline: 'none'
                    }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <div>
                        <span style={{ color: 'var(--subtle-color)', fontSize: '0.85rem' }}>
                            {text.length} characters
                        </span>
                        {error && (
                            <span style={{ color: 'var(--error-color)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                                {error}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--subtle-color)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={{
                                background: 'var(--primary-color)',
                                border: 'none',
                                color: 'var(--bg-color)',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Start Practice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
