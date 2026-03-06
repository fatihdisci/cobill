import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import ProUpgradeModal from '../components/ProUpgradeModal';
import AIReportModal from '../components/AIReportModal';
import { generateAIReport } from '../services/aiService';
import { getDateRange, filterByDateRange } from '../utils/dateFilterUtils';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import NonProReportsView from '../components/reports/NonProReportsView';
import GroupReportsTab from '../components/reports/GroupReportsTab';
import PersonalReportsTab from '../components/reports/PersonalReportsTab';
import FilterModal from '../components/reports/FilterModal';

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
    const [toast, setToast] = useState(null);

    const isPro = state.members[state.currentUser]?.isPro;
    const group = state.groups.find(g => g.id === selectedGroup);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
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

    // PRO Logic: Data Filtering
    let expenses = state.expenses.filter(e => e.groupId === selectedGroup);
    let groupSettlements = state.settlements.filter(s => s.groupId === selectedGroup && s.status === 'paid');
    let personalFilteredExpenses = state.personalExpenses;

    if (dateFilter) {
        expenses = filterByDateRange(expenses, dateFilter.startDate, dateFilter.endDate);
        groupSettlements = filterByDateRange(groupSettlements, dateFilter.startDate, dateFilter.endDate);
        personalFilteredExpenses = filterByDateRange(personalFilteredExpenses, dateFilter.startDate, dateFilter.endDate);
    }

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const personalTotal = personalFilteredExpenses.reduce((s, e) => s + e.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    const personalCategoryBreakdown = {};
    personalFilteredExpenses.forEach(e => {
        personalCategoryBreakdown[e.category] = (personalCategoryBreakdown[e.category] || 0) + e.amount;
    });

    const handleGenerateAIReport = async () => {
        let reportExpenses, contextData;
        const limitKey = 'cobill_ai_limits';
        const todayStr = new Date().toISOString().split('T')[0];

        if (reportTab === 'group' && group) {
            reportExpenses = expenses;
            const memberNames = {};
            group.members.forEach(id => { memberNames[id] = state.members[id]?.name; });
            contextData = { groupName: group.name, memberCount: group.members.length, currency: group.currency, memberNames };
        } else {
            reportExpenses = personalFilteredExpenses;
            contextData = {};
        }

        const expenseSum = reportExpenses.reduce((sum, e) => sum + e.amount, 0);
        const lastExpenseId = reportExpenses.length > 0 ? reportExpenses[reportExpenses.length - 1].id : 'none';
        const signature = `${reportExpenses.length}_${expenseSum}_${lastExpenseId}`;

        let aiLimits = JSON.parse(localStorage.getItem(limitKey) || '{"date":"","group":0,"personal":0}');
        if (aiLimits.date !== todayStr) aiLimits = { date: todayStr, group: 0, personal: 0 };

        const cacheKey = `cobill_ai_cache_${reportTab}_${selectedGroup || 'personal'}`;
        const cachedData = JSON.parse(localStorage.getItem(cacheKey) || 'null');

        setShowAIReport(true);

        if (cachedData && cachedData.signature === signature && cachedData.html) {
            setAiReportHtml(cachedData.html);
            setAiReportError(null);
            showToast(t('aiReport.ready'), 'success');
            return;
        }

        if (aiLimits[reportTab] >= 3) {
            setAiReportHtml(null);
            setAiReportLoading(false);
            setAiReportError(t('aiReport.limitExceeded'));
            showToast(t('aiReport.limitReached'), 'error');
            return;
        }

        setAiReportHtml(null);
        setAiReportError(null);
        setAiReportLoading(true);

        try {
            const html = await generateAIReport(reportExpenses, reportTab, contextData);
            setAiReportHtml(html);
            aiLimits[reportTab] += 1;
            localStorage.setItem(limitKey, JSON.stringify(aiLimits));
            localStorage.setItem(cacheKey, JSON.stringify({ signature, html }));
            showToast(t('aiReport.success'), 'success');
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
            <div className="flex gap-xs mb-xl" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: 4, border: '1px solid var(--border-primary)', maxWidth: 400 }}>
                <button className={`btn btn-sm ${reportTab === 'group' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setReportTab('group')} style={{ flex: 1, borderRadius: 'var(--radius-md)', fontWeight: 600 }}>👥 {t('reports.groupReports')}</button>
                <button className={`btn btn-sm ${reportTab === 'personal' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setReportTab('personal')} style={{ flex: 1, borderRadius: 'var(--radius-md)', fontWeight: 600 }}>👤 {t('reports.personalReports')}</button>
            </div>

            <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-start' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowFilterModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', minHeight: '36px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}>
                    <SlidersHorizontal size={14} /> <span>{t('reports.filter')}</span>
                    {(dateFilter.startDate || dateFilter.endDate) && <span style={{ background: 'var(--gradient-primary)', color: 'white', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }}>1</span>}
                </button>
            </div>

            {reportTab === 'group' ? (
                <>
                    <div className="form-group mb-xl" style={{ maxWidth: 300 }}>
                        <label className="form-label">{t('reports.selectGroup')}</label>
                        <select className="form-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                            {state.groups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                        </select>
                    </div>
                    <GroupReportsTab
                        selectedGroup={selectedGroup} groups={state.groups} group={group}
                        expenses={expenses} totalSpent={totalSpent} groupSettlements={groupSettlements}
                        categoryBreakdown={categoryBreakdown} dateFilter={dateFilter} t={t} state={state}
                    />
                </>
            ) : (
                <PersonalReportsTab
                    personalTotal={personalTotal}
                    personalExpensesCount={personalFilteredExpenses.length}
                    personalCategoryBreakdown={personalCategoryBreakdown}
                    t={t}
                />
            )}

            <AIReportModal isOpen={showAIReport} onClose={() => setShowAIReport(false)} reportHtml={aiReportHtml} isLoading={aiReportLoading} error={aiReportError} />
            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}

            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                t={t}
            />

            {createPortal(
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            style={{
                                position: 'fixed', bottom: 'calc(var(--space-2xl) + 60px)', left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
                                background: toast.type === 'error' ? 'var(--accent-red)' : 'var(--bg-glass)', border: `1px solid ${toast.type === 'error' ? 'rgba(255,0,0,0.3)' : 'var(--border-primary)'}`,
                                color: toast.type === 'error' ? 'white' : 'var(--text-primary)', WebkitBackdropFilter: 'blur(20px)', backdropFilter: 'blur(20px)', padding: '12px 24px', borderRadius: 'var(--radius-full)',
                                display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap'
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

