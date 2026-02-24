import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpendingByCategory, MemberBalanceChart } from '../components/BalanceChart';
import { formatCurrency } from '../utils/currencyUtils';
import { CATEGORIES, formatDate } from '../utils/helpers';
import { FileText, Download, Mail, Copy, Lock, MessageCircle, X, CheckCircle2, ArrowRight } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { generateGroupPDF } from '../utils/pdfGenerator';
import { sharePDF } from '../utils/fileService';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';

export default function Reports() {
    const { state } = useApp();
    const [selectedGroup, setSelectedGroup] = useState(state.groups[0]?.id || '');
    const [showExport, setShowExport] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;

    const group = state.groups.find(g => g.id === selectedGroup);
    const expenses = state.expenses.filter(e => e.groupId === selectedGroup);
    const groupSettlements = state.settlements.filter(s => s.groupId === selectedGroup && s.status === 'paid');
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    // Monthly breakdown
    const monthlyData = {};
    expenses.forEach(e => {
        const month = new Date(e.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
        monthlyData[month] = (monthlyData[month] || 0) + e.amount;
    });

    // Generate report text (Professional Bank-Grade Layout)
    const generateReport = () => {
        if (!group) return '';
        const divider = '━'.repeat(45);
        const subDivider = '─'.repeat(45);

        const lines = [
            `📊 COBILL FİNANSAL RAPORU`,
            `Grup: ${group.name.toUpperCase()}`,
            `Oluşturma: ${formatDate(new Date().toISOString())}`,
            divider,
            '',
            `💰 ÖZET BİLGİLER`,
            `• Toplam Harcama    : ${formatCurrency(totalSpent, group.currency)}`,
            `• Kayıtlı Masraf   : ${expenses.length} adet`,
            `• Grup Üye Sayısı  : ${group.members.length} kişi`,
            `• Üye Başı Ort.    : ${formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency)}`,
            '',
            `📋 KATEGORİ DAĞILIMI`,
            subDivider,
            ...Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                    const c = CATEGORIES[cat] || CATEGORIES.other;
                    const label = c.label.padEnd(15, '.');
                    return `${c.icon} ${label}: ${formatCurrency(amount, group.currency)}`;
                }),
            '',
            `📅 AYLIK HARCAMA DEĞİŞİMİ`,
            subDivider,
            ...Object.entries(monthlyData).map(([month, amount]) => {
                const label = month.padEnd(20, '.');
                return `• ${label}: ${formatCurrency(amount, group.currency)}`;
            }),
            '',
            `📝 HARCAMA DETAYLARI`,
            subDivider,
            ...expenses.map((e, i) => {
                const payer = state.members[e.paidBy];
                const date = formatDate(e.date).split(' ')[0];
                return `[${date}] ${e.description}\n     └─ ${formatCurrency(e.amount, e.currency)} (${payer?.name || '?'})`;
            }),
            '',
            `🤝 TAMAMLANAN ÖDEMELER`,
            subDivider,
            ...groupSettlements.map((s, i) => {
                const fromMember = state.members[s.from];
                const toMember = state.members[s.to];
                const date = formatDate(s.date || s.paidAt).split(' ')[0];
                return `[${date}] ${fromMember?.name?.split(' ')[0]} ➔ ${toMember?.name?.split(' ')[0]}\n     └─ ${formatCurrency(s.amount, s.currency)} (Tamamlandı)`;
            }),
            groupSettlements.length === 0 ? '  (Henüz tamamlanmış ödeme kaydı yok)' : '',
            '',
            divider,
            'Bu rapor CoBill tarafından otomatik oluşturulmuştur.',
            'Finansal özgürlüğünüz için: CoBill 🚀',
        ];
        return lines.join('\n');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateReport());
            alert('Rapor panoya kopyalandı!');
        } catch {
            alert('Kopyalama başarısız');
        }
    };

    const handleEmail = () => {
        const subject = `CoBill Raporu — ${group?.name || ''}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generateReport())}`);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(generateReport())}`);
        setShowExportModal(false);
    };

    const handleExportPDF = async () => {
        if (!group) return;
        try {
            setIsGenerating(true);
            const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
            const balances = calculateBalances(expenses, groupMembers);
            const simplifiedDebts = simplifyDebts(balances);

            const base64PDF = await generateGroupPDF(group, groupMembers, expenses, balances, simplifiedDebts, groupSettlements);
            await sharePDF(base64PDF, `CoBill_${group.name.replace(/\s+/g, '_')}_Rapor.pdf`);
        } catch (error) {
            console.error('PDF Export Error:', error);
            alert('PDF oluşturulurken bir hata oluştu.');
        } finally {
            setIsGenerating(false);
            setShowExportModal(false);
        }
    };

    return (
        <div className="animate-fade-in relative">
            <div className="page-header">
                <div>
                    <h2>Raporlar <span className="badge badge-purple" style={{ marginLeft: 8, verticalAlign: 'middle' }}>PRO</span></h2>
                    <p className="page-subtitle">Harcama analizi ve dışa aktarma</p>
                </div>
                <div className="flex gap-sm">
                    <button className={`btn ${isPro ? 'btn-pro-active' : 'btn-pro-gold'}`} onClick={() => setShowExportModal(true)} disabled={!isPro || !group}>
                        <Download size={14} /> Dışarı Aktar
                        {!isPro && <span className="badge badge-pro-gold" style={{ marginLeft: 6, padding: '2px 6px', fontSize: '10px' }}>PRO</span>}
                    </button>
                </div>
            </div>

            {!isPro && (
                <div style={{
                    position: 'absolute', top: 80, left: 0, right: 0, bottom: 0,
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10vh',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)', borderRadius: 12, minHeight: 400
                }}>
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: 360 }}>
                        <Lock size={48} style={{ color: '#d97706', margin: '0 auto', marginBottom: 'var(--space-md)' }} />
                        <h3 className="mb-sm" style={{ color: '#b45309' }}>Pro Özelliği</h3>
                        <p className="text-muted text-sm mb-lg">Detaylı harcama analizleri, kategori bazlı dağılımlar ve rapor çıktıları sadece CoBill Pro üyelerine özeldir.</p>
                        <button className="btn w-full btn-pro-gold" onClick={() => setShowProModal(true)}>
                            Pro'ya Geçiş Yap
                        </button>
                    </div>
                </div>
            )}

            {/* Group Selector */}
            <div className="form-group mb-xl" style={{ maxWidth: 300 }}>
                <label className="form-label">Grup Seçin</label>
                <select
                    className="form-select"
                    value={selectedGroup}
                    onChange={e => setSelectedGroup(e.target.value)}
                >
                    {state.groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-3 mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-label">Toplam Harcama</div>
                    <div className="stat-value text-gradient">
                        {formatCurrency(totalSpent, group?.currency || 'TRY')}
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-label">Masraf Sayısı</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>
                        {expenses.length}
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-label">Kişi Başı Ortalama</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                        {group ? formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency) : '₺0'}
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }} className="reports-grid">
                <div className="glass-card">
                    <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>📊 Kategori Dağılımı</h4>
                    <SpendingByCategory groupId={selectedGroup} />
                </div>

                <div className="glass-card">
                    <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>👥 Kişi Başı Harcama</h4>
                    <MemberBalanceChart groupId={selectedGroup} />
                </div>
            </div>

            {/* Category Table (desktop) */}
            <div className="glass-card mt-xl hide-mobile">
                <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>Kategori Detayları</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th style={{ textAlign: 'right' }}>Tutar</th>
                            <th style={{ textAlign: 'right' }}>Yüzde</th>
                            <th>Dağılım</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cat, amount]) => {
                                const c = CATEGORIES[cat] || CATEGORIES.other;
                                const pct = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
                                return (
                                    <tr key={cat}>
                                        <td>
                                            <span className="flex items-center gap-sm">
                                                <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                                                <span className="font-medium">{c.label}</span>
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="font-bold">{formatCurrency(amount, group?.currency || 'TRY')}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="text-muted">{pct.toFixed(1)}%</span>
                                        </td>
                                        <td>
                                            <div className="progress-bar" style={{ width: 120 }}>
                                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* Payment History section */}
            <div className="glass-card mt-xl">
                <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>🤝 Grup Ödemeleri</h4>
                {groupSettlements.length > 0 ? (
                    <div className="flex flex-col gap-sm">
                        {groupSettlements.map((s, i) => {
                            const fromMember = state.members[s.from];
                            const toMember = state.members[s.to];

                            return (
                                <div key={s.id} className="flex items-center gap-md" style={{
                                    padding: 'var(--space-md)',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-primary)',
                                    animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`
                                }}>
                                    <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="text-sm font-medium">
                                            <strong>{fromMember?.name?.split(' ')[0]}</strong>
                                            <ArrowRight size={12} style={{ margin: '0 8px', color: 'var(--text-tertiary)' }} />
                                            <strong>{toMember?.name?.split(' ')[0]}</strong>
                                        </div>
                                        <div className="text-xs text-muted">{formatDate(s.date || s.paidAt)}</div>
                                    </div>
                                    <div className="text-sm font-bold" style={{ color: 'var(--accent-emerald-light)' }}>
                                        {formatCurrency(s.amount, s.currency)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-xl">
                        <p className="text-muted text-sm">Bu grupta henüz kaydedilmiş ödeme bulunmuyor.</p>
                    </div>
                )}
            </div>

            <style>{`
        @media (max-width: 767px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

            {showProModal && (
                <ProUpgradeModal onClose={() => setShowProModal(false)} />
            )}

            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header mb-md">
                            <h3 className="flex items-center gap-xs"><Download size={18} /> Raporu Dışarı Aktar</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowExportModal(false)}><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-sm">
                            <button
                                className="btn btn-secondary w-full flex justify-start items-center gap-md"
                                onClick={handleExportPDF}
                                disabled={isGenerating}
                            >
                                <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
                                {isGenerating ? 'PDF Hazırlanıyor...' : 'PDF İndir / Paylaş'}
                            </button>
                            <button
                                className="btn btn-secondary w-full flex justify-start items-center gap-md"
                                onClick={() => { handleWhatsApp(); setShowExportModal(false); }}
                            >
                                <MessageCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                                WhatsApp ile Gönder
                            </button>
                            <button
                                className="btn btn-secondary w-full flex justify-start items-center gap-md"
                                onClick={() => { handleEmail(); setShowExportModal(false); }}
                            >
                                <Mail size={18} style={{ color: 'var(--accent-purple)' }} />
                                E-Posta ile Gönder
                            </button>
                            <button
                                className="btn btn-secondary w-full flex justify-start items-center gap-md"
                                onClick={() => { handleCopy(); setShowExportModal(false); }}
                            >
                                <Copy size={18} style={{ color: 'var(--text-secondary)' }} />
                                Metin Olarak Kopyala
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
