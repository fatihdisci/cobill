import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/helpers';
import { Wallet, Trash2, Download, Calendar, Loader2 } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import ExpenseFilterSort from '../components/ExpenseFilterSort';
import { generatePersonalStatementPDF } from '../utils/pdfGenerator';
import { sharePDF } from '../utils/fileService';

const PERSONAL_CATEGORIES = {
    Market: { icon: '🛒', label: 'Market', color: 'var(--accent-emerald)' },
    Fatura: { icon: '📋', label: 'Fatura', color: 'var(--accent-cyan)' },
    'Eğitim': { icon: '📚', label: 'Eğitim', color: 'var(--accent-blue)' },
    'Eğlence': { icon: '🎬', label: 'Eğlence', color: 'var(--accent-purple)' },
    'Ulaşım': { icon: '🚕', label: 'Ulaşım', color: 'var(--accent-amber)' },
    'Diğer': { icon: '📦', label: 'Diğer', color: 'var(--text-tertiary)' },
};

export default function PersonalWallet() {
    const { state, dispatch } = useApp();
    const [showProModal, setShowProModal] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const isPro = state.members[state.currentUser]?.isPro;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter this month's expenses (for the summary card — never changes with filter)
    const thisMonthExpenses = state.personalExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown for summary bar
    const categoryBreakdown = {};
    thisMonthExpenses.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    const handleDelete = (id) => {
        if (window.confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
            dispatch({ type: 'DELETE_PERSONAL_EXPENSE', payload: id });
        }
    };

    const handlePdfExport = async () => {
        if (!isPro) {
            setShowProModal(true);
            return;
        }
        if (thisMonthExpenses.length === 0) {
            alert('Bu ay için henüz harcama bulunmuyor.');
            return;
        }
        setPdfLoading(true);
        try {
            const monthName = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
            const user = state.members[state.currentUser];
            const base64 = await generatePersonalStatementPDF(
                thisMonthExpenses,
                user,
                monthName,
                PERSONAL_CATEGORIES
            );
            await sharePDF(base64, `CoBill_Ekstre_${monthName.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('[PersonalWallet] PDF export error:', err);
            alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setPdfLoading(false);
        }
    };

    // Use ExpenseFilterSort hook
    const { filteredExpenses, filterUI, emptyState } = ExpenseFilterSort({
        expenses: state.personalExpenses,
        categories: PERSONAL_CATEGORIES,
        categoryKey: 'category',
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h2>💳 Cüzdan</h2>
                    <p className="page-subtitle">Bireysel harcamalarınız</p>
                </div>
                <button className={`btn btn-sm ${isPro ? 'btn-pro-active' : 'btn-pro-gold'}`} onClick={handlePdfExport} disabled={pdfLoading} style={{ whiteSpace: 'nowrap' }}>
                    {pdfLoading ? <Loader2 size={14} className="spin" /> : <Download size={14} />}
                    {pdfLoading ? 'Hazırlanıyor...' : 'Ekstre İndir'}
                    <span className={`badge ${isPro ? 'badge-pro-active' : 'badge-pro-gold'}`} style={{ marginLeft: 4, padding: '1px 5px', fontSize: '8px' }}>PRO</span>
                </button>
            </div>

            {/* Monthly Summary Card — always shows real total */}
            <div className="glass-card static-card" style={{
                padding: 'var(--space-xl) var(--space-2xl)',
                marginBottom: 'var(--space-xl)',
                position: 'relative', overflow: 'hidden',
                background: 'var(--bg-card)',
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                <div className="flex items-center gap-md mb-md" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar size={16} />
                    <span className="text-sm font-semibold">
                        {now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, marginBottom: 'var(--space-xs)' }} className="text-gradient">
                    {formatCurrency(totalThisMonth, 'TRY')}
                </div>
                <div className="text-sm text-muted">Bu ay toplam {thisMonthExpenses.length} harcama</div>

                {/* Mini category bars */}
                {Object.keys(categoryBreakdown).length > 0 && (
                    <div className="flex gap-xs mt-lg" style={{ height: 6, borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--bg-glass)' }}>
                        {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                            const pct = totalThisMonth > 0 ? (amount / totalThisMonth * 100) : 0;
                            const catInfo = PERSONAL_CATEGORIES[cat] || PERSONAL_CATEGORIES['Diğer'];
                            return (
                                <div
                                    key={cat}
                                    style={{
                                        width: `${pct}%`,
                                        background: catInfo.color,
                                        borderRadius: 'var(--radius-full)',
                                        transition: 'width 0.5s ease',
                                    }}
                                    title={`${cat}: ${pct.toFixed(0)}%`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Filter Button */}
            <div style={{ marginBottom: 'var(--space-lg)' }}>
                {filterUI}
            </div>

            {/* Expense List */}
            {emptyState ? emptyState : filteredExpenses.length > 0 ? (
                <div className="flex flex-col gap-sm">
                    {filteredExpenses.map((expense, i) => {
                        const catInfo = PERSONAL_CATEGORIES[expense.category] || PERSONAL_CATEGORIES['Diğer'];
                        return (
                            <div
                                key={expense.id}
                                className={`glass-card flex items-center gap-lg animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                                style={{ padding: 'var(--space-md) var(--space-lg)' }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: '14px',
                                    background: `${catInfo.color}15`, color: catInfo.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', flexShrink: 0,
                                }}>
                                    {catInfo.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="font-semibold text-sm truncate">{expense.title}</div>
                                    <div className="text-xs text-muted flex items-center gap-xs">
                                        <span>{expense.category}</span>
                                        <span>·</span>
                                        <span>{formatDate(expense.date)}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div className="font-bold text-sm" style={{ color: 'var(--accent-rose)' }}>
                                        -{formatCurrency(expense.amount, 'TRY')}
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDelete(expense.id)}
                                    style={{ flexShrink: 0, opacity: 0.5 }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state glass-card static-card">
                    <div className="empty-icon">💳</div>
                    <h3>Henüz harcama yok</h3>
                    <p className="text-sm mb-lg">Alt menüdeki + butonuna basarak bireysel harcama ekleyin.</p>
                </div>
            )}

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
    );
}
