/**
 * CoBill — Helper Utilities
 */
import i18n from '../i18n';

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Get avatar color based on name/id (Legacy — kept for backward compatibility)
 */
const AVATAR_COLORS = [
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #06b6d4, #0891b2)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #f43f5e, #e11d48)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #ec4899, #db2777)',
    'linear-gradient(135deg, #14b8a6, #0d9488)',
];

export function getAvatarColor(id) {
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Premium PNG Avatar System
 */
export const AVATARS = [
    { id: 1, src: `${import.meta.env.BASE_URL}avatars/avatar-1.png`, name: 'Atlas' },
    { id: 2, src: `${import.meta.env.BASE_URL}avatars/avatar-2.png`, name: 'Sofia' },
    { id: 3, src: `${import.meta.env.BASE_URL}avatars/avatar-3.png`, name: 'Leo' },
    { id: 4, src: `${import.meta.env.BASE_URL}avatars/avatar-4.png`, name: 'Aria' },
    { id: 5, src: `${import.meta.env.BASE_URL}avatars/avatar-5.png`, name: 'Kai' }
];

export const getAvatarImage = (avatarId) => {
    const avatar = AVATARS.find(a => a.id === Number(avatarId));
    return avatar ? avatar.src : `${import.meta.env.BASE_URL}avatars/avatar-1.png`;
};

/**
 * Get initials from name
 */
export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return i18n.t('common.justNow');
    if (diffMins < 60) return i18n.t('common.minsAgo', { count: diffMins });
    if (diffHours < 24) return i18n.t('common.hoursAgo', { count: diffHours });
    if (diffDays < 7) return i18n.t('common.daysAgo', { count: diffDays });

    return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Format date
 */
export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format short date
 */
export function formatShortDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Category icons and colors
 */
export const CATEGORIES = {
    food: { label: i18n.t('categories.food'), icon: '🍽️', color: 'var(--accent-amber)' },
    transport: { label: i18n.t('categories.transport'), icon: '🚕', color: 'var(--accent-blue)' },
    shopping: { label: i18n.t('categories.shopping'), icon: '🛒', color: 'var(--accent-rose)' },
    bills: { label: i18n.t('categories.bills'), icon: '📋', color: 'var(--accent-cyan)' },
    rent: { label: i18n.t('categories.rent'), icon: '🏠', color: 'var(--accent-emerald)' },
    entertainment: { label: i18n.t('categories.entertainment'), icon: '🎬', color: 'var(--accent-purple)' },
    health: { label: i18n.t('categories.health'), icon: '💊', color: 'var(--accent-rose)' },
    internet: { label: i18n.t('categories.internet'), icon: '📡', color: 'var(--accent-cyan)' },
    other: { label: i18n.t('categories.other'), icon: '📦', color: 'var(--text-tertiary)' },
};

/**
 * Generate nudge message
 */
export function generateNudgeMessage(memberName, groupName, amount, currency = 'TRY') {
    const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || currency;
    const formatted = `${symbol}${Math.abs(amount).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return i18n.t('groups.nudgeMessage', {
        groupName,
        amount: formatted
    });
}

/**
 * Generate WhatsApp URL
 */
export function getWhatsAppUrl(phone, message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Generate mailto URL
 */
export function getMailtoUrl(email, subject, body) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
