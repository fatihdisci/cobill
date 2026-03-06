import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Wallet, PlusCircle,
    ArrowLeftRight, Zap, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import ActivityFeed from '../components/ActivityFeed';
import { SpendingByCategory } from '../components/BalanceChart';
import { getTotalUserDebt, calculateBalances } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { showInterstitialAd } from '../utils/adService';
import { useTranslation } from 'react-i18next';

// Sub-components
import StatsGrid from '../components/dashboard/StatsGrid';
import InvitationsSection from '../components/dashboard/InvitationsSection';
import NewGroupModal from '../components/dashboard/NewGroupModal';

export default function Dashboard() {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [showProModal, setShowProModal] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;

    // Calculate global stats
    let totalOwedToYou = 0;
    let totalYouOwe = getTotalUserDebt(state);
    let totalExpenses = 0;
    let pendingSettlements = 0;

    state.groups.forEach(group => {
        const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
        const groupExpenses = state.expenses.filter(e => e.groupId === group.id);
        const balances = calculateBalances(groupExpenses, groupMembers);
        const myBalance = balances[state.currentUser] || 0;
        if (myBalance > 0) totalOwedToYou += myBalance;
        totalExpenses += groupExpenses.reduce((s, e) => s + e.amount, 0);
    });

    pendingSettlements = state.settlements.filter(s => s.status !== 'paid').length;

    const stats = [
        {
            icon: <TrendingUp size={22} />,
            iconBg: 'rgba(16, 185, 129, 0.15)',
            iconColor: 'var(--accent-emerald)',
            value: formatCurrency(totalOwedToYou, 'TRY'),
            label: t('dashboard.owedToYou'),
            gradient: 'var(--gradient-success)',
        },
        {
            icon: <TrendingDown size={22} />,
            iconBg: 'rgba(244, 63, 94, 0.15)',
            iconColor: 'var(--accent-rose)',
            value: formatCurrency(totalYouOwe, 'TRY'),
            label: t('dashboard.youOwe'),
            gradient: 'var(--gradient-danger)',
        },
        {
            icon: <Wallet size={22} />,
            iconBg: 'rgba(139, 92, 246, 0.15)',
            iconColor: 'var(--accent-purple)',
            value: formatCurrency(totalExpenses, 'TRY'),
            label: t('dashboard.totalExpense'),
            gradient: 'var(--gradient-primary)',
        },
        {
            icon: <ArrowLeftRight size={22} />,
            iconBg: 'rgba(245, 158, 11, 0.15)',
            iconColor: 'var(--accent-amber)',
            value: pendingSettlements.toString(),
            label: t('dashboard.pendingSettlement'),
            gradient: 'var(--gradient-danger)',
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>
                        {t('dashboard.greeting')} <span className="text-gradient">
                            {state.members[state.currentUser]?.name?.split(' ')[0] || t('common.user')}
                        </span> 👋
                    </h2>
                    <p className="page-subtitle">{t('dashboard.summary')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
                    <PlusCircle size={16} /> {t('dashboard.addExpense')}
                </button>
            </div>

            {/* Invitations Section */}
            <InvitationsSection invitations={state.invitations} dispatch={dispatch} t={t} />

            {/* Stat Cards */}
            <StatsGrid stats={stats} />

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)', minWidth: 0 }} className="dashboard-grid">

                {/* Left: Groups */}
                <div style={{ minWidth: 0 }}>
                    <div className="flex items-center justify-between mb-lg">
                        <h3>{t('dashboard.yourGroups')}</h3>
                        <span className="badge badge-purple">{state.groups.length}</span>
                    </div>

                    {state.groups.length === 0 ? (
                        <div className="glass-card animate-fade-in-up flex flex-col items-center text-center" style={{ padding: 'var(--space-2xl) var(--space-xl)' }}>
                            <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)', opacity: 0.5 }} />
                            <h4 style={{ marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>{t('dashboard.noGroupsYet')}</h4>
                            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-lg)', maxWidth: 260 }}>
                                {t('dashboard.createFirstGroup')}
                            </p>
                            <button className="btn btn-primary flex items-center gap-sm" onClick={() => setShowNewGroup(true)}>
                                <PlusCircle size={16} /> {t('dashboard.createNewGroup')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-2 mobile-scroller" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', paddingBottom: 'var(--space-lg)' }}>
                            {state.groups.map((group, i) => (
                                <GroupCard key={group.id} group={group} index={i} />
                            ))}

                            <div
                                className="glass-card animate-fade-in-up flex items-center justify-center flex-col"
                                style={{ cursor: 'pointer', minHeight: 180, border: '2px dashed var(--border-secondary)', background: 'transparent' }}
                                onClick={() => setShowNewGroup(true)}
                            >
                                <PlusCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p className="text-sm text-muted">{t('dashboard.createNewGroup')}</p>
                            </div>
                        </div>
                    )}

                    {!isPro && (
                        <div className="glass-card animate-fade-in-up flex flex-col justify-center items-center text-center relative overflow-hidden mt-lg" style={{ padding: 'var(--space-lg)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 90, height: 90, borderRadius: '50%', background: 'var(--gradient-primary)', filter: 'blur(35px)', opacity: 0.5 }}></div>
                            <Zap size={24} style={{ color: 'var(--accent-purple)', marginBottom: 'var(--space-xs)' }} />
                            <h4 style={{ marginBottom: 4, fontSize: '0.9rem' }}>{t('dashboard.adFreeExperience')}</h4>
                            <p className="text-xs text-muted mb-md">{t('dashboard.adFreeDesc')}</p>
                            <button className="btn btn-pro-active" style={{ fontSize: '0.8rem', padding: '6px 12px', minHeight: '36px' }} onClick={() => setShowProModal(true)}>
                                {t('dashboard.checkNow')}
                            </button>
                            <span style={{ position: 'absolute', top: 6, right: 10, fontSize: '9px', background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-tertiary)', letterSpacing: 0.5 }}>AD</span>
                        </div>
                    )}
                </div>

                {/* Right: Activity + Chart */}
                <div className="flex flex-col gap-xl sidebar-panel" style={{ minWidth: 0 }}>
                    <div className="glass-card" style={{ minWidth: 0 }}>
                        <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>{t('dashboard.recentActivities')}</h4>
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <ActivityFeed limit={8} />
                        </div>
                    </div>

                    {totalExpenses > 0 && (
                        <div className="glass-card" style={{ minWidth: 0 }}>
                            <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>{t('dashboard.spendingDistribution')}</h4>
                            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px', position: 'relative' }}>
                                {!isPro && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 10,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: 'rgba(26, 32, 53, 0.3)', borderRadius: 12
                                    }}>
                                        <button className="btn btn-primary" style={{ background: 'var(--gradient-primary)', border: 'none', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }} onClick={() => setShowProModal(true)}>
                                            {t('dashboard.unlockWithPro')}
                                        </button>
                                    </div>
                                )}
                                <SpendingByCategory />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showNewGroup && (
                <NewGroupModal
                    onClose={() => setShowNewGroup(false)}
                    onSubmit={(group) => {
                        setShowNewGroup(false);
                        if (!isPro) {
                            showInterstitialAd().then(() => navigate(`/group/${group.id}`));
                        } else {
                            navigate(`/group/${group.id}`);
                        }
                    }}
                    t={t}
                    dispatch={dispatch}
                    currentUser={state.currentUser}
                />
            )}

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}

            <style>{`
                @media (max-width: 767px) {
                    .dashboard-grid { grid-template-columns: 1fr !important; width: 100%; }
                    .dashboard-grid > div { min-width: 0; width: 100%; }
                    .sidebar-panel { order: -1; }
                }
                @media (min-width: 768px) and (max-width: 1100px) {
                    .dashboard-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

