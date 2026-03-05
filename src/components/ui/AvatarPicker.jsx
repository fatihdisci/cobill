import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Avatar SVG data — 4 unique face illustrations.
 * Each avatar is identified by its `id` (1-4).
 */
const avatars = [
    {
        id: 1,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id="av1" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#av1)">
                    <rect width="36" height="36" fill="#ff005b" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(9 -5) rotate(219 18 18) scale(1)" fill="#ffb238" rx="6" />
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round" />
                        <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                        <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                    </g>
                </g>
            </svg>
        ),
    },
    {
        id: 2,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id="av2" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#av2)">
                    <rect width="36" height="36" fill="#ff7d10" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" fill="#0a0310" rx="6" />
                    <g transform="translate(7 -6) rotate(-5 18 18)">
                        <path d="M15 20c2 1 4 1 6 0" stroke="#FFFFFF" fill="none" strokeLinecap="round" />
                        <rect x="14" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                        <rect x="20" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                    </g>
                </g>
            </svg>
        ),
    },
    {
        id: 3,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id="av3" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#av3)">
                    <rect width="36" height="36" fill="#0a0310" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" fill="#ff005b" rx="36" />
                    <g transform="translate(-3 3.5) rotate(7 18 18)">
                        <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
                        <rect x="12" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                        <rect x="22" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#FFFFFF" />
                    </g>
                </g>
            </svg>
        ),
    },
    {
        id: 4,
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <mask id="av4" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                    <rect width="36" height="36" rx="72" fill="#FFFFFF" />
                </mask>
                <g mask="url(#av4)">
                    <rect width="36" height="36" fill="#d8fcb3" />
                    <rect x="0" y="0" width="36" height="36" transform="translate(9 -5) rotate(219 18 18) scale(1)" fill="#89fcb3" rx="6" />
                    <g transform="translate(4.5 -4) rotate(9 18 18)">
                        <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round" />
                        <rect x="10" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                        <rect x="24" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000" />
                    </g>
                </g>
            </svg>
        ),
    },
];

/**
 * AvatarPicker — Controlled component.
 * @param {number} selectedId - Currently selected avatar ID (1-4).
 * @param {(id: number) => void} onSelect - Callback when user picks a new avatar.
 * @param {string} userName - User name displayed under the avatar.
 * @param {string} subtitle - Subtitle text (e.g. "Avatarını seç").
 */
const AvatarPicker = ({ selectedId = 1, onSelect, userName = '', subtitle = '' }) => {
    const [rotationCount, setRotationCount] = useState(0);

    const selectedAvatar = avatars.find(a => a.id === selectedId) || avatars[0];

    const handleSelect = (avatar) => {
        if (avatar.id === selectedId) return;
        setRotationCount(prev => prev + 1080);
        onSelect?.(avatar.id);
    };

    return (
        <div className="avatar-picker">
            {/* Main avatar display */}
            <motion.div
                className="avatar-picker__main"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
                <motion.div
                    className="avatar-picker__main-rotate"
                    animate={{ rotate: rotationCount }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="avatar-picker__main-inner">
                        {selectedAvatar.svg}
                    </div>
                </motion.div>
            </motion.div>

            {/* Name + subtitle */}
            {(userName || subtitle) && (
                <div className="avatar-picker__info">
                    {userName && <h2 className="avatar-picker__name">{userName}</h2>}
                    {subtitle && <p className="avatar-picker__subtitle">{subtitle}</p>}
                </div>
            )}

            {/* Avatar options */}
            <motion.div
                className="avatar-picker__options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {avatars.map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        className={`avatar-picker__option ${selectedId === avatar.id ? 'active' : ''}`}
                        onClick={() => handleSelect(avatar)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className="avatar-picker__option-svg">
                            {avatar.svg}
                        </div>
                        <AnimatePresence>
                            {selectedId === avatar.id && (
                                <motion.div
                                    className="avatar-picker__option-ring"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

/** Helper: get avatar SVG by ID (for use in other components) */
export const getAvatarSvg = (avatarId) => {
    const avatar = avatars.find(a => a.id === avatarId);
    return avatar ? avatar.svg : null;
};

export { AvatarPicker, avatars };
export default AvatarPicker;
