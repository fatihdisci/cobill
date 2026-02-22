import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    UserPlus, PlusCircle, ArrowLeft, Trash2, Ghost,
    Receipt, CalendarClock, MoreHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MemberManager from '../components/MemberManager';
import ExpenseForm from '../components/ExpenseForm';
import DebtSummary from '../components/DebtSummary';
import NudgeButton from '../components/NudgeButton';
import ActivityFeed from '../components/ActivityFeed';
import { MemberBalanceChart } from '../components/BalanceChart';
import { calculateBalances } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarColor, CATEGORIES, formatShortDate } from '../utils/helpers';

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

    const [showMembers, setShowMembers] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [activeTab, setActiveTab] = useState('debts');

    const group = state.groups.find(g => g.id === groupId);
    if (!group) {
        return (
            <div className="empty-state animate-fade-in">
                <div className="empty-icon">🔍</div>
                <h3>Grup bulunamadı</h3>
                <button className="btn btn-secondary mt-lg" onClick={() => navigate('/')}>
                    <ArrowLeft size={16} /> Dashboard'a Dön
                </button>
            </div>
        );
    }

    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
    const groupExpenses = state.expenses.filter(e => e.groupId === groupId);
    const balances = calculateBalances(groupExpenses, groupMembers);
    const totalSpent = groupExpenses.reduce((s, e) => s + e.amount, 0);
    const recurringExpenses = groupExpenses.filter(e => e.isRecurring);

    const handleDeleteGroup = () => {
        if (window.confirm(`"${group.name}" grubunu silmek istediğinize emin misiniz?`)) {
            dispatch({ type: 'DELETE_GROUP', payload: groupId });
            navigate('/');
        }
    };

    const handleDeleteExpense = (expenseId) => {
        dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
    };

    const tabs = [
        { id: 'debts', label: 'Borç Özeti', icon: '💰' },
        { id: 'expenses', label: 'Harcamalar', icon: '📋' },
        { id: 'chart', label: 'Grafikler', icon: '📊' },
        { id: 'activity', label: 'Aktivite', icon: '🕐' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-lg">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 style={{
                            borderLeft: `3px solid ${group.color || 'var(--accent-purple)'}`,
                            paddingLeft: 'var(--space-md)',
                        }}>
                            {group.name}
                        </h2>
                        <p className="page-subtitle" style={{ paddingLeft: 'var(--space-md)' }}>
                            {group.description || `${groupMembers.length} üye`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-sm">
                    <button className="btn btn-secondary" onClick={() => setShowMembers(true)}>
                        <UserPlus size={14} /> Üyeler
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
                        <PlusCircle size={14} /> Masraf Ekle
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={handleDeleteGroup} title="Grubu Sil">
                        <Trash2 size={16} style={{ color: 'var(--accent-rose)' }} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-3 mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-label">Toplam Harcama</div>
                    <div className="stat-value text-gradient">{formatCurrency(totalSpent, group.currency)}</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-label">Üye Sayısı</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>
                        {groupMembers.length}
                        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                            ({groupMembers.filter(m => m.isGhost).length} hayalet)
                        </span>
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-label">Tekrarlayan</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                        {recurringExpenses.length}
                    </div>
                </div>
            </div>

            {/* Member Balances */}
            <div className="glass-card mb-xl">
                <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>Üye Bakiyeleri</h4>
                <div className="flex flex-col gap-sm">
                    {groupMembers.map((member, i) => {
                        const balance = balances[member.id] || 0;
                        return (
                            <div key={member.id} className="flex items-center gap-md" style={{
                                padding: 'var(--space-md)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div className="avatar" style={{ background: getAvatarColor(member.id) }}>
                                    {getInitials(member.name)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="text-sm font-semibold flex items-center gap-sm">
                                        {member.name}
                                        {member.isGhost && <span className="badge badge-ghost"><Ghost size={9} /> Hayalet</span>}
                                    </div>
                                </div>
                                <div className="text-sm font-bold" style={{
                                    color: balance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                                }}>
                                    {balance >= 0 ? '+' : ''}{formatCurrency(balance, group.currency)}
                                </div>
                                {balance < 0 && (
                                    <NudgeButton
                                        memberId={member.id}
                                        amount={balance}
                                        groupName={group.name}
                                        currency={group.currency}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-sm mb-xl" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-sm)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`btn btn-ghost ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
                            borderRadius: 0,
                            color: activeTab === tab.id ? 'var(--accent-purple-light)' : 'var(--text-tertiary)',
                        }}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in" key={activeTab}>
                {activeTab === 'debts' && (
                    <div className="glass-card">
                        <h4 className="mb-lg">Sadeleştirilmiş Borçlar</h4>
                        <DebtSummary groupId={groupId} />
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="glass-card">
                        <div className="flex items-center justify-between mb-lg">
                            <h4>Harcama Geçmişi</h4>
                            <span className="badge badge-purple">{groupExpenses.length} masraf</span>
                        </div>
                        <div className="hide-mobile">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Açıklama</th>
                                        <th>Kategori</th>
                                        <th>Ödeyen</th>
                                        <th>Tarih</th>
                                        <th style={{ textAlign: 'right' }}>Tutar</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupExpenses.map(expense => {
                                        const payer = state.members[expense.paidBy];
                                        const cat = CATEGORIES[expense.category] || CATEGORIES.other;
                                        return (
                                            <tr key={expense.id}>
                                                <td>
                                                    <div className="flex items-center gap-sm">
                                                        {expense.isRecurring && <CalendarClock size={14} style={{ color: 'var(--accent-amber)' }} />}
                                                        <span className="font-medium">{expense.description}</span>
                                                    </div>
                                                </td>
                                                <td><span>{cat.icon} {cat.label}</span></td>
                                                <td>
                                                    <div className="flex items-center gap-sm">
                                                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(payer?.id || '') }}>
                                                            {getInitials(payer?.name || '?')}
                                                        </div>
                                                        {payer?.name?.split(' ')[0]}
                                                    </div>
                                                </td>
                                                <td className="text-muted">{formatShortDate(expense.date)}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className="font-bold">{formatCurrency(expense.amount, expense.currency)}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        style={{ color: 'var(--accent-rose)' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile expense list */}
                        <div className="show-mobile" style={{ display: 'none', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {groupExpenses.map(expense => {
                                const payer = state.members[expense.paidBy];
                                const cat = CATEGORIES[expense.category] || CATEGORIES.other;
                                return (
                                    <div key={expense.id} className="flex items-center gap-md" style={{
                                        padding: 'var(--space-md)',
                                        background: 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-md)',
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div className="text-sm font-semibold">{expense.description}</div>
                                            <div className="text-xs text-muted">{payer?.name?.split(' ')[0]} • {formatShortDate(expense.date)}</div>
                                        </div>
                                        <span className="font-bold text-sm">{formatCurrency(expense.amount, expense.currency)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'chart' && (
                    <div className="glass-card">
                        <h4 className="mb-lg">Kişi Başı Harcama</h4>
                        <MemberBalanceChart groupId={groupId} />
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="glass-card">
                        <h4 className="mb-lg">Aktivite Akışı</h4>
                        <ActivityFeed groupId={groupId} limit={20} />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showMembers && (
                <MemberManager groupId={groupId} onClose={() => setShowMembers(false)} />
            )}

            {showExpenseForm && (
                <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
                    <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h3>Masraf Ekle</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowExpenseForm(false)}>✕</button>
                        </div>
                        <ExpenseForm groupId={groupId} onClose={() => setShowExpenseForm(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
