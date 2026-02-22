import { ArrowRight, Zap, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateBalances, simplifyDebts, getNaiveTransactionCount } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarColor } from '../utils/helpers';

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

    const balances = calculateBalances(groupExpenses, groupMembers);
    const transactions = simplifyDebts(balances);
    const naiveCount = getNaiveTransactionCount(groupExpenses);

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

            {/* Transaction List */}
            {transactions.map((tx, i) => {
                const fromMember = getMember(tx.from);
                const toMember = getMember(tx.to);

                return (
                    <div key={i} className={`debt-arrow animate-fade-in-up stagger-${i + 1}`}>
                        {/* From */}
                        <div className="flex items-center gap-sm" style={{ minWidth: 0, flex: '0 0 auto' }}>
                            <div className="avatar avatar-sm" style={{ background: getAvatarColor(fromMember.id) }}>
                                {getInitials(fromMember.name)}
                            </div>
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
                            <div className="avatar avatar-sm" style={{ background: getAvatarColor(toMember.id) }}>
                                {getInitials(toMember.name)}
                            </div>
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
