import { motion } from 'framer-motion';

export const Logo = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '4px 8px'
            }}
            whileHover="hover"
        >
            {/* Liquid Background Pulse */}
            <motion.div
                variants={{
                    hover: {
                        scale: 1.1,
                        opacity: 1,
                        background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)'
                    }
                }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    borderRadius: '50%',
                    opacity: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    transition: 'all 0.4s ease'
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
                {/* Floating Character Container */}
                <motion.div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '2px'
                    }}
                >
                    {/* "typer" - Dynamic thickness on hover */}
                    <motion.span
                        style={{
                            fontSize: '2rem',
                            fontWeight: 600,
                            color: 'var(--text-color)',
                            letterSpacing: '-0.05em',
                            display: 'inline-block'
                        }}
                        variants={{
                            hover: {
                                fontWeight: 700,
                                color: 'var(--primary-color)',
                                transition: { duration: 0.3 }
                            }
                        }}
                    >
                        typer
                    </motion.span>

                    {/* ".world" - Animated Gravity Loop */}
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            position: 'relative'
                        }}
                    >
                        {/* The Period as a Bouncing Ball */}
                        <motion.span
                            animate={{
                                y: [0, -4, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                fontSize: '2rem',
                                fontWeight: 900,
                                color: 'var(--primary-color)',
                                textShadow: '0 0 10px rgba(var(--primary-rgb), 0.5)'
                            }}
                        >
                            .
                        </motion.span>

                        {/* "world" with a reveal mask effect */}
                        <motion.span
                            style={{
                                fontSize: '2rem',
                                fontWeight: 900,
                                color: 'var(--primary-color)',
                                letterSpacing: '-0.03em',
                                position: 'relative',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--text-color) 200%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            world
                        </motion.span>
                    </motion.div>
                </motion.div>
            </div>

            {/* Orbiting Particles (Interactive) */}
            <motion.div
                variants={{
                    hover: { opacity: 1, rotate: 360 }
                }}
                initial={{ opacity: 0, rotate: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '5%',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    boxShadow: '0 0 8px var(--primary-color)'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '5%',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    opacity: 0.6
                }} />
            </motion.div>
        </motion.div>
    );
};
