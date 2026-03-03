import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const FloatingActionMenu = ({ options, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ left: 0, bottom: 0 });

    const toggleMenu = () => {
        if (!isOpen && fabRef.current) {
            const rect = fabRef.current.getBoundingClientRect();
            // Center the menu horizontally on the FAB center, position above it
            setMenuPos({
                left: rect.left + rect.width / 2,
                bottom: window.innerHeight - rect.top + 12, // 12px gap above the button
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={`tab-item-fab-wrapper ${className}`} style={{ position: 'relative' }}>
            <button
                ref={fabRef}
                className={`central-fab ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
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

                        {/* Menu Options — fixed position, centered on the FAB */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 10, x: "-50%" }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, scale: 0.85, y: 10, x: "-50%" }}
                            transition={{
                                duration: 0.3,
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                            }}
                            style={{
                                position: 'fixed',
                                bottom: menuPos.bottom,
                                left: menuPos.left,
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
                                        border: '1px solid var(--border-secondary)',
                                        background: '#ffffff',
                                        borderRadius: 'var(--radius-lg)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
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
