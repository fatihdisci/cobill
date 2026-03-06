import { useApp } from '../context/AppContext';
import { getInitials, formatRelativeDate, CATEGORIES } from '../utils/helpers';
import { formatCurrency } from '../utils/currencyUtils';
import { Receipt, ArrowLeftRight, UserPlus, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ActivityFeed({ groupId, limit = 10 }) {
    const { t } = useTranslation();
    const { state } = useApp();

    let activities = [];

    // Expenses as activities
    const expenses = groupId
        ? state.expenses.filter(e => e.groupId === groupId)
        : state.expenses;

    expenses.slice(0, limit).forEach(expense => {
        const payer = state.members[expense.paidBy];
        const group = state.groups.find(g => g.id === expense.groupId);
        const cat = CATEGORIES[expense.category] || CATEGORIES.other;

        activities.push({
            id: expense.id,
            type: 'expense',
            icon: cat.icon,
            iconBg: expense.isRecurring ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
            title: expense.description,
            subtitle: `${payer?.name || t('common.someone')} ${t('groups.paid')}${group && !groupId ? ` • ${group.name}` : ''}`,
            amount: formatCurrency(expense.amount, expense.currency),
            amountColor: 'var(--text-primary)',
            date: expense.date,
            isRecurring: expense.isRecurring,
        });
    });

    // Settlements as activities
    const settlements = groupId
        ? state.settlements.filter(s => s.groupId === groupId)
        : state.settlements;

    settlements.slice(0, limit).forEach(settlement => {
        const from = state.members[settlement.from];
        const to = state.members[settlement.to];

        activities.push({
            id: settlement.id,
            type: 'settlement',
            icon: '💸',
            iconBg: settlement.status === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            title: `${from?.name?.split(' ')[0] || '?'} → ${to?.name?.split(' ')[0] || '?'}`,
            subtitle: settlement.status === 'paid' ? t('groups.settled') : t('groups.pending'),
            amount: formatCurrency(settlement.amount, settlement.currency),
            amountColor: settlement.status === 'paid' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            date: settlement.date,
        });
    });

    // Sort by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activities.length === 0) {
        return (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <p className="text-sm text-muted">{t('dashboard.noActivity')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {activities.map((activity, i) => (
                <div
                    key={activity.id}
                    className={`flex items-center gap-md animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    style={{
                        padding: 'var(--space-md) 0',
                        borderBottom: i < activities.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    }}
                >
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-md)',
                        background: activity.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        flexShrink: 0,
                    }}>
                        {activity.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-sm font-semibold truncate flex items-center gap-sm">
                            {activity.title}
                            {activity.isRecurring && (
                                <CalendarClock size={12} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                            )}
                        </div>
                        <div className="text-xs text-muted">{activity.subtitle}</div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="text-sm font-bold" style={{ color: activity.amountColor }}>
                            {activity.amount}
                        </div>
                        <div className="text-xs text-muted">{formatRelativeDate(activity.date)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
