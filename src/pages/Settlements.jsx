import { useState } from 'react';
import { CheckCircle2, Clock, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarColor, generateId } from '../utils/helpers';
import NudgeButton from '../components/NudgeButton';

export default function Settlements() {
    const { state, dispatch } = useApp();
    const [filter, setFilter] = useState('pending'); // pending | all | paid

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
    };

    const pendingTx = allTransactions.filter(t => !t.isSettled);
    const totalPending = pendingTx.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Ödemeler</h2>
                    <p className="page-subtitle">Sadeleştirilmiş borç planı ve ödeme geçmişi</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-3 mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                        <Clock size={22} />
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>{pendingTx.length}</div>
                    <div className="stat-label">Bekleyen Ödeme</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-emerald-light)' }}>{history.length}</div>
                    <div className="stat-label">Tamamlanan</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
                        <Zap size={22} />
                    </div>
                    <div className="stat-value text-gradient">{allTransactions.length}</div>
                    <div className="stat-label">Toplam İşlem (Sadeleştirilmiş)</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-sm mb-xl">
                {[
                    { id: 'pending', label: 'Bekleyenler', count: pendingTx.length },
                    { id: 'paid', label: 'Ödenmiş', count: history.length },
                    { id: 'all', label: 'Tümü', count: allTransactions.length },
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
                    <h4 className="mb-lg">Bekleyen Ödemeler</h4>
                    <div className="flex flex-col gap-md">
                        {pendingTx.map((tx, i) => {
                            const fromMember = state.members[tx.from];
                            const toMember = state.members[tx.to];

                            return (
                                <div key={`${tx.from}-${tx.to}-${i}`} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} style={{
                                    padding: 'var(--space-lg)',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-primary)',
                                }}>
                                    <div className="flex items-center gap-md mb-md">
                                        {/* From */}
                                        <div className="flex items-center gap-sm" style={{ minWidth: 0 }}>
                                            <div className="avatar" style={{ background: getAvatarColor(fromMember?.id || '') }}>
                                                {getInitials(fromMember?.name || '?')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{fromMember?.name?.split(' ')[0]}</div>
                                                <div className="text-xs text-muted">borçlu</div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div className="font-bold" style={{ color: 'var(--accent-amber-light)' }}>
                                                {formatCurrency(tx.amount, tx.currency)}
                                            </div>
                                            <ArrowRight size={18} style={{ color: 'var(--accent-cyan)', margin: '0 auto' }} />
                                        </div>

                                        {/* To */}
                                        <div className="flex items-center gap-sm" style={{ minWidth: 0 }}>
                                            <div className="avatar" style={{ background: getAvatarColor(toMember?.id || '') }}>
                                                {getInitials(toMember?.name || '?')}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">{toMember?.name?.split(' ')[0]}</div>
                                                <div className="text-xs text-muted">alacaklı</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-sm)' }}>
                                        <span className="text-xs text-muted">{tx.groupName}</span>
                                        <div className="flex items-center gap-sm">
                                            <NudgeButton
                                                memberId={tx.from}
                                                amount={tx.amount}
                                                groupName={tx.groupName}
                                                currency={tx.currency}
                                            />
                                            <button className="btn btn-success btn-sm" onClick={() => handleMarkPaid(tx)}>
                                                <CheckCircle2 size={14} /> Ödendi
                                            </button>
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
                    <h4 className="mb-lg">Ödeme Geçmişi</h4>
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
                    <h3>Tüm borçlar ödendi!</h3>
                    <p className="text-sm">Bekleyen ödeme bulunmuyor</p>
                </div>
            )}
        </div>
    );
}
