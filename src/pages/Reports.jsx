import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpendingByCategory, MemberBalanceChart } from '../components/BalanceChart';
import { formatCurrency } from '../utils/currencyUtils';
import { CATEGORIES, formatDate } from '../utils/helpers';
import { FileText, Lock, X, CheckCircle2, ArrowRight, Star, PieChart, Users, Download, Sparkles } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import AIReportModal from '../components/AIReportModal';
import { generateAIReport } from '../services/aiService';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import DateFilterBar from '../components/DateFilterBar';
import { filterByDateRange, getDateRange } from '../utils/dateFilterUtils';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports() {
    const { state } = useApp();
    const { t } = useTranslation();
    const [selectedGroup, setSelectedGroup] = useState(state.groups[0]?.id || '');
    const [showProModal, setShowProModal] = useState(false);
    const [reportTab, setReportTab] = useState('group'); // 'group' | 'personal'

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [dateFilter, setDateFilter] = useState(getDateRange('all'));

    // AI Report state
    const [showAIReport, setShowAIReport] = useState(false);
    const [aiReportHtml, setAiReportHtml] = useState(null);
    const [aiReportLoading, setAiReportLoading] = useState(false);
    const [aiReportError, setAiReportError] = useState(null);

    const isPro = state.members[state.currentUser]?.isPro;
    const group = state.groups.find(g => g.id === selectedGroup);

    const PERSONAL_CATS = {
        Market: { icon: '🛒', color: '#10b981', key: 'market' },
        Fatura: { icon: '📋', color: '#06b6d4', key: 'bill' },
        'Eğitim': { icon: '📚', color: '#3b82f6', key: 'education' },
        'Eğlence': { icon: '🎬', color: '#8b5cf6', key: 'entertainment' },
        'Ulaşım': { icon: '🚕', color: '#f59e0b', key: 'transport' },
        'Diğer': { icon: '📦', color: '#6b7280', key: 'other' },
    };

    if (!isPro) {
        return (
            <>
                <NonProReportsView
                    groups={state.groups}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    setShowProModal={setShowProModal}
                    t={t}
                />
                {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
            </>
        );
    }

    // PRO CONTENT BELOW
    let expenses = state.expenses.filter(e => e.groupId === selectedGroup);
    let groupSettlements = state.settlements.filter(s => s.groupId === selectedGroup && s.status === 'paid');

    if (dateFilter) {
        expenses = filterByDateRange(expenses, dateFilter.startDate, dateFilter.endDate);
        groupSettlements = filterByDateRange(groupSettlements, dateFilter.startDate, dateFilter.endDate);
    }

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    // Personal expenses breakdown
    let personalFilteredExpenses = state.personalExpenses;
    if (dateFilter) {
        personalFilteredExpenses = filterByDateRange(personalFilteredExpenses, dateFilter.startDate, dateFilter.endDate);
    }

    const personalTotal = personalFilteredExpenses.reduce((s, e) => s + e.amount, 0);
    const personalCategoryBreakdown = {};
    personalFilteredExpenses.forEach(e => {
        personalCategoryBreakdown[e.category] = (personalCategoryBreakdown[e.category] || 0) + e.amount;
    });

    // Toast / Feedback state
    const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // AI Rapor Üret
    const handleGenerateAIReport = async () => {
        let reportExpenses, contextData;
        const limitKey = 'cobill_ai_limits';
        const todayStr = new Date().toISOString().split('T')[0];

        if (reportTab === 'group' && group) {
            reportExpenses = expenses;
            const memberNames = {};
            group.members.forEach(id => {
                const m = state.members[id];
                if (m) memberNames[id] = m.name;
            });
            contextData = {
                groupName: group.name,
                memberCount: group.members.length,
                currency: group.currency,
                memberNames,
            };
        } else {
            reportExpenses = personalFilteredExpenses;
            contextData = {};
        }

        // Adım 1: Daha "Zor" Bir Veri İmzası (Signature) Oluşturma
        const expenseSum = reportExpenses.reduce((sum, e) => sum + e.amount, 0);
        const lastExpenseId = reportExpenses.length > 0 ? reportExpenses[reportExpenses.length - 1].id : 'none';
        const signature = `${reportExpenses.length}_${expenseSum}_${lastExpenseId}`;

        // Adım 2: Günlük Limit Mantığı
        let aiLimits = JSON.parse(localStorage.getItem(limitKey) || '{"date":"","group":0,"personal":0}');
        if (aiLimits.date !== todayStr) {
            aiLimits = { date: todayStr, group: 0, personal: 0 };
        }

        // Adım 3: Akıllı Önbellek (Cache) ve Karar Mekanizması
        const cacheKey = `cobill_ai_cache_${reportTab}_${selectedGroup || 'personal'}`;
        const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');

        setShowAIReport(true);

        // Adım B (İmzalar Aynıysa - API'YE GİTME)
        if (cachedData && cachedData.signature === signature && cachedData.html) {
            setAiReportHtml(cachedData.html);
            setAiReportError(null);

            const invisibleToasts = [
                "Finansal verileriniz kontrol edildi, analiziniz hazır.",
                "Bütçe asistanınız güncel durumu başarıyla inceledi.",
                "Analizleriniz en son verilerinize göre optimize edildi."
            ];
            const randomMsg = invisibleToasts[Math.floor(Math.random() * invisibleToasts.length)];
            showToast(randomMsg, 'success');
            return; // Cache kullanıldı, fonksiyondan çık
        }

        // Adım C (İmzalar Farklıysa - YENİ RAPOR)
        if (aiLimits[reportTab] >= 3) {
            setAiReportHtml(null);
            setAiReportLoading(false);
            setAiReportError(`Günlük yapay zeka analiz limitinize (3/3) ulaştınız. Lütfen yarın tekrar deneyin.`);
            showToast(`Günlük limit (3/3) doldu.`, 'error');
            return;
        }

        // API'den yeni rapor çek
        setAiReportHtml(null);
        setAiReportError(null);
        setAiReportLoading(true);

        try {
            const html = await generateAIReport(reportExpenses, reportTab, contextData);
            setAiReportHtml(html);

            // Limiti artır ve kaydet
            aiLimits[reportTab] += 1;
            localStorage.setItem(limitKey, JSON.stringify(aiLimits));

            // Yeni signature ve html'i önbelleğe al
            localStorage.setItem(cacheKey, JSON.stringify({
                signature: signature,
                html: html
            }));

            showToast('Yapay zeka analiziniz başarıyla oluşturuldu.', 'success');
        } catch (err) {
            setAiReportError(err.message || t('aiReport.error'));
        } finally {
            setAiReportLoading(false);
        }
    };

    return (
        <div className="animate-fade-in relative">
            <div className="page-header">
                <div>
                    <h2>{t('reports.pageTitle')} <span className="badge badge-pro-gold" style={{ marginLeft: 8, verticalAlign: 'middle' }}>PRO</span></h2>
                    <p className="page-subtitle">{t('reports.pageSubtitle')}</p>
                </div>
                <div className="flex gap-sm">
                    <button
                        className="btn ai-report-generate-btn"
                        onClick={handleGenerateAIReport}
                        disabled={reportTab === 'group' && !group}
                    >
                        <Sparkles size={14} /> {t('aiReport.generateButton')}
                    </button>
                </div>
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
                    👥 {t('reports.groupReports')}
                </button>
                <button
                    className={`btn btn-sm ${reportTab === 'personal' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setReportTab('personal')}
                    style={{ flex: 1, borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                    👤 {t('reports.personalReports')}
                </button>
            </div>

            <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowFilterModal(true)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', minHeight: '36px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    <span>{t('reports.filter')}</span>
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <span style={{
                            background: 'var(--gradient-primary)', color: 'white',
                            fontSize: '10px', fontWeight: 800, width: '18px', height: '18px',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginLeft: '2px',
                        }}>
                            1
                        </span>
                    )}
                </button>
            </div>

            {reportTab === 'group' ? (
                <>
                    <div className="form-group mb-xl" style={{ maxWidth: 300 }}>
                        <label className="form-label">{t('reports.selectGroup')}</label>
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
                                    <div className="stat-label">{t('reports.totalExpense')}</div>
                                    <div className="stat-value text-gradient">{formatCurrency(totalSpent, group.currency)}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">{t('reports.expenseCount')}</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{expenses.length}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">{t('reports.averagePerPerson')}</div>
                                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                                        {formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }} className="reports-grid">
                                <div className="glass-card">
                                    <h4 className="mb-lg">📊 {t('reports.categoryDistribution')}</h4>
                                    <SpendingByCategory groupId={selectedGroup} dateFilter={dateFilter} />
                                </div>
                                <div className="glass-card">
                                    <h4 className="mb-lg">👥 {t('reports.perPersonExpenseTitle')}</h4>
                                    <MemberBalanceChart groupId={selectedGroup} dateFilter={dateFilter} />
                                </div>
                            </div>

                            <div className="glass-card hide-mobile">
                                <h4 className="mb-lg">{t('reports.categoryDetails')}</h4>
                                <table className="data-table">
                                    <thead>
                                        <tr><th>{t('common.category')}</th><th style={{ textAlign: 'right' }}>{t('common.amount')}</th><th style={{ textAlign: 'right' }}>{t('reports.percentage')}</th><th>{t('reports.distribution')}</th></tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                                            const c = CATEGORIES[cat] || CATEGORIES.other;
                                            const pct = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
                                            return (
                                                <tr key={cat}>
                                                    <td><span className="flex items-center gap-sm"><span>{c.icon}</span>{t(`wallet.categories.${cat === 'shopping' ? 'market' : cat === 'bills' ? 'bill' : cat}`, { defaultValue: c.label })}</span></td>
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
                                <h4 className="mb-lg">🤝 {t('reports.groupPayments')}</h4>
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
                                    <div className="text-center p-xl"><p className="text-muted text-sm">{t('reports.noPayments')}</p></div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-2xl"><p className="text-muted">{t('reports.pleaseSelectGroup')}</p></div>
                    )}
                </>
            ) : (
                /* ═══ PERSONAL REPORTS TAB ═══ */
                <div className="flex flex-col gap-xl">
                    <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="stat-card">
                            <div className="stat-label">{t('reports.totalPersonalExpense')}</div>
                            <div className="stat-value text-gradient">{formatCurrency(personalTotal, 'TRY')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('reports.expenseCount')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>{state.personalExpenses.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('reports.categoryCount')}</div>
                            <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>{Object.keys(personalCategoryBreakdown).length}</div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h4 className="mb-lg">📊 {t('reports.categoryDistribution')}</h4>
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
                                                        <span className="text-sm font-semibold">{t(`wallet.categories.${catInfo.key}`, { defaultValue: cat })}</span>
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
                            <div className="text-center p-xl"><p className="text-muted text-sm">{t('reports.noPersonalExpenses')}</p></div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Report Modal */}
            <AIReportModal
                isOpen={showAIReport}
                onClose={() => setShowAIReport(false)}
                reportHtml={aiReportHtml}
                isLoading={aiReportLoading}
                error={aiReportError}
            />

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}

            {/* Filter Modal */}
            {createPortal(
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    pointerEvents: showFilterModal ? 'auto' : 'none',
                    visibility: showFilterModal ? 'visible' : 'hidden',
                    opacity: showFilterModal ? 1 : 0,
                    transition: 'opacity 200ms ease, visibility 200ms ease',
                }}>
                    <div onClick={() => setShowFilterModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                        padding: 'var(--space-xl)', maxHeight: '75vh', overflowY: 'auto',
                        transform: showFilterModal ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 300ms ease',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SlidersHorizontal size={18} /> {t('reports.filter')}
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter(getDateRange('all'))} style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '30px' }}>
                                    <RotateCcw size={12} /> {t('reports.reset')}
                                </button>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowFilterModal(false)} style={{ width: '30px', height: '30px', minHeight: '30px', padding: 0 }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div style={{ width: 40, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--border-secondary)', margin: '-12px auto var(--space-lg)' }} />

                        <div style={{ marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('reports.dateSelection')}
                            </div>
                            <DateFilterBar onChange={setDateFilter} defaultPreset="all" />
                        </div>

                        <button className="btn btn-primary w-full" onClick={() => setShowFilterModal(false)} style={{ padding: '12px', fontSize: '1rem', fontWeight: 700, borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-md)' }}>
                            {t('reports.showResults')}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Toast Notification */}
            {createPortal(
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                position: 'fixed',
                                bottom: 'calc(var(--space-2xl) + 60px)', // Above bottom bar
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 99999,
                                background: toast.type === 'error' ? 'var(--accent-red)' : 'var(--bg-glass)',
                                border: `1px solid ${toast.type === 'error' ? 'rgba(255,0,0,0.3)' : 'var(--border-primary)'}`,
                                color: toast.type === 'error' ? 'white' : 'var(--text-primary)',
                                WebkitBackdropFilter: 'blur(20px)',
                                backdropFilter: 'blur(20px)',
                                padding: '12px 24px',
                                borderRadius: 'var(--radius-full)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {toast.type === 'success' ? '✨' : '⚠️'} {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

function NonProReportsView({ groups, selectedGroup, setSelectedGroup, setShowProModal, t }) {
    const features = [
        { icon: <PieChart size={18} />, color: 'var(--accent-purple)', title: t('reports.features.categoryAnalysis.title'), desc: t('reports.features.categoryAnalysis.desc') },
        { icon: <Users size={18} />, color: 'var(--accent-cyan)', title: t('reports.features.personBased.title'), desc: t('reports.features.personBased.desc') },
        { icon: <Sparkles size={18} />, color: 'var(--accent-amber)', title: t('reports.features.aiAnalysis.title'), desc: t('reports.features.aiAnalysis.desc') },
        { icon: <Download size={18} />, color: 'var(--accent-emerald)', title: t('reports.features.pdfExport.title'), desc: t('reports.features.pdfExport.desc') },
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
            <div className="page-header">
                <div>
                    <h2>{t('reports.pageTitle')}</h2>
                    <p className="page-subtitle">{t('reports.nonProSubtitle')}</p>
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
                    {t('reports.discoverPro')}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto var(--space-xl)' }}>
                    {t('reports.discoverProDesc')}
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
                    <Star size={16} fill="currentColor" style={{ marginRight: 6 }} /> {t('reports.upgradeToPro')}
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
