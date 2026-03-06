import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AVATARS } from '../../utils/helpers';

/**
 * AvatarPicker — Premium PNG Avatar Picker
 * @param {number} selectedId - Currently selected avatar ID (1-5).
 * @param {(id: number) => void} onSelect - Callback when user picks a new avatar.
 * @param {string} userName - User name displayed under the avatar.
 * @param {string} subtitle - Subtitle text (e.g. "Avatarını seç").
 */
const AvatarPicker = ({ selectedId = 1, onSelect, userName = '', subtitle = '' }) => {
    const [rotationCount, setRotationCount] = useState(0);

    const selectedAvatar = AVATARS.find(a => a.id === selectedId) || AVATARS[0];

    const handleSelect = (avatar) => {
        if (avatar.id === selectedId) return;
        setRotationCount(prev => prev + 360);
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
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className="avatar-picker__main-inner">
                        <img
                            src={selectedAvatar.src}
                            alt={selectedAvatar.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'contain',
                                padding: '12px'
                            }}
                        />
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
                {AVATARS.map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        className={`avatar-picker__option ${selectedId === avatar.id ? 'active' : ''}`}
                        onClick={() => handleSelect(avatar)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            opacity: selectedId === avatar.id ? 1 : 0.55,
                            transform: selectedId === avatar.id ? 'scale(1.05)' : 'scale(0.9)',
                            transition: 'opacity 0.3s ease, transform 0.3s ease'
                        }}
                    >
                        <div className="avatar-picker__option-svg" style={{ overflow: 'hidden', borderRadius: '50%' }}>
                            <img
                                src={avatar.src}
                                alt={avatar.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'contain',
                                    padding: '4px'
                                }}
                            />
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

/** Helper: get avatar image src by ID */
export const getAvatarSvg = (avatarId) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar ? avatar.src : `${import.meta.env.BASE_URL}avatars/avatar-1.png`;
};

export { AvatarPicker, AVATARS as avatars };
export default AvatarPicker;
