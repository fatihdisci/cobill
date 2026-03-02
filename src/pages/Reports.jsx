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
    const [reportTab, setReportTab] = useState('group'); // 'group' | 'personal'

    const isPro = state.members[state.currentUser]?.isPro;
    const group = state.groups.find(g => g.id === selectedGroup);

    const PERSONAL_CATS = {
        Market: { icon: '🛒', color: '#10b981' },
        Fatura: { icon: '📋', color: '#06b6d4' },
        'Eğitim': { icon: '📚', color: '#3b82f6' },
        'Eğlence': { icon: '🎬', color: '#8b5cf6' },
        'Ulaşım': { icon: '🚕', color: '#f59e0b' },
        'Diğer': { icon: '📦', color: '#6b7280' },
    };

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

    // Personal expenses breakdown
    const personalTotal = state.personalExpenses.reduce((s, e) => s + e.amount, 0);
    const personalCategoryBreakdown = {};
    state.personalExpenses.forEach(e => {
        personalCategoryBreakdown[e.category] = (personalCategoryBreakdown[e.category] || 0) + e.amount;
    });

    return (
        <div className="animate-fade-in relative">
            <div className="page-header">
                <div>
                    <h2>Raporlar <span className="badge badge-pro-gold" style={{ marginLeft: 8, verticalAlign: 'middle' }}>PRO</span></h2>
                    <p className="page-subtitle">Harcama analizi ve dışa aktarma</p>
                </div>
                {reportTab === 'group' && (
                    <div className="flex gap-sm">
                        <button
                            className="btn btn-pro-active"
                            onClick={() => setShowExportModal(true)}
                            disabled={!group}
                        >
                            <Download size={14} /> Dışarı Aktar
                        </button>
                    </div>
                )}
            </div>

            {/* Segmented Control */}
            <div className="flex gap-xs mb-xl" style={{
                background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)',
                padding: 4, border: '1px solid var(--border-primary)', maxWidth: 400,
            }}>
                <button
                    className={`btn btn-sm ${reportTab === 'group' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setReportTab('group')}
                    style={{ flex: 1, borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                    👥 Grup Raporları
                </button>
                <button
                    className={`btn btn-sm ${reportTab === 'personal' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setReportTab('personal')}
                    style={{ flex: 1, borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                    👤 Bireysel Raporlar
                </button>
            </div>

            {reportTab === 'group' ? (
                <>
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
                </>
            ) : (
                /* ═══ PERSONAL REPORTS TAB ═══ */
                <div className="flex flex-col gap-xl">
                    <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="stat-card">
                            <div className="stat-label">Toplam Bireysel Harcama</div>
                            <div className="stat-value text-gradient">{formatCurrency(personalTotal, 'TRY')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Harcama Sayısı</div>
                            <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{state.personalExpenses.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Kategori Sayısı</div>
                            <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>{Object.keys(personalCategoryBreakdown).length}</div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h4 className="mb-lg">📊 Kategori Dağılımı</h4>
                        {Object.keys(personalCategoryBreakdown).length > 0 ? (
                            <div className="flex flex-col gap-md">
                                {Object.entries(personalCategoryBreakdown)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([cat, amount]) => {
                                        const catInfo = PERSONAL_CATS[cat] || PERSONAL_CATS['Diğer'];
                                        const pct = personalTotal > 0 ? (amount / personalTotal * 100) : 0;
                                        return (
                                            <div key={cat} className="flex items-center gap-md">
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '12px',
                                                    background: `${catInfo.color}18`, color: catInfo.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.1rem', flexShrink: 0,
                                                }}>
                                                    {catInfo.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="flex justify-between mb-xs">
                                                        <span className="text-sm font-semibold">{cat}</span>
                                                        <span className="text-sm font-bold">{pct.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="progress-bar" style={{ height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-glass)' }}>
                                                        <div className="progress-fill" style={{
                                                            width: `${pct}%`, background: catInfo.color,
                                                            borderRadius: 'var(--radius-full)',
                                                            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                        }} />
                                                    </div>
                                                    <div className="text-xs text-muted mt-xs">{formatCurrency(amount, 'TRY')}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center p-xl"><p className="text-muted text-sm">Henüz bireysel harcama bulunmuyor.</p></div>
                        )}
                    </div>
                </div>
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

function NonProReportsView({ groups, selectedGroup, setSelectedGroup, setShowProModal }) {
    const features = [
        { icon: <PieChart size={18} />, color: 'var(--accent-purple)', title: 'Kategori Analizi', desc: 'Harcamaları kategorilere göre görselleştir' },
        { icon: <Users size={18} />, color: 'var(--accent-cyan)', title: 'Kişi Bazlı Rapor', desc: 'Kim ne kadar harcadı, grafiklerle incele' },
        { icon: <Download size={18} />, color: 'var(--accent-emerald)', title: 'PDF Dışa Aktarma', desc: 'Tüm grup işlemlerini PDF formatında dışarı aktar' },
        { icon: <Bell size={18} />, color: 'var(--accent-amber)', title: 'Hızlı Paylaşım', desc: 'Tahsilat raporlarını WhatsApp veya e-posta ile paylaş' },
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
            <div className="page-header">
                <div>
                    <h2>Raporlar</h2>
                    <p className="page-subtitle">Detaylı harcama analizi ve dışa aktarma</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="glass-card" style={{
                position: 'relative', overflow: 'hidden', textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-xl)', marginBottom: 'var(--space-xl)'
            }}>
                {/* Gradient glow blobs */}
                <div style={{ position: 'absolute', top: -60, left: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                <div style={{
                    width: 56, height: 56, borderRadius: '16px', background: 'var(--gradient-primary)',
                    margin: '0 auto var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FileText size={26} color="white" />
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                    Pro Raporlarını Keşfet
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto var(--space-xl)' }}>
                    Harcamalarını analiz et, gruplarını yönet ve profesyonel raporlar oluştur.
                </p>

                <button
                    className="btn btn-primary"
                    style={{
                        background: 'var(--gradient-primary)', border: 'none', fontWeight: 700,
                        padding: '12px 32px', fontSize: '0.95rem', borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => setShowProModal(true)}
                >
                    <Star size={16} fill="currentColor" style={{ marginRight: 6 }} /> Pro'ya Yükselt
                </button>
            </div>

            {/* Feature List */}
            <div className="flex flex-col gap-md">
                {features.map((f, i) => (
                    <div key={i} className="glass-card flex items-center gap-lg animate-fade-in-up" style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        animationDelay: `${i * 80}ms`,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: `${f.color}15`, color: f.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {f.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{f.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{f.desc}</div>
                        </div>
                        <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.4 }} />
                    </div>
                ))}
            </div>
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
