import React from 'react';
import { formatCurrency } from '../../utils/currencyUtils';

const PERSONAL_CATS_CONFIG = {
    Market: { icon: '🛒', color: '#10b981', key: 'market' },
    Fatura: { icon: '📋', color: '#06b6d4', key: 'bill' },
    'Eğitim': { icon: '📚', color: '#3b82f6', key: 'education' },
    'Eğlence': { icon: '🎬', color: '#8b5cf6', key: 'entertainment' },
    'Ulaşım': { icon: '🚕', color: '#f59e0b', key: 'transport' },
    'Diğer': { icon: '📦', color: '#6b7280', key: 'other' },
};

export default function PersonalReportsTab({
    personalTotal,
    personalExpensesCount,
    personalCategoryBreakdown,
    t
}) {
    return (
        <div className="flex flex-col gap-xl">
            <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.totalPersonalExpense')}</div>
                    <div className="stat-value text-gradient">{formatCurrency(personalTotal, 'TRY')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.expenseCount')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{personalExpensesCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">{t('reports.categoryCount')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>{Object.keys(personalCategoryBreakdown).length}</div>
                </div>
            </div>

            <div className="glass-card">
                <h4 className="mb-lg">📊 {t('reports.categoryDistribution')}</h4>
                {Object.keys(personalCategoryBreakdown).length > 0 ? (
                    <div className="flex flex-col gap-md">
                        {Object.entries(personalCategoryBreakdown)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, amount]) => {
                                const catInfo = PERSONAL_CATS_CONFIG[cat] || PERSONAL_CATS_CONFIG['Diğer'];
                                const pct = personalTotal > 0 ? (amount / personalTotal * 100) : 0;
                                return (
                                    <div key={cat} className="flex items-center gap-md">
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '12px',
                                            background: `${catInfo.color}18`, color: catInfo.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem', flexShrink: 0,
                                        }}>
                                            {catInfo.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="flex justify-between mb-xs">
                                                <span className="text-sm font-semibold">{t(`wallet.categories.${catInfo.key}`, { defaultValue: cat })}</span>
                                                <span className="text-sm font-bold">{pct.toFixed(1)}%</span>
                                            </div>
                                            <div className="progress-bar" style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)' }}>
                                                <div className="progress-fill" style={{
                                                    width: `${pct}%`, background: catInfo.color,
                                                    borderRadius: 'var(--radius-full)',
                                                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                }} />
                                            </div>
                                            <div className="text-xs text-muted mt-xs">{formatCurrency(amount, 'TRY')}</div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="text-center p-xl"><p className="text-muted text-sm">{t('reports.noPersonalExpenses')}</p></div>
                )}
            </div>
        </div>
    );
}
