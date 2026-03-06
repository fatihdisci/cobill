import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    UserPlus, PlusCircle, ArrowLeft, Trash2, Ghost,
    Receipt, CalendarClock, MoreHorizontal, Copy, Check, Edit2, FileText,
    LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MemberManager from '../components/MemberManager';
import ExpenseForm from '../components/ExpenseForm';
import DebtSummary from '../components/DebtSummary';
import NudgeButton from '../components/NudgeButton';
import ActivityFeed from '../components/ActivityFeed';
import { MemberBalanceChart } from '../components/BalanceChart';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import { getInitials, getAvatarImage, CATEGORIES, formatShortDate } from '../utils/helpers';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { generateGroupPDF } from '../utils/pdfGenerator';
import { sharePDF } from '../utils/fileService';
import ExpenseFilterSort from '../components/ExpenseFilterSort';
import { useTranslation } from 'react-i18next';

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { t } = useTranslation();

    const [showMembers, setShowMembers] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;

    const group = state.groups.find(g => g.id === groupId);
    if (!group) {
        return (
            <div className="empty-state animate-fade-in">
                <div className="empty-icon">🔍</div>
                <h3>{t('groups.groupNotFound')}</h3>
                <button className="btn btn-secondary mt-lg" onClick={() => navigate('/groups')}>
                    <ArrowLeft size={16} /> {t('groups.backToGroups')}
                </button>
            </div>
        );
    }

    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
    const groupExpenses = state.expenses.filter(e => e.groupId === groupId);
    const isAdmin = group.createdBy === state.currentUser;
    const balances = calculateBalances(groupExpenses, groupMembers);
    const totalSpent = groupExpenses.reduce((s, e) => s + e.amount, 0);
    const recurringExpenses = groupExpenses.filter(e => e.isRecurring);

    // ExpenseFilterSort hook for the expense history section
    const { filteredExpenses: filteredGroupExpenses, filterUI: groupFilterUI, emptyState: groupEmptyState } = ExpenseFilterSort({
        expenses: groupExpenses,
        categories: CATEGORIES,
        categoryKey: 'category',
        members: state.members,
        enableDateFilter: true,
    });

    const handleDeleteGroup = () => {
        if (window.confirm(t('groups.deleteGroupConfirm', { name: group.name }))) {
            dispatch({ type: 'DELETE_GROUP', payload: groupId });
            navigate('/groups');
        }
    };

    const handleLeaveGroup = () => {
        if (window.confirm(t('groups.leaveGroupConfirm', { name: group.name }))) {
            dispatch({ type: 'REMOVE_MEMBER_FROM_GROUP', payload: { groupId, memberId: state.currentUser } });
            navigate('/groups');
        }
    };

    const canDeleteExpense = (expense) => {
        return expense.paidBy === state.currentUser || isAdmin;
    };

    const handleDeleteExpense = (expense) => {
        if (!canDeleteExpense(expense)) return;
        if (window.confirm(t('groups.deleteExpenseConfirm', { desc: expense.description }))) {
            dispatch({ type: 'DELETE_EXPENSE', payload: expense.id });
        }
    };

    const handleCopyIBAN = (iban, memberId) => {
        if (!iban) return;
        const cleanIban = iban.replace(/\s/g, '');
        navigator.clipboard.writeText(cleanIban).then(() => {
            setCopyFeedback(prev => ({ ...prev, [memberId]: true }));
            setTimeout(() => {
                setCopyFeedback(prev => ({ ...prev, [memberId]: false }));
            }, 2000);
        });
    };

    const handleExportPDF = async () => {
        if (!isPro) {
            setShowProModal(true);
            return;
        }

        try {
            setIsGenerating(true);
            const simplifiedDebts = simplifyDebts(balances);
            const base64PDF = await generateGroupPDF(group, groupMembers, groupExpenses, balances, simplifiedDebts);

            await sharePDF(base64PDF, `CoBill_${group.name.replace(/\s+/g, '_')}_Rapor.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert(t('groups.pdfError'));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-lg">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/groups')}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 style={{
                            borderLeft: `3px solid ${group.color || 'var(--accent-purple)'}`,
                            paddingLeft: 'var(--space-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)'
                        }}>
                            {group.name}
                            {!isAdmin && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{t('groups.shared')}</span>}
                        </h2>
                        <p className="page-subtitle" style={{ paddingLeft: 'var(--space-md)' }}>
                            {group.description || `${groupMembers.length} ${t('common.user')}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-sm" style={{ overflowX: 'auto', marginTop: 'var(--space-md)', paddingBottom: 'var(--space-xs)', flexWrap: 'nowrap' }}>
                    <button className={`btn btn-sm ${isPro ? 'btn-pro-active' : 'btn-pro-gold'}`} onClick={handleExportPDF} disabled={isGenerating} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '4px 10px', minHeight: '34px', fontSize: '0.78rem' }}>
                        <FileText size={13} /> {isGenerating ? '...' : t('groups.downloadPdf')}
                        <span className={`badge ${isPro ? 'badge-pro-active' : 'badge-pro-gold'}`} style={{ marginLeft: 4, padding: '1px 5px', fontSize: '8px' }}>PRO</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowMembers(true)} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '4px 10px', minHeight: '34px', fontSize: '0.78rem' }}>
                        <UserPlus size={13} /> {t('groups.members')}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: '4px 10px', minHeight: '34px', fontSize: '0.78rem', boxShadow: 'none' }}>
                        <PlusCircle size={13} /> {t('groups.expense')}
                    </button>
                    {isAdmin ? (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleDeleteGroup} title="Grubu Sil" style={{ flexShrink: 0, minHeight: '34px', width: '34px', height: '34px', padding: 0 }}>
                            <Trash2 size={15} style={{ color: 'var(--accent-rose)' }} />
                        </button>
                    ) : (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleLeaveGroup} title="Gruptan Çık" style={{ flexShrink: 0, minHeight: '34px', width: '34px', height: '34px', padding: 0 }}>
                            <LogOut size={15} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-3 mb-xl mobile-scroller" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-label">{t('groups.totalExpense')}</div>
                    <div className="stat-value text-gradient">{formatCurrency(totalSpent, group.currency)}</div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-label">{t('groups.memberCount')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>
                        {groupMembers.length}
                        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
                            {t('groups.ghostCount', { count: groupMembers.filter(m => m.isGhost).length })}
                        </span>
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-label">{t('groups.recurring')}</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                        {recurringExpenses.length}
                    </div>
                </div>
            </div>

            {/* Member Balances */}
            <div className="glass-card static-card mb-xl">
                <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>{t('groups.memberBalances')}</h4>
                <div className="flex flex-col gap-sm">
                    {groupMembers.map((member, i) => {
                        const balance = balances[member.id] || 0;
                        const hasIban = member.iban && member.iban.length > 5;

                        return (
                            <div key={member.id} className="flex items-start gap-md" style={{
                                padding: 'var(--space-md)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <img src={getAvatarImage(member.avatarId || 1)} alt={member.name} className="avatar" style={{ flexShrink: 0, objectFit: 'cover' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="flex justify-between items-start mb-sm gap-sm flex-wrap">
                                        <div>
                                            <div className="text-sm font-semibold flex items-center gap-sm flex-wrap">
                                                {member.name}
                                                {member.isGhost && <span className="badge badge-ghost"><Ghost size={9} /> {t('groups.ghost')}</span>}
                                            </div>
                                            {!hasIban && (
                                                <div className="text-xs text-tertiary mt-xs">{t('groups.noIban')}</div>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold" style={{
                                            color: balance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {balance >= 0 ? '+' : ''}{formatCurrency(balance, group.currency)}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-sm w-full mt-sm">
                                        <div className="flex justify-between items-center w-full">
                                            {hasIban ? (
                                                <button
                                                    className={`btn btn-sm ${copyFeedback[member.id] ? 'btn-success' : 'btn-secondary'}`}
                                                    onClick={() => handleCopyIBAN(member.iban, member.id)}
                                                    title={t('groups.copyIban')}
                                                >
                                                    {copyFeedback[member.id] ? (
                                                        <><Check size={12} /> {t('groups.copied')}</>
                                                    ) : (
                                                        <><Copy size={12} /> {t('groups.copyIban')}</>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => setShowMembers(true)}
                                                    title={t('groups.addIban')}
                                                >
                                                    <Edit2 size={12} /> {t('groups.addIban')}
                                                </button>
                                            )}
                                        </div>
                                        {balance < 0 && (
                                            <div className="w-full flex justify-end">
                                                <div style={{ width: '100%', maxWidth: '280px' }}>
                                                    <NudgeButton
                                                        memberId={member.id}
                                                        amount={balance}
                                                        groupName={group.name}
                                                        currency={group.currency}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col gap-xl">
                <div className="glass-card static-card">
                    <h4 className="mb-lg flex items-center gap-sm">💰 {t('groups.simplifiedDebts')}</h4>
                    <DebtSummary groupId={groupId} />
                </div>

                <div className="glass-card static-card">
                    <h4 className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)' }}>📋 {t('groups.expenseHistory')}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        {groupFilterUI}
                        <span className="badge badge-purple">{filteredGroupExpenses.length} {t('groups.expense').toLowerCase()}</span>
                    </div>
                    <div className="hide-mobile">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('groups.description')}</th>
                                    <th>{t('groups.category')}</th>
                                    <th>{t('groups.paidBy')}</th>
                                    <th>{t('groups.date')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('groups.amount')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGroupExpenses.map(expense => {
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
                                                    <img src={getAvatarImage(payer?.avatarId || 1)} alt={payer?.name || '?'} className="avatar avatar-sm" style={{ objectFit: 'cover' }} />
                                                    {payer?.name?.split(' ')[0]}
                                                </div>
                                            </td>
                                            <td className="text-muted">{formatShortDate(expense.date)}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="font-bold">{formatCurrency(expense.amount, expense.currency)}</span>
                                            </td>
                                            <td>
                                                {canDeleteExpense(expense) && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleDeleteExpense(expense)}
                                                        style={{ color: 'var(--accent-rose)' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile expense list */}
                    <div className="show-mobile" style={{ display: 'none', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {filteredGroupExpenses.map(expense => {
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
                    {groupEmptyState}
                </div>

                <div className="glass-card static-card">
                    <h4 className="mb-lg flex items-center gap-sm">📊 {t('groups.perPersonExpense')}</h4>
                    <MemberBalanceChart groupId={groupId} />
                </div>

                <div className="glass-card static-card">
                    <h4 className="mb-lg flex items-center gap-sm">🕐 {t('groups.activityFeed')}</h4>
                    <ActivityFeed groupId={groupId} limit={20} />
                </div>
            </div>

            {/* Modals */}
            {showMembers && (
                <MemberManager groupId={groupId} onClose={() => setShowMembers(false)} />
            )}

            {showExpenseForm && (
                <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <h3>{t('groups.addExpenseTitle')}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowExpenseForm(false)}>✕</button>
                        </div>
                        <ExpenseForm groupId={groupId} onClose={() => setShowExpenseForm(false)} />
                    </div>
                </div>
            )}

            {showProModal && (
                <ProUpgradeModal onClose={() => setShowProModal(false)} />
            )}
        </div>
    );
}
