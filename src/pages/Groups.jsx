import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle, Users, TrendingUp, TrendingDown, Wallet,
    ArrowLeftRight, MailCheck, UserCheck, X, Zap,
    SlidersHorizontal, RotateCcw, CheckCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import ActivityFeed from '../components/ActivityFeed';
import { SpendingByCategory } from '../components/BalanceChart';
import { calculateBalances, getTotalUserDebt } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';
import DateFilterBar from '../components/DateFilterBar';
import { getDateRange, filterByDateRange } from '../utils/dateFilterUtils';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export default function Groups() {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showNew, setShowNew] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [currency, setCurrency] = useState('TRY');
    const [showProModal, setShowProModal] = useState(false);
    const [dateFilter, setDateFilter] = useState(getDateRange('all'));
    const [showFilterModal, setShowFilterModal] = useState(false);
    const isPro = state.members[state.currentUser]?.isPro;

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];
    const [color, setColor] = useState(colors[0]);

    // Calculate global stats (from Dashboard)
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

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        dispatch({
            type: 'ADD_GROUP',
            payload: {
                id,
                name: name.trim(),
                description: desc.trim(),
                currency,
                members: [state.currentUser],
                createdBy: state.currentUser,
                createdAt: new Date().toISOString(),
                color,
            },
        });
        setShowNew(false);
        setName('');
        setDesc('');
        if (!isPro) {
            showInterstitialAd().then(() => navigate(`/group/${id}`));
        } else {
            navigate(`/group/${id}`);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div className="page-header">
                <div>
                    <h2>
                        {t('dashboard.greeting')} <span className="text-gradient">
                            {state.members[state.currentUser]?.name?.split(' ')[0] || t('common.user')}
                        </span> 👋
                    </h2>
                    <p className="page-subtitle">{t('groups.subtitle')}</p>
                </div>
                <div className="flex gap-sm">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowFilterModal(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            minHeight: '36px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <SlidersHorizontal size={14} /> {t('groups.filter')}
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
                    <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                        <PlusCircle size={16} /> {t('groups.newGroup')}
                    </button>
                </div>
            </div>

            {/* Bekleyen Davetler */}
            {state.invitations && state.invitations.length > 0 && (
                <div className="glass-card mb-xl animate-fade-in-up" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'var(--bg-card)' }}>
                    <h4 className="flex items-center gap-sm mb-lg" style={{ color: 'var(--accent-amber-light)' }}>
                        <MailCheck size={18} /> {t('dashboard.pendingInvitations')}
                        <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{state.invitations.length}</span>
                    </h4>
                    <div className="flex flex-col gap-md">
                        {state.invitations.map(inv => (
                            <div key={inv.id} className="flex items-center gap-md" style={{
                                padding: 'var(--space-md) var(--space-lg)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-primary)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div className="text-sm font-semibold">
                                        <strong>{inv.invitedByName || t('common.user')}</strong> {t('dashboard.invitedBy')} <strong>"{inv.groupName}"</strong>.
                                    </div>
                                    <div className="text-xs text-muted mt-xs">
                                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('tr-TR') : ''}
                                    </div>
                                </div>
                                <div className="flex gap-sm">
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => dispatch({
                                            type: 'ACCEPT_INVITATION',
                                            payload: { invitationId: inv.id, invitation: inv }
                                        })}
                                    >
                                        <UserCheck size={14} /> {t('dashboard.accept')}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => dispatch({ type: 'REJECT_INVITATION', payload: inv.id })}
                                        style={{ color: 'var(--accent-rose)' }}
                                    >
                                        <X size={14} /> {t('dashboard.reject')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-4 mb-xl mobile-scroller">
                {stats.map((stat, i) => (
                    <div key={i} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
                        <div className="stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
                            {stat.icon}
                        </div>
                        <div className="stat-value" style={{
                            background: stat.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            {stat.value}
                        </div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

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
                            <button className="btn btn-primary flex items-center gap-sm" onClick={() => setShowNew(true)}>
                                <PlusCircle size={16} /> {t('dashboard.createNewGroup')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-2 mobile-scroller" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', paddingBottom: 'var(--space-lg)' }}>
                            {state.groups.map((group, i) => (
                                <GroupCard key={group.id} group={group} index={i} />
                            ))}

                            {/* Add Group Card */}
                            <div
                                className="glass-card animate-fade-in-up flex items-center justify-center flex-col"
                                style={{
                                    cursor: 'pointer',
                                    minHeight: 180,
                                    border: '2px dashed var(--border-secondary)',
                                    background: 'transparent',
                                }}
                                onClick={() => setShowNew(true)}
                            >
                                <PlusCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p className="text-sm text-muted">{t('dashboard.createNewGroup')}</p>
                            </div>
                        </div>
                    )}

                    {/* Inline Promo Ad */}
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
                                <SpendingByCategory dateFilter={dateFilter} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                                <SlidersHorizontal size={18} /> {t('groups.filter')}
                            </h4>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter(getDateRange('all'))} style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '30px' }}>
                                    <RotateCcw size={12} /> {t('groups.reset')}
                                </button>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowFilterModal(false)} style={{ width: '30px', height: '30px', minHeight: '30px', padding: 0 }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div style={{ width: 40, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--border-secondary)', margin: '-12px auto var(--space-lg)' }} />

                        <div style={{ marginBottom: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {t('groups.dateSelection')}
                            </div>
                            <DateFilterBar onChange={setDateFilter} defaultPreset="all" />
                        </div>

                        <button className="btn btn-primary w-full" onClick={() => setShowFilterModal(false)} style={{ padding: '12px', fontSize: '1rem', fontWeight: 700, borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-md)' }}>
                            {t('groups.showResults')}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* New Group Modal */}
            {showNew && (
                <div className="modal-overlay" onClick={() => setShowNew(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('dashboard.newGroupModalTitle')}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="flex flex-col gap-lg">
                            <div className="form-group">
                                <label className="form-label">{t('dashboard.groupName')}</label>
                                <input className="form-input" placeholder={t('dashboard.groupNamePlaceholder')} value={name}
                                    onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('dashboard.description')}</label>
                                <input className="form-input" placeholder={t('dashboard.descriptionPlaceholder')} value={desc}
                                    onChange={e => setDesc(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('dashboard.currency')}</label>
                                <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                                    <option value="TRY">₺ TRY</option>
                                    <option value="USD">$ USD</option>
                                    <option value="EUR">€ EUR</option>
                                    <option value="GBP">£ GBP</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('dashboard.color')}</label>
                                <div className="flex gap-sm">
                                    {colors.map(c => (
                                        <div key={c} onClick={() => setColor(c)} style={{
                                            width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                            background: c, cursor: 'pointer',
                                            border: color === c ? '3px solid white' : '3px solid transparent',
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full btn-lg">
                                <Users size={16} /> {t('common.save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showProModal && (
                <ProUpgradeModal onClose={() => setShowProModal(false)} />
            )}

            {/* Responsive grid override */}
            <style>{`
        @media (max-width: 767px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            width: 100%;
          }
          .dashboard-grid > div {
            min-width: 0;
            width: 100%;
          }
          .sidebar-panel {
            order: -1;
          }
        }
        @media (min-width: 768px) and (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
