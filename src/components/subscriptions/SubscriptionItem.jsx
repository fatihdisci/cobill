import { Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyUtils';

const getBrandColor = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('netflix') || t.includes('youtube')) return 'var(--accent-rose)';
    if (t.includes('spotify') || t.includes('xbox')) return 'var(--accent-emerald)';
    if (t.includes('kira') || t.includes('aidat')) return 'var(--accent-blue)';
    if (t.includes('amazon') || t.includes('prime')) return 'var(--accent-amber)';
    if (t.includes('disney')) return '#2563EB'; // Disney blue
    if (t.includes('apple')) return '#555555';
    if (t.includes('gym') || t.includes('spor')) return 'var(--accent-cyan)';
    return 'var(--accent-purple)'; // Default
};

export default function SubscriptionItem({ sub, onDelete }) {
    const { t } = useTranslation();
    const brandColor = getBrandColor(sub.title);

    // Calculate next payment text
    const nextPayment = new Date(sub.nextPaymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dueText = '';
    let isUrgent = false;

    if (diffDays < 0) {
        dueText = t('subscriptions.overdue');
        isUrgent = true;
    } else if (diffDays === 0) {
        dueText = t('subscriptions.dueToday');
        isUrgent = true;
    } else if (diffDays === 1) {
        dueText = t('subscriptions.dueTomorrow');
        isUrgent = true;
    } else if (diffDays <= 3) {
        dueText = t('subscriptions.dueIn', { days: diffDays });
        isUrgent = true;
    } else {
        dueText = t('subscriptions.dueIn', { days: diffDays });
    }

    return (
        <div className="glass-card flex items-center gap-md" style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderLeft: isUrgent ? `3px solid var(--accent-rose)` : `3px solid transparent`,
            transition: 'all 0.2s ease'
        }}>
            {/* Icon Box */}
            <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                background: `${brandColor}15`, color: brandColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                <RefreshCw size={20} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold text-sm truncate flex items-center gap-sm">
                    {sub.title}
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                        {sub.cycle === 'yearly' ? t('subscriptions.yearly') : t('subscriptions.monthly')}
                    </span>
                </div>
                <div className="text-xs text-muted flex items-center gap-xs mt-xs">
                    {isUrgent && <AlertCircle size={10} style={{ color: 'var(--accent-rose)' }} />}
                    <span style={{ color: isUrgent ? 'var(--accent-rose)' : 'inherit' }}>
                        {t('subscriptions.nextPayment')}: {dueText}
                    </span>
                </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-md" style={{ flexShrink: 0 }}>
                <div className="font-bold text-sm">
                    {formatCurrency(sub.amount, sub.currency)}
                </div>
                <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onDelete(sub.id)}
                    style={{ opacity: 0.5 }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}
