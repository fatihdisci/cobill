import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getInitials, getAvatarImage } from '../utils/helpers';
import { formatCurrency } from '../utils/currencyUtils';
import { calculateBalances } from '../utils/debtSimplification';
import { useTranslation } from 'react-i18next';

export default function GroupCard({ group, index }) {
    const navigate = useNavigate();
    const { state } = useApp();
    const { t } = useTranslation();

    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
    const groupExpenses = state.expenses.filter(e => e.groupId === group.id);

    const totalSpent = groupExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate current user's balance
    const balances = calculateBalances(groupExpenses, groupMembers);
    const myBalance = balances[state.currentUser] || 0;

    return (
        <div
            className={`glass-card animate-fade-in-up stagger-${index + 1}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/group/${group.id}`)}
        >
            {/* Color accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${group.color || 'var(--accent-purple)'}, transparent)`,
            }} />

            <div className="flex items-center justify-between mb-md">
                <h4 style={{ fontSize: 'var(--font-md)' }}>{group.name}</h4>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <p className="text-sm text-muted mb-lg">{group.description}</p>

            {/* Member Avatars */}
            <div className="flex items-center justify-between mb-lg">
                <div className="avatar-stack">
                    {groupMembers.slice(0, 4).map((member) => (
                        <img
                            key={member.id}
                            src={getAvatarImage(member.avatarId || 1)}
                            alt={member.name}
                            className="avatar avatar-sm"
                            style={{ objectFit: 'cover' }}
                            title={member.name}
                        />
                    ))}
                    {groupMembers.length > 4 && (
                        <div className="avatar avatar-sm" style={{ background: 'var(--bg-tertiary)', fontSize: '0.6rem' }}>
                            +{groupMembers.length - 4}
                        </div>
                    )}
                </div>
                <span className="badge badge-purple">
                    <Users size={10} /> {groupMembers.length} {t('groupCard.members')}
                </span>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-md)',
                padding: 'var(--space-md)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
            }}>
                <div>
                    <div className="text-xs text-muted">{t('groupCard.totalExpense')}</div>
                    <div className="font-bold" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-base)' }}>
                        {formatCurrency(totalSpent, group.currency)}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="text-xs text-muted">{t('groupCard.yourBalance')}</div>
                    <div className="font-bold flex items-center justify-end gap-xs" style={{
                        color: myBalance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        fontSize: 'var(--font-base)',
                    }}>
                        {myBalance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatCurrency(myBalance, group.currency)}
                    </div>
                </div>
            </div>
        </div>
    );
}
