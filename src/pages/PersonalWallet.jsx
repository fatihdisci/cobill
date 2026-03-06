import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/helpers';
import { Wallet, Trash2, Calendar } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import ExpenseFilterSort from '../components/ExpenseFilterSort';
import SubscriptionsDashboard from '../components/subscriptions/SubscriptionsDashboard';

const PERSONAL_CATEGORIES = {
    Market: { icon: '🛒', label: 'Market', color: 'var(--accent-emerald)' },
    Fatura: { icon: '📋', label: 'Fatura', color: 'var(--accent-cyan)' },
    'Eğitim': { icon: '📚', label: 'Eğitim', color: 'var(--accent-blue)' },
    'Eğlence': { icon: '🎬', label: 'Eğlence', color: 'var(--accent-purple)' },
    'Ulaşım': { icon: '🚕', label: 'Ulaşım', color: 'var(--accent-amber)' },
    'Diğer': { icon: '📦', label: 'Diğer', color: 'var(--text-tertiary)' },
};

import { useTranslation } from 'react-i18next';

export default function PersonalWallet() {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();
    const [showProModal, setShowProModal] = useState(false);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter this month's expenses (for the summary card — never changes with filter)
    const thisMonthExpenses = state.personalExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown for summary bar
    const categoryBreakdown = {};
    thisMonthExpenses.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    const handleDelete = (id) => {
        if (window.confirm(t('wallet.deleteConfirm'))) {
            dispatch({ type: 'DELETE_PERSONAL_EXPENSE', payload: id });
        }
    };

    // Calculate upcoming fixed costs from subscriptions
    const subscriptions = state.subscriptions || [];
    const monthlyFixedTotal = subscriptions.reduce((acc, sub) => {
        if (!sub.isActive) return acc;
        let amount = sub.amount;
        if (sub.cycle === 'yearly') amount = amount / 12;
        return acc + amount;
    }, 0);

    const estimatedTotal = totalThisMonth + monthlyFixedTotal;

    // Define categories inside component to use translations
    const PERSONAL_CATEGORIES = {
        Market: { icon: '🛒', label: t('wallet.categories.market'), color: 'var(--accent-emerald)' },
        Fatura: { icon: '📋', label: t('wallet.categories.bill'), color: 'var(--accent-cyan)' },
        'Eğitim': { icon: '📚', label: t('wallet.categories.education'), color: 'var(--accent-blue)' },
        'Eğlence': { icon: '🎬', label: t('wallet.categories.entertainment'), color: 'var(--accent-purple)' },
        'Ulaşım': { icon: '🚕', label: t('wallet.categories.transport'), color: 'var(--accent-amber)' },
        'Diğer': { icon: '📦', label: t('wallet.categories.other'), color: 'var(--text-tertiary)' },
    };

    // Use ExpenseFilterSort hook
    const { filteredExpenses, filterUI, emptyState } = ExpenseFilterSort({
        expenses: state.personalExpenses,
        categories: PERSONAL_CATEGORIES,
        categoryKey: 'category',
        enableDateFilter: true,
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h2>💳 {t('wallet.title')}</h2>
                    <p className="page-subtitle">{t('wallet.subtitle')}</p>
                </div>
            </div>

            {/* Monthly Summary Card — estimated total with breakdowns */}
            <div className="glass-card static-card" style={{
                padding: 'var(--space-2xl) var(--space-xl)',
                marginBottom: 'var(--space-xl)',
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(139, 92, 246, 0.05) 100%)',
            }}>
                <div style={{ position: 'absolute', top: -60, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                {/* Header Context */}
                <div className="flex items-center gap-sm mb-lg" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={18} />
                    <span className="text-md font-medium">
                        {now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                </div>

                {/* Main Estimated Total */}
                <div className="mb-xs text-sm text-muted">{t('wallet.estimatedTotal')}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }} className="text-gradient">
                    {formatCurrency(estimatedTotal, 'TRY')}
                </div>

                {/* Breakdowns */}
                <div className="flex flex-col sm:flex-row gap-md mt-xl pt-lg" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <div className="flex-1" style={{ padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                        <div className="text-xs text-muted mb-xs">{t('wallet.realizedExpenses')}</div>
                        <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(totalThisMonth, 'TRY')}
                        </div>
                        <div className="text-xs mt-xs opacity-70" style={{ color: 'var(--text-tertiary)' }}>
                            {thisMonthExpenses.length} {t('wallet.expenses')}
                        </div>
                    </div>

                    <div className="flex-1" style={{ padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                        <div className="text-xs text-muted mb-xs">{t('wallet.upcomingFixedCosts')}</div>
                        <div className="font-bold text-lg" style={{ color: 'var(--accent-purple)' }}>
                            +{formatCurrency(monthlyFixedTotal, 'TRY')}
                        </div>
                        <div className="text-xs mt-xs opacity-70" style={{ color: 'var(--text-tertiary)' }}>
                            {subscriptions.filter(s => s.isActive).length} {t('wallet.expenses')}
                        </div>
                    </div>
                </div>

                {/* Mini category bars (Only for Realized Expenses) */}
                {Object.keys(categoryBreakdown).length > 0 && (
                    <div className="mt-xl">
                        <div className="flex gap-xs" style={{ height: 6, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--bg-glass)' }}>
                            {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                                const pct = totalThisMonth > 0 ? (amount / totalThisMonth * 100) : 0;
                                const catInfo = PERSONAL_CATEGORIES[cat] || PERSONAL_CATEGORIES['Diğer'];
                                return (
                                    <div
                                        key={cat}
                                        style={{
                                            width: `${pct}%`,
                                            background: catInfo.color,
                                            borderRadius: 'var(--radius-full)',
                                            transition: 'width 0.5s ease',
                                        }}
                                        title={`${catInfo.label}: ${pct.toFixed(0)}%`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Button */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                {filterUI}
            </div>

            {/* Filtered Total Header (Match SubscriptionsDashboard Style) */}
            {!emptyState && filteredExpenses.length > 0 && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div className="flex items-center justify-between mb-md">
                        <h3 className="section-title flex items-center gap-xs m-0">
                            <Wallet size={18} style={{ color: 'var(--accent-blue)' }} />
                            {t('wallet.realizedExpenses')}
                        </h3>
                    </div>

                    <div className="glass-card static-card" style={{
                        padding: 'var(--space-xl)',
                        position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%)',
                    }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                        <div className="text-sm text-muted mb-xs">{t('wallet.realizedExpenses')}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900 }} className="text-gradient">
                            {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0), 'TRY')}
                        </div>
                    </div>
                </div>
            )}

            {/* Expense List */}
            {emptyState ? emptyState : filteredExpenses.length > 0 ? (
                <div className="flex flex-col gap-sm">
                    {filteredExpenses.map((expense, i) => {
                        const catInfo = PERSONAL_CATEGORIES[expense.category] || PERSONAL_CATEGORIES['Diğer'];
                        return (
                            <div
                                key={expense.id}
                                className={`glass-card flex items-center gap-lg animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                                style={{ padding: 'var(--space-md) var(--space-lg)' }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: '14px',
                                    background: `${catInfo.color}15`, color: catInfo.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', flexShrink: 0,
                                }}>
                                    {catInfo.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="font-semibold text-sm truncate">{expense.title}</div>
                                    <div className="text-xs text-muted flex items-center gap-xs">
                                        <span>{PERSONAL_CATEGORIES[expense.category]?.label || t('wallet.categories.other')}</span>
                                        <span>·</span>
                                        <span>{formatDate(expense.date)}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div className="font-bold text-sm" style={{ color: 'var(--accent-rose)' }}>
                                        -{formatCurrency(expense.amount, 'TRY')}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(expense.id)}
                                    style={{ flexShrink: 0, opacity: 0.5 }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state glass-card static-card">
                    <div className="empty-icon">💳</div>
                    <h3>{t('wallet.noExpensesYet')}</h3>
                    <p className="text-sm mb-lg">{t('wallet.addExpenseHint')}</p>
                </div>
            )}

            {/* Subscriptions Dashboard (Fixed Monthly Costs) */}
            <div style={{ marginTop: 'var(--space-2xl)' }}>
                <SubscriptionsDashboard />
            </div>

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
    );
}
