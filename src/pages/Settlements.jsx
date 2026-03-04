import { useState } from 'react';
import { CheckCircle2, Clock, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarColor, generateId } from '../utils/helpers';
import { showInterstitialAd } from '../utils/adService';
import NudgeButton from '../components/NudgeButton';
import { useTranslation, Trans } from 'react-i18next';

export default function Settlements() {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();
    const [filter, setFilter] = useState('pending'); // pending | all | paid
    const [pendingPayment, setPendingPayment] = useState(null);

    // Calculate all simplified debts across all groups
    const allTransactions = [];

    state.groups.forEach(group => {
        const members = group.members.map(id => state.members[id]).filter(Boolean);
        const expenses = state.expenses.filter(e => e.groupId === group.id);
        const balances = calculateBalances(expenses, members);
        const transactions = simplifyDebts(balances);

        transactions.forEach(tx => {
            // Check if already settled
            const isSettled = state.settlements.some(
                s => s.groupId === group.id && s.from === tx.from && s.to === tx.to && s.status === 'paid'
                    && Math.abs(s.amount - tx.amount) < 1
            );

            allTransactions.push({
                ...tx,
                groupId: group.id,
                groupName: group.name,
                currency: group.currency,
                isSettled,
            });
        });
    });

    // Settlement history
    const history = state.settlements.filter(s => s.status === 'paid');

    const handleMarkPaid = (tx) => {
        setPendingPayment(tx);
    };

    const confirmPayment = () => {
        if (!pendingPayment) return;
        const tx = pendingPayment;
        const settlement = {
            id: generateId(),
            groupId: tx.groupId,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            currency: tx.currency,
            status: 'paid',
            date: new Date().toISOString(),
            paidAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_SETTLEMENT', payload: settlement });

        setPendingPayment(null);

        // Brief visual feedback for the user (can rely on React state updates visually too)

        const isPro = state.members[state.currentUser]?.isPro;
        if (!isPro) {
            // Trigger interstitial AD after user finishes core confirmation action
            setTimeout(() => showInterstitialAd(), 300);
        }
    };

    const pendingTx = allTransactions.filter(t => !t.isSettled);
    const totalPending = pendingTx.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>{t('settlements.pageTitle')}</h2>
                    <p className="page-subtitle">{t('settlements.pageSubtitle')}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-3 mb-xl mobile-scroller" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>{pendingTx.length}</div>
                    <div className="stat-label">{t('settlements.pendingPayment')}</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald-light)' }}>{history.length}</div>
                    <div className="stat-label">{t('settlements.completed')}</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
                        <Zap size={22} />
                    </div>
                    <div className="stat-value text-gradient">{allTransactions.length}</div>
                    <div className="stat-label">{t('settlements.totalTransactions')}</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-sm mb-xl">
                {[
                    { id: 'pending', label: t('settlements.pending'), count: pendingTx.length },
                    { id: 'paid', label: t('settlements.paid'), count: history.length },
                    { id: 'all', label: t('settlements.all'), count: allTransactions.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`btn ${filter === tab.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(tab.id)}
                    >
                        {tab.label}
                        <span className="badge badge-purple" style={{
                            background: filter === tab.id ? 'rgba(255,255,255,0.2)' : undefined,
                            color: filter === tab.id ? 'white' : undefined,
                            border: 'none',
                            marginLeft: 4,
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Pending Transactions */}
            {(filter === 'pending' || filter === 'all') && pendingTx.length > 0 && (
                <div className="glass-card mb-xl">
                    <h4 className="mb-lg">{t('settlements.pendingPayments')}</h4>
                    <div className="flex flex-col gap-md">
                        {pendingTx.map((tx, i) => {
                            const fromMember = state.members[tx.from];
                            const toMember = state.members[tx.to];

                            return (
                                <div key={`${tx.from}-${tx.to}-${i}`} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} style={{
                                    padding: 'var(--space-lg)',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border-primary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--space-md)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {/* Group Name Badge (Top Center) */}
                                    <div className="flex justify-center w-full mb-xs">
                                        <span style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid var(--border-primary)',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 600,
                                            letterSpacing: '0.5px'
                                        }}>
                                            {tx.groupName}
                                        </span>
                                    </div>

                                    {/* Middle section: Transaction Info */}
                                    <div className="flex items-center justify-between w-full">
                                        {/* From */}
                                        <div className="flex flex-col items-center gap-xs" style={{ width: '80px' }}>
                                            <div className="avatar" style={{ background: getAvatarColor(fromMember?.id || ''), width: 44, height: 44, fontSize: '1.1rem' }}>
                                                {getInitials(fromMember?.name || '?')}
                                            </div>
                                            <div className="text-sm font-semibold truncate w-full text-center" title={fromMember?.name}>{fromMember?.name?.split(' ')[0]}</div>
                                            <div className="text-xs text-muted">{t('settlements.willPay')}</div>
                                        </div>

                                        {/* Amount & Arrow */}
                                        <div className="flex flex-col items-center justify-center flex-1 px-sm">
                                            <div className="font-bold text-lg" style={{ color: 'var(--accent-amber-light)', marginBottom: 4 }}>
                                                {formatCurrency(tx.amount, tx.currency)}
                                            </div>
                                            <div style={{ width: '100%', height: 2, background: 'var(--gradient-primary)', position: 'relative' }}>
                                                <ArrowRight size={16} style={{ position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
                                            </div>
                                        </div>

                                        {/* To */}
                                        <div className="flex flex-col items-center gap-xs" style={{ width: '80px' }}>
                                            <div className="avatar" style={{ background: getAvatarColor(toMember?.id || ''), width: 44, height: 44, fontSize: '1.1rem' }}>
                                                {getInitials(toMember?.name || '?')}
                                            </div>
                                            <div className="text-sm font-semibold truncate w-full text-center" title={toMember?.name}>{toMember?.name?.split(' ')[0]}</div>
                                            <div className="text-xs text-muted">{t('settlements.creditor')}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons (Stacked) */}
                                    <div className="flex flex-col gap-sm w-full mt-sm" style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-md)' }}>
                                        <button
                                            className="btn btn-success flex justify-center items-center gap-xs w-full"
                                            onClick={() => handleMarkPaid(tx)}
                                            style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 600, borderRadius: 'var(--radius-md)' }}
                                            title={t('settlements.confirmPaymentTooltip')}
                                        >
                                            <CheckCircle2 size={18} /> {t('settlements.completePayment')}
                                        </button>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <NudgeButton
                                                memberId={tx.from}
                                                amount={tx.amount}
                                                groupName={tx.groupName}
                                                currency={tx.currency}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Paid History */}
            {(filter === 'paid' || filter === 'all') && history.length > 0 && (
                <div className="glass-card">
                    <h4 className="mb-lg">{t('settlements.paymentHistory')}</h4>
                    <div className="flex flex-col gap-sm">
                        {history.map((s, i) => {
                            const fromMember = state.members[s.from];
                            const toMember = state.members[s.to];
                            const group = state.groups.find(g => g.id === s.groupId);

                            return (
                                <div key={s.id} className="flex items-center gap-md" style={{
                                    padding: 'var(--space-md)',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    opacity: 0.7,
                                }}>
                                    <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="text-sm">
                                            <strong>{fromMember?.name?.split(' ')[0]}</strong> → <strong>{toMember?.name?.split(' ')[0]}</strong>
                                        </div>
                                        <div className="text-xs text-muted">{group?.name}</div>
                                    </div>
                                    <div className="text-sm font-bold" style={{ color: 'var(--accent-emerald)' }}>
                                        {formatCurrency(s.amount, s.currency)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filter === 'pending' && pendingTx.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-icon">🎉</div>
                    <h3>{t('settlements.allDebtsPaid')}</h3>
                    <p className="text-sm">{t('settlements.noPendingPayment')}</p>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {pendingPayment && (
                <div className="modal-overlay" onClick={() => setPendingPayment(null)} style={{ zIndex: 3000 }}>
                    <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)' }}>
                        <div className="flex items-center justify-center mx-auto mb-lg" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', width: 64, height: 64, borderRadius: '50%' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="mb-sm text-lg font-bold">{t('settlements.confirmPaymentModalTitle')}</h3>
                        <p className="text-muted mb-xl text-sm" style={{ lineHeight: 1.5 }}>
                            <Trans
                                i18nKey="settlements.confirmPaymentMessage"
                                values={{
                                    name: state.members[pendingPayment.from]?.name?.split(' ')[0],
                                    amount: formatCurrency(pendingPayment.amount, pendingPayment.currency)
                                }}
                            />
                        </p>
                        <div className="flex gap-md w-full">
                            <button className="btn btn-secondary flex-1" onClick={() => setPendingPayment(null)}>
                                {t('settlements.cancel')}
                            </button>
                            <button className="btn btn-success flex-1" onClick={confirmPayment}>
                                {t('settlements.yesComplete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
