import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const FloatingActionMenu = ({ options, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`global-fab-wrapper ${className}`} style={{
            position: 'fixed',
            bottom: '110px', // Lifted higher to not overlap with the new interactive tab bar
            right: '20px',
            zIndex: 100
        }}>
            <button
                ref={fabRef}
                className={`fab-button ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isOpen ? '0 12px 36px rgba(139, 92, 246, 0.6)' : '0 8px 28px rgba(139, 92, 246, 0.45)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 10,
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                }}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}
                >
                    <Plus size={26} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Invisible overlay to close when tapping outside */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'transparent',
                                zIndex: 190,
                            }}
                        />

                        {/* Menu Options — absolute relative to wrapper, expanding up and right-aligned */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 10, originX: 1, originY: 1 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 10 }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '70px',
                                right: '0px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                zIndex: 200,
                                width: '220px',
                            }}
                        >
                            {options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 16 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: (options.length - 1 - index) * 0.05,
                                    }}
                                    onClick={() => {
                                        setIsOpen(false);
                                        option.onClick();
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-primary)',
                                        background: 'var(--bg-primary)',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                                        cursor: 'pointer',
                                        width: '100%',
                                        textAlign: 'left',
                                        outline: 'none',
                                        WebkitTapHighlightColor: 'transparent',
                                    }}
                                >
                                    {option.Icon && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: option.color ? `${option.color}15` : 'var(--bg-secondary)',
                                            color: option.color || 'var(--text-primary)',
                                            flexShrink: 0,
                                        }}>
                                            {option.Icon}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingActionMenu;
