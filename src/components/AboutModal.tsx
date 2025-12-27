import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Close on click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}
        >
            <div
                ref={modalRef}
                style={{
                    background: 'var(--bg-color)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    padding: '2rem'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--subtle-color)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <article style={{ lineHeight: 1.6, color: 'var(--text-color)' }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--primary-color)',
                        fontFamily: 'var(--font-mono)'
                    }}>
                        About Typer.world
                    </h1>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', opacity: 0.9 }}>Free Online Typing Test</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--subtle-color)' }}>
                            Welcome to Typer.world, the most aesthetic and distraction-free place to practice your typing skills.
                            Whether you want to check your WPM (Words Per Minute), improve your accuracy, or learn touch typing,
                            our fast typing test engine provides real-time feedback.
                        </p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', opacity: 0.9 }}>Why Practice Touch Typing?</h2>
                        <p style={{ marginBottom: '1rem', color: 'var(--subtle-color)' }}>
                            Touch typing allows you to type without looking at the keyboard, significantly increasing your typing speed and productivity.
                            Regular practice on our typing speed test can help you reach professional levels of 60, 80, or even 100+ WPM.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', opacity: 0.9 }}>Features</h2>
                        <ul style={{
                            listStyle: 'disc',
                            paddingLeft: '1.5rem',
                            color: 'var(--subtle-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <li>Real-time WPM and Accuracy tracking</li>
                            <li>Multiple modes: Words, Quotes, Code</li>
                            <li>Distraction-free focus mode</li>
                            <li>Aesthetic themes and customization</li>
                        </ul>
                    </section>
                </article>
            </div>
        </div>
    );
};
