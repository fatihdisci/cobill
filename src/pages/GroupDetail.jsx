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
import { getInitials, getAvatarColor, CATEGORIES, formatShortDate } from '../utils/helpers';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { generateGroupPDF } from '../utils/pdfGenerator';
import { sharePDF } from '../utils/fileService';

export default function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useApp();

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
                <h3>Grup bulunamadı</h3>
                <button className="btn btn-secondary mt-lg" onClick={() => navigate('/groups')}>
                    <ArrowLeft size={16} /> Gruplara Dön
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

    const handleDeleteGroup = () => {
        if (window.confirm(`"${group.name}" grubunu silmek istediğinize emin misiniz?`)) {
            dispatch({ type: 'DELETE_GROUP', payload: groupId });
            navigate('/groups');
        }
    };

    const handleLeaveGroup = () => {
        if (window.confirm(`"${group.name}" grubundan çıkmak istediğinize emin misiniz?`)) {
            dispatch({ type: 'REMOVE_MEMBER_FROM_GROUP', payload: { groupId, memberId: state.currentUser } });
            navigate('/groups');
        }
    };

    const canDeleteExpense = (expense) => {
        return expense.paidBy === state.currentUser || isAdmin;
    };

    const handleDeleteExpense = (expense) => {
        if (!canDeleteExpense(expense)) return;
        if (window.confirm(`"${expense.description}" tutarındaki bu masrafı silmek istediğinize emin misiniz?`)) {
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
            alert('PDF oluşturulurken bir hata oluştu.');
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
                            {!isAdmin && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Paylaşılan</span>}
                        </h2>
                        <p className="page-subtitle" style={{ paddingLeft: 'var(--space-md)' }}>
                            {group.description || `${groupMembers.length} üye`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-sm flex-wrap" style={{ justifyContent: 'flex-start', marginTop: 'var(--space-md)' }}>
                    <button className={`btn btn-sm ${isPro ? 'btn-pro-active' : 'btn-pro-gold'}`} onClick={handleExportPDF} disabled={isGenerating}>
                        <FileText size={14} /> {isGenerating ? 'Hazırlanıyor...' : 'PDF İndir'}
                        <span className={`badge ${isPro ? 'badge-pro-active' : 'badge-pro-gold'}`} style={{ marginLeft: 6, padding: '2px 6px', fontSize: '9px' }}>PRO</span>
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowMembers(true)}>
                        <UserPlus size={14} /> Üyeler
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowExpenseForm(true)}>
                        <PlusCircle size={14} /> Masraf
                    </button>
                    {isAdmin ? (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleDeleteGroup} title="Grubu Sil">
                            <Trash2 size={16} style={{ color: 'var(--accent-rose)' }} />
                        </button>
                    ) : (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={handleLeaveGroup} title="Gruptan Çık">
                            <LogOut size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-3 mb-xl mobile-scroller" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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
                        const hasIban = member.iban && member.iban.length > 5;

                        return (
                            <div key={member.id} className="flex items-start gap-md" style={{
                                padding: 'var(--space-md)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div className="avatar" style={{ background: getAvatarColor(member.id), flexShrink: 0 }}>
                                    {getInitials(member.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="flex justify-between items-start mb-sm gap-sm flex-wrap">
                                        <div>
                                            <div className="text-sm font-semibold flex items-center gap-sm flex-wrap">
                                                {member.name}
                                                {member.isGhost && <span className="badge badge-ghost"><Ghost size={9} /> Hayalet</span>}
                                            </div>
                                            {!hasIban && (
                                                <div className="text-xs text-tertiary mt-xs">IBAN bilgisi yok</div>
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
                                                    title="IBAN Kopyala"
                                                >
                                                    {copyFeedback[member.id] ? (
                                                        <><Check size={12} /> Kopyalandı!</>
                                                    ) : (
                                                        <><Copy size={12} /> IBAN Kopyala</>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => setShowMembers(true)}
                                                    title="IBAN Ekle"
                                                >
                                                    <Edit2 size={12} /> IBAN Ekle
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
                <div className="glass-card">
                    <h4 className="mb-lg flex items-center gap-sm">💰 Sadeleştirilmiş Borçlar</h4>
                    <DebtSummary groupId={groupId} />
                </div>

                <div className="glass-card">
                    <div className="flex items-center justify-between mb-lg">
                        <h4 className="flex items-center gap-sm">📋 Harcama Geçmişi</h4>
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

                <div className="glass-card">
                    <h4 className="mb-lg flex items-center gap-sm">📊 Kişi Başı Harcama</h4>
                    <MemberBalanceChart groupId={groupId} />
                </div>

                <div className="glass-card">
                    <h4 className="mb-lg flex items-center gap-sm">🕐 Aktivite Akışı</h4>
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
                            <h3>Masraf Ekle</h3>
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
