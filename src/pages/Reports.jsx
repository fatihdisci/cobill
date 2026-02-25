import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpendingByCategory, MemberBalanceChart } from '../components/BalanceChart';
import { formatCurrency } from '../utils/currencyUtils';
import { CATEGORIES, formatDate } from '../utils/helpers';
import { FileText, Download, Mail, Copy, Lock, MessageCircle, X, CheckCircle2, ArrowRight, Star, TrendingUp, PieChart, Users, Receipt, Bell, Zap } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { generateGroupPDF } from '../utils/pdfGenerator';
import { sharePDF } from '../utils/fileService';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';

export default function Reports() {
    const { state } = useApp();
    const [selectedGroup, setSelectedGroup] = useState(state.groups[0]?.id || '');
    const [showProModal, setShowProModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;
    const group = state.groups.find(g => g.id === selectedGroup);

    if (!isPro) {
        return (
            <>
                <NonProReportsView
                    groups={state.groups}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    setShowProModal={setShowProModal}
                />
                {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
            </>
        );
    }

    // PRO CONTENT BELOW (Untouched structure)
    const expenses = state.expenses.filter(e => e.groupId === selectedGroup);
    const groupSettlements = state.settlements.filter(s => s.groupId === selectedGroup && s.status === 'paid');
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    return (
        <div className="animate-fade-in relative">
            <div className="page-header">
                <div>
                    <h2>Raporlar <span className="badge badge-pro-gold" style={{ marginLeft: 8, verticalAlign: 'middle' }}>PRO</span></h2>
                    <p className="page-subtitle">Harcama analizi ve dışa aktarma</p>
                </div>
                <div className="flex gap-sm">
                    <button
                        className="btn btn-pro-active"
                        onClick={() => setShowExportModal(true)}
                        disabled={!group}
                    >
                        <Download size={14} /> Dışarı Aktar
                    </button>
                </div>
            </div>

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

            {group ? (
                <div className="flex flex-col gap-xl">
                    <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="stat-card">
                            <div className="stat-label">Toplam Harcama</div>
                            <div className="stat-value text-gradient">{formatCurrency(totalSpent, group.currency)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Masraf Sayısı</div>
                            <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{expenses.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Kişi Başı Ortalama</div>
                            <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                                {formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }} className="reports-grid">
                        <div className="glass-card">
                            <h4 className="mb-lg">📊 Kategori Dağılımı</h4>
                            <SpendingByCategory groupId={selectedGroup} />
                        </div>
                        <div className="glass-card">
                            <h4 className="mb-lg">👥 Kişi Başı Harcama</h4>
                            <MemberBalanceChart groupId={selectedGroup} />
                        </div>
                    </div>

                    <div className="glass-card hide-mobile">
                        <h4 className="mb-lg">Kategori Detayları</h4>
                        <table className="data-table">
                            <thead>
                                <tr><th>Kategori</th><th style={{ textAlign: 'right' }}>Tutar</th><th style={{ textAlign: 'right' }}>Yüzde</th><th>Dağılım</th></tr>
                            </thead>
                            <tbody>
                                {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                                    const c = CATEGORIES[cat] || CATEGORIES.other;
                                    const pct = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
                                    return (
                                        <tr key={cat}>
                                            <td><span className="flex items-center gap-sm"><span>{c.icon}</span>{c.label}</span></td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(amount, group.currency)}</td>
                                            <td style={{ textAlign: 'right' }}>{pct.toFixed(1)}%</td>
                                            <td><div className="progress-bar" style={{ width: 120 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="glass-card">
                        <h4 className="mb-lg">🤝 Grup Ödemeleri</h4>
                        {groupSettlements.length > 0 ? (
                            <div className="flex flex-col gap-sm">
                                {groupSettlements.map((s, i) => (
                                    <div key={s.id} className="flex items-center gap-md" style={{
                                        padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)'
                                    }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="text-sm font-medium">
                                                <strong>{state.members[s.from]?.name?.split(' ')[0]}</strong>
                                                <ArrowRight size={12} style={{ margin: '0 8px', color: 'var(--text-tertiary)' }} />
                                                <strong>{state.members[s.to]?.name?.split(' ')[0]}</strong>
                                            </div>
                                            <div className="text-xs text-muted">{formatDate(s.date || s.paidAt)}</div>
                                        </div>
                                        <div className="text-sm font-bold" style={{ color: 'var(--accent-emerald-light)' }}>{formatCurrency(s.amount, s.currency)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-xl"><p className="text-muted text-sm">Henüz kaydedilmiş ödeme bulunmuyor.</p></div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center p-2xl"><p className="text-muted">Grup seçin.</p></div>
            )}

            {showExportModal && (
                <ExportModal
                    onClose={() => setShowExportModal(false)}
                    group={group}
                    state={state}
                    expenses={expenses}
                    groupSettlements={groupSettlements}
                    setIsGenerating={setIsGenerating}
                    isGenerating={isGenerating}
                />
            )}
            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
    );
}

// --- NON-PRO VIEW COMPONENT ---
function NonProReportsView({ groups, selectedGroup, setSelectedGroup, setShowProModal }) {
    return (
        <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
            <div className="page-header">
                <div>
                    <h2 className="flex items-center gap-sm">
                        Raporlar
                        <span className="badge badge-pro-gold" style={{ fontSize: '10px' }}>PRO</span>
                    </h2>
                    <p className="page-subtitle">Finansal analizlerinizi profesyonelleştirin</p>
                </div>
            </div>

            {/* Premium Selector */}
            <div className="glass-card mb-xl" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-xl)', border: 'none', boxShadow: 'none' }}>
                <div className="flex items-center gap-md">
                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        <PieChart size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Grup Raporu</div>
                        <div
                            style={{ border: 'none', padding: 0, height: 'auto', background: 'none', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}
                        >
                            {groups.find(g => g.id === selectedGroup)?.name || 'Grup Seçilmedi'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Paywall Content */}
            <div className="flex flex-col gap-lg">
                {/* Visual Teaser Cards (Skeleton / Stylized) */}
                <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-2xl)',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: 'none',
                    padding: 'var(--space-xl)'
                }}>
                    {/* Background Skeleton Decor */}
                    <div style={{ opacity: 0.1, pointerEvents: 'none' }}>
                        <div className="flex justify-between items-end mb-xl" style={{ height: 120, gap: '8px' }}>
                            {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, background: 'white', borderRadius: '4px 4px 0 0' }} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-sm">
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 40, background: 'white', borderRadius: '8px', width: '100%' }} />
                            ))}
                        </div>
                    </div>

                    {/* Centered Pro Card */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'calc(100% - 40px)',
                        maxWidth: '340px',
                        background: 'rgba(10, 15, 28, 0.98)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '32px',
                        border: 'none',
                        padding: 'var(--space-xl)',
                        textAlign: 'center',
                        boxShadow: 'none',
                        zIndex: 10
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '16px', background: 'var(--gradient-primary)',
                            margin: '0 auto var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'none'
                        }}>
                            <Lock size={28} color="white" />
                        </div>
                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>CoBill Pro ile Keşfedin</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 'var(--space-xl)' }}>
                            Harcama grafiklerini, üye bazlı borç analizlerini ve profesyonel PDF raporlarını anında açın.
                        </p>

                        <div className="flex flex-col gap-sm">
                            <button
                                className="btn btn-primary btn-lg w-full"
                                style={{ background: 'var(--gradient-primary)', border: 'none', fontWeight: 700 }}
                                onClick={() => setShowProModal(true)}
                            >
                                Hemen Yükselt
                            </button>
                            <div className="flex items-center justify-center gap-xs mt-sm" style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <Star size={14} fill="currentColor" /> Beta Testine Katıl
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature List (Bank-Grade style) */}
                <div className="grid grid-2" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center', boxShadow: 'none', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ color: 'var(--accent-purple)', marginBottom: '8px' }}><Download size={20} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sınırsız PDF</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Profesyonel Dışa Aktar</div>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center', boxShadow: 'none', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ color: 'var(--accent-emerald)', marginBottom: '8px' }}><Bell size={20} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Hatırlatıcılar</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>WhatsApp & E-posta</div>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center', boxShadow: 'none', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }}><TrendingUp size={20} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Trend Takibi</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Gelişmiş Grafikler</div>
                    </div>
                    <div className="glass-card" style={{ padding: 'var(--space-lg)', textAlign: 'center', boxShadow: 'none', border: 'none', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ color: 'var(--accent-rose)', marginBottom: '8px' }}><Zap size={20} /></div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Reklamsız</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Kesintisiz Deneyim</div>
                    </div>
                </div>
            </div>


            <style>{`
                @media (max-width: 480px) {
                    .grid-2 { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
        </div>
    );
}

// Sub-components for better readability
function ExportModal({ onClose, group, state, expenses, groupSettlements, setIsGenerating, isGenerating }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                <div className="modal-header mb-md">
                    <h3 className="flex items-center gap-xs"><Download size={18} /> Raporu Dışarı Aktar</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="flex flex-col gap-sm">
                    <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={async () => {
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
                            onClose();
                        }
                    }} disabled={isGenerating}>
                        <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
                        {isGenerating ? 'PDF Hazırlanıyor...' : 'PDF İndir / Paylaş'}
                    </button>
                    <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => onClose()}>
                        <MessageCircle size={18} style={{ color: 'var(--accent-emerald)' }} /> WhatsApp ile Gönder
                    </button>
                    <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => onClose()}>
                        <Mail size={18} style={{ color: 'var(--accent-purple)' }} /> E-Posta ile Gönder
                    </button>
                    <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => onClose()}>
                        <Copy size={18} style={{ color: 'var(--text-secondary)' }} /> Metin Olarak Kopyala
                    </button>
                </div>
            </div>
        </div>
    );
}
