/**
 * CoBill — Helper Utilities
 */

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
    { id: 1, src: '/avatars/avatar-1.png', name: 'Atlas' },
    { id: 2, src: '/avatars/avatar-2.png', name: 'Sofia' },
    { id: 3, src: '/avatars/avatar-3.png', name: 'Leo' },
    { id: 4, src: '/avatars/avatar-4.png', name: 'Aria' },
    { id: 5, src: '/avatars/avatar-5.png', name: 'Kai' }
];

export const getAvatarImage = (avatarId) => {
    const avatar = AVATARS.find(a => a.id === Number(avatarId));
    return avatar ? avatar.src : '/avatars/avatar-1.png';
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

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/**
 * Format date
 */
export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format short date
 */
export function formatShortDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
}

/**
 * Category icons and colors
 */
export const CATEGORIES = {
    food: { label: 'Yemek', icon: '🍽️', color: 'var(--accent-amber)' },
    transport: { label: 'Ulaşım', icon: '🚕', color: 'var(--accent-blue)' },
    shopping: { label: 'Alışveriş', icon: '🛒', color: 'var(--accent-rose)' },
    bills: { label: 'Faturalar', icon: '📋', color: 'var(--accent-cyan)' },
    rent: { label: 'Kira', icon: '🏠', color: 'var(--accent-emerald)' },
    entertainment: { label: 'Eğlence', icon: '🎬', color: 'var(--accent-purple)' },
    health: { label: 'Sağlık', icon: '💊', color: 'var(--accent-rose)' },
    internet: { label: 'İnternet', icon: '📡', color: 'var(--accent-cyan)' },
    other: { label: 'Diğer', icon: '📦', color: 'var(--text-tertiary)' },
};

/**
 * Generate nudge message
 */
export function generateNudgeMessage(memberName, groupName, amount, currency = 'TRY') {
    const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || currency;
    const formatted = `${symbol}${Math.abs(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return `CoBill Hatırlatması 💰\n\n"${groupName}" grubu için güncel bakiyen: ${formatted}.\n\nMüsait olduğunda bakabilir misin? 🙏\n\n— CoBill ile gönderildi`;
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
