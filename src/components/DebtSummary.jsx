import { useState } from 'react';
import { ArrowRight, Zap, TrendingDown, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateBalances, simplifyDebts, getNaiveTransactionCount } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarImage } from '../utils/helpers';

export default function DebtSummary({ groupId }) {
    const { state } = useApp();
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return null;

    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
    const groupExpenses = state.expenses.filter(e => e.groupId === groupId);

    if (groupExpenses.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🤝</div>
                <h3>Henüz borç yok</h3>
                <p className="text-sm">Masraf ekleyerek başlayın</p>
            </div>
        );
    }

    const [showDetails, setShowDetails] = useState(false);

    const balances = calculateBalances(groupExpenses, groupMembers);
    const transactions = simplifyDebts(balances);
    const naiveCount = getNaiveTransactionCount(groupExpenses);

    // Calculate Raw Transactions
    const rawTransactions = [];
    groupExpenses.forEach(expense => {
        if (!expense.splitAmong || expense.splitAmong.length === 0) return;
        const amountPerPerson = expense.amount / expense.splitAmong.length;
        expense.splitAmong.forEach(borrowerId => {
            if (borrowerId !== expense.paidBy) {
                rawTransactions.push({
                    from: borrowerId,
                    to: expense.paidBy,
                    amount: amountPerPerson,
                    expenseDesc: expense.description
                });
            }
        });
    });

    const getMember = (id) => state.members[id] || { name: 'Bilinmeyen', id };

    return (
        <div className="flex flex-col gap-lg">
            {/* Simplification Stats */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) var(--space-lg)',
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
            }}>
                <Zap size={18} style={{ color: 'var(--accent-emerald)' }} />
                <div className="text-sm">
                    <strong style={{ color: 'var(--accent-emerald-light)' }}>{naiveCount}</strong> olası işlem →{' '}
                    <strong style={{ color: 'var(--accent-emerald-light)' }}>{transactions.length}</strong> işleme sadeleştirildi
                    <TrendingDown size={14} style={{ display: 'inline', marginLeft: 4, color: 'var(--accent-emerald)' }} />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowDetails(!showDetails)}
                    style={{ color: 'var(--text-secondary)' }}
                >
                    Detay Gör {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {/* Details Accordion */}
            {showDetails && rawTransactions.length > 0 && (
                <div className="animate-fade-in" style={{
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    border: '1px solid var(--border-primary)',
                    marginBottom: 'var(--space-md)'
                }}>
                    <h5 className="mb-md flex items-center gap-xs text-sm text-muted">
                        <FileText size={14} /> Sadeleştirmeden Önceki Ham İşlemler ({rawTransactions.length})
                    </h5>
                    <div className="flex flex-col gap-sm">
                        {rawTransactions.map((tx, idx) => {
                            const fromMember = getMember(tx.from);
                            const toMember = getMember(tx.to);
                            return (
                                <div key={idx} className="flex justify-between items-center" style={{ fontSize: 'var(--font-xs)' }}>
                                    <div className="flex items-center gap-xs text-tertiary" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <span className="font-semibold">{fromMember.name.split(' ')[0]}</span>
                                        <ArrowRight size={10} />
                                        <span className="font-semibold">{toMember.name.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-sm">
                                        <span className="text-muted truncate" style={{ maxWidth: 100 }}>{tx.expenseDesc}</span>
                                        <span className="font-bold text-amber-500">{formatCurrency(tx.amount, group.currency)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Transaction List */}
            {transactions.map((tx, i) => {
                const fromMember = getMember(tx.from);
                const toMember = getMember(tx.to);

                return (
                    <div key={i} className={`debt-arrow animate-fade-in-up stagger-${i + 1}`}>
                        {/* From */}
                        <div className="flex items-center gap-sm" style={{ minWidth: 0, flex: '0 0 auto' }}>
                            <img src={getAvatarImage(fromMember.avatarId || 1)} alt={fromMember.name} className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                            <span className="text-sm font-semibold truncate" style={{ maxWidth: 80 }}>
                                {fromMember.name.split(' ')[0]}
                            </span>
                        </div>

                        {/* Arrow with amount */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span className="text-sm font-bold" style={{ color: 'var(--accent-amber-light)' }}>
                                {formatCurrency(tx.amount, group.currency)}
                            </span>
                            <div style={{
                                width: '100%',
                                height: 2,
                                background: 'var(--gradient-primary)',
                                position: 'relative',
                            }}>
                                <ArrowRight
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        right: -2,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--accent-cyan)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* To */}
                        <div className="flex items-center gap-sm" style={{ minWidth: 0, flex: '0 0 auto' }}>
                            <img src={getAvatarImage(toMember.avatarId || 1)} alt={toMember.name} className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                            <span className="text-sm font-semibold truncate" style={{ maxWidth: 80 }}>
                                {toMember.name.split(' ')[0]}
                            </span>
                        </div>
                    </div>
                );
            })}

            {transactions.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>Tüm borçlar eşit!</h3>
                    <p className="text-sm">Kimsenin kimseye borcu yok</p>
                </div>
            )}
        </div>
    );
}
