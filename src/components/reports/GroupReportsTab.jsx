import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SpendingByCategory, MemberBalanceChart } from '../BalanceChart';
import { formatCurrency } from '../../utils/currencyUtils';
import { CATEGORIES, formatDate } from '../../utils/helpers';

export default function GroupReportsTab({
    selectedGroup, groups, group,
    expenses, totalSpent, groupSettlements,
    categoryBreakdown, dateFilter, t, state
}) {
    if (!group) {
        return <div className="text-center p-2xl"><p className="text-muted">{t('reports.pleaseSelectGroup')}</p></div>;
    }

    return (
        <div className="flex flex-col gap-xl">
            <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.totalExpense')}</div>
                    <div className="stat-value text-gradient">{formatCurrency(totalSpent, group.currency)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.expenseCount')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{expenses.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.averagePerPerson')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                        {formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }} className="reports-grid">
                <div className="glass-card">
                    <h4 className="mb-lg">📊 {t('reports.categoryDistribution')}</h4>
                    <SpendingByCategory groupId={selectedGroup} dateFilter={dateFilter} />
                </div>
                <div className="glass-card">
                    <h4 className="mb-lg">👥 {t('reports.perPersonExpenseTitle')}</h4>
                    <MemberBalanceChart groupId={selectedGroup} dateFilter={dateFilter} />
                </div>
            </div>

            <div className="glass-card hide-mobile">
                <h4 className="mb-lg">{t('reports.categoryDetails')}</h4>
                <table className="data-table">
                    <thead>
                        <tr><th>{t('common.category')}</th><th style={{ textAlign: 'right' }}>{t('common.amount')}</th><th style={{ textAlign: 'right' }}>{t('reports.percentage')}</th><th>{t('reports.distribution')}</th></tr>
                    </thead>
                    <tbody>
                        {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                            const c = CATEGORIES[cat] || CATEGORIES.other;
                            const pct = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
                            return (
                                <tr key={cat}>
                                    <td><span className="flex items-center gap-sm"><span>{c.icon}</span>{t(`wallet.categories.${cat === 'shopping' ? 'market' : cat === 'bills' ? 'bill' : cat}`, { defaultValue: c.label })}</span></td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(amount, group.currency)}</td>
                                    <td style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                                    <td><div className="progress-bar" style={{ width: 120 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="glass-card">
                <h4 className="mb-lg">🤝 {t('reports.groupPayments')}</h4>
                {groupSettlements.length > 0 ? (
                    <div className="flex flex-col gap-sm">
                        {groupSettlements.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-md" style={{
                                padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)'
                            }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="text-sm font-medium">
                                        <strong>{state.members[s.from]?.name?.split(' ')[0]}</strong>
                                        <ArrowRight size={12} style={{ margin: '0 8px', color: 'var(--text-tertiary)' }} />
                                        <strong>{state.members[s.to]?.name?.split(' ')[0]}</strong>
                                    </div>
                                    <div className="text-xs text-muted">{formatDate(s.date || s.paidAt)}</div>
                                </div>
                                <div className="text-sm font-bold" style={{ color: 'var(--accent-emerald-light)' }}>{formatCurrency(s.amount, s.currency)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-xl"><p className="text-muted text-sm">{t('reports.noPayments')}</p></div>
                )}
            </div>
        </div>
    );
}
