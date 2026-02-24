import { useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarColor, CATEGORIES } from '../utils/helpers';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Receipt, HandCoins, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationMenu({ onClose, isMobile }) {
    const { state } = useApp();
    const menuRef = useRef();
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Aggregate data
    const notifications = useMemo(() => {
        if (!state.currentUser) return [];

        const activities = [];

        // Add Expenses
        state.expenses.forEach(exp => {
            const group = state.groups.find(g => g.id === exp.groupId);
            if (!group) return;

            const payer = state.members[exp.paidBy];
            const isMePayer = exp.paidBy === state.currentUser;
            const amIInvolved = exp.splitAmong.includes(state.currentUser);

            // Basic filtering if we want to show everything or just involved
            if (group.members.includes(state.currentUser)) {
                activities.push({
                    id: `exp_${exp.id}`,
                    type: 'expense',
                    date: new Date(exp.date),
                    groupId: exp.groupId,
                    groupName: group.name,
                    title: isMePayer
                        ? `"${exp.description}" masrafını ekledin`
                        : `${payer?.name?.split(' ')[0] || 'Biri'} "${exp.description}" masrafını ekledi`,
                    amount: exp.amount,
                    currency: exp.currency,
                    categoryId: exp.category,
                    icon: Receipt,
                    color: 'var(--accent-purple)'
                });
            }
        });

        // Add Settlements
        state.settlements.forEach(set => {
            const group = state.groups.find(g => g.id === set.groupId);
            if (!group) return;

            const fromUser = state.members[set.from];
            const toUser = state.members[set.to];
            const isMeFrom = set.from === state.currentUser;
            const isMeTo = set.to === state.currentUser;

            let title = '';
            let show = false;

            if (set.status === 'paid') {
                if (isMeFrom) {
                    title = `${toUser?.name?.split(' ')[0] || 'Biri'} kişisine olan borcunu ödedin`;
                    show = true;
                } else if (isMeTo) {
                    title = `${fromUser?.name?.split(' ')[0] || 'Biri'} sana olan borcunu ödedi`;
                    show = true;
                } else {
                    title = `${fromUser?.name?.split(' ')[0]} -> ${toUser?.name?.split(' ')[0]} ödeme yaptı`;
                    show = true;
                }
            }

            if (show) {
                activities.push({
                    id: `set_${set.id}`,
                    type: 'settlement',
                    date: new Date(set.paidAt || set.createdAt),
                    groupId: set.groupId,
                    groupName: group.name,
                    title,
                    amount: set.amount,
                    currency: set.currency,
                    icon: HandCoins,
                    color: 'var(--accent-emerald)'
                });
            }
        });

        // Sort latest first
        return activities.sort((a, b) => b.date - a.date).slice(0, 15);
    }, [state.expenses, state.settlements, state.currentUser, state.groups, state.members]);

    const handleNavigate = (groupId) => {
        navigate(`/group/${groupId}`);
        onClose();
    };

    return (
        <div ref={menuRef} style={{
            position: 'absolute',
            top: isMobile ? '56px' : '40px',
            right: isMobile ? '0' : '-80px',
            width: '320px',
            maxHeight: '400px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideUp 0.2s ease-out'
        }}>
            <div style={{
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--gradient-card)'
            }}>
                <h4 style={{ margin: 0, fontSize: 'var(--font-md)' }}>Bildirimler</h4>
                <div className="badge badge-purple">{notifications.length} Yeni</div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Info size={24} style={{ margin: '0 auto var(--space-sm)' }} />
                        <p style={{ fontSize: 'var(--font-sm)' }}>Henüz bir bildirim yok.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {notifications.map(notif => {
                            const Icon = notif.icon;
                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNavigate(notif.groupId)}
                                    style={{
                                        padding: 'var(--space-md)',
                                        borderBottom: '1px solid var(--border-primary)',
                                        display: 'flex',
                                        gap: 'var(--space-sm)',
                                        cursor: 'pointer',
                                        transition: 'background var(--transition-fast)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        backgroundColor: 'var(--bg-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: notif.color,
                                        flexShrink: 0
                                    }}>
                                        <Icon size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                                            {notif.title}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                {formatDistanceToNow(notif.date, { addSuffix: true, locale: tr })}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: notif.color }}>
                                                {formatCurrency(notif.amount, notif.currency)}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                                            📍 {notif.groupName}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div style={{
                padding: 'var(--space-sm)',
                textAlign: 'center',
                borderTop: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
            }}>
                Sadece üyesi olduğun grupların son 15 olayı
            </div>
        </div>
    );
}
