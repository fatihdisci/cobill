import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, PlusCircle, ArrowLeftRight,
    BarChart3, Settings, Receipt, Bell, LogOut, CircleUser,
    Wallet, Plus, User, X, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import appIconImg from '../../assets/icon.png';
import NotificationMenu from './NotificationMenu';
import ProBenefitsMenu from './ProBenefitsMenu';
import ProUpgradeModal from './ProUpgradeModal';
import UpgradeBanner from './UpgradeBanner';
import { Star } from 'lucide-react';
import { showInterstitialAd } from '../utils/adService';
import FloatingActionMenu from './ui/FloatingActionMenu';
import RecurringPromptModal from './RecurringPromptModal';
import MagicDraftModal from './MagicDraftModal';
import { getPendingRecurringExpenses } from '../utils/recurringUtils';
import InteractiveMenu from './ui/InteractiveMenu';

export default function Layout() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProBenefits, setShowProBenefits] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

    // Recurring expenses
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [pendingRecurring, setPendingRecurring] = useState([]);
    const [showMagicDraft, setShowMagicDraft] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;

    // Track route changes and show ad on the 2nd change
    useEffect(() => {
        // Skip ad check entirely for Pro users
        if (isPro) return;

        // Retrieve the current counter from sessionStorage to handle hard reloads
        const currentCount = parseInt(sessionStorage.getItem('routeChangeCount') || '0', 10);
        const newCount = currentCount + 1;

        sessionStorage.setItem('routeChangeCount', newCount.toString());

        // Show interstitial ad every 3 page transitions (3, 6, 9...)
        if (newCount > 1 && newCount % 3 === 0) {
            showInterstitialAd();
        }
    }, [location.pathname, isPro]);

    useEffect(() => {
        const handler = () => {
            setShowUpgradeBanner(true);
            // Auto hide after 5 seconds
            setTimeout(() => setShowUpgradeBanner(false), 5000);
        };
        window.addEventListener('show-pro-banner', handler);
        return () => window.removeEventListener('show-pro-banner', handler);
    }, []);

    // Check for pending recurring expenses once per session when data is loaded
    useEffect(() => {
        if (!state.currentUser || pendingRecurring.length > 0 || sessionStorage.getItem('recurringCheckedToday')) return;

        // Make sure data is mostly loaded. Since we are inside Layout, AppContext is providing state.
        if (state.expenses.length > 0 || state.personalExpenses.length > 0) {
            const pendingGroup = getPendingRecurringExpenses(state.expenses);
            const pendingPersonal = getPendingRecurringExpenses(state.personalExpenses);
            const allPending = [...pendingGroup, ...pendingPersonal];

            if (allPending.length > 0) {
                setPendingRecurring(allPending);
                setShowRecurringModal(true);
            }
            sessionStorage.setItem('recurringCheckedToday', 'true');
        }
    }, [state.expenses, state.personalExpenses, state.currentUser, pendingRecurring.length]);

    const pendingCount = state.settlements.filter(s => s.status !== 'paid').length;

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/wallet', icon: Wallet, label: t('nav.wallet') },
        { to: '/groups', icon: Users, label: t('nav.groups') },
        { to: '/add-expense', icon: PlusCircle, label: t('nav.addExpense') },
        { to: '/settlements', icon: ArrowLeftRight, label: t('nav.settlements'), badge: pendingCount || null },
        { to: '/reports', icon: BarChart3, label: t('nav.reports') },
        { to: '/profile', icon: CircleUser, label: t('nav.profile') },
    ];

    const interactiveMenuItems = [
        { to: '/wallet', icon: Wallet, label: 'nav.wallet' },
        { to: '/groups', icon: Users, label: 'nav.groups' },
        { to: '/settlements', icon: ArrowLeftRight, label: 'nav.settlements' },
        { to: '/reports', icon: BarChart3, label: 'nav.reports' },
        { to: '/profile', icon: CircleUser, label: 'nav.profile' },
    ];

    return (
        <div className="app-layout">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header" style={{ padding: 'var(--space-md) var(--space-xl)' }}>
                    <div className="sidebar-logo" style={{ justifyContent: 'center' }}>
                        <img src={appIconImg} alt="CoBill" style={{ width: 60, height: 60, borderRadius: '12px', objectFit: 'contain', background: 'white' }} />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <span className="sidebar-section-label">{t('nav.mainMenu')}</span>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            end={item.to === '/dashboard'}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </NavLink>
                    ))}

                    <span className="sidebar-section-label" style={{ marginTop: 'var(--space-lg)' }}>{t('nav.myGroups')}</span>
                    {state.groups.map(group => (
                        <NavLink
                            key={group.id}
                            to={`/group/${group.id}`}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span style={{ fontSize: '1.1rem' }}>{group.name.split(' ')[0]}</span>
                            <span className="truncate">{group.name.replace(/^[^\s]+\s/, '')}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {!isPro && (
                        <div
                            className="nav-item animate-pulse-subtle"
                            onClick={() => setShowProModal(true)}
                            style={{
                                cursor: 'pointer',
                                background: 'var(--gradient-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-md)',
                                padding: 'var(--space-md)',
                                border: 'none'
                            }}
                        >
                            <Star size={18} fill="white" />
                            <span style={{ fontWeight: 700 }}>{t('nav.goToPro')}</span>
                        </div>
                    )}
                    <div className="nav-item" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', justifyContent: 'flex-start' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                            {state.members[state.currentUser]?.name?.[0] || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-sm font-semibold truncate">
                                {state.members[state.currentUser]?.name || t('common.user')}
                            </div>
                            <div className="text-xs text-muted">{isPro ? t('common.proPlan') : t('common.freePlan')}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content" style={{ paddingBottom: '0' }}>
                {/* DÜZELTME: Mobile Header buraya, main-content içine taşındı! 
                  Böylece Flexbox onu sayfanın soluna itip boşluk yaratmayacak.
                */}
                <header className="mobile-header">
                    {/* Left CTA: PRO */}
                    {!isPro && (
                        <div style={{ position: 'absolute', left: 'var(--space-md)' }} className="hide-desktop">
                            <div style={{ position: 'relative' }}>
                                <button
                                    className="btn-pro-gold flex items-center justify-center animate-pulse-subtle"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '50%',
                                        padding: 0,
                                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
                                        border: '2px solid rgba(251, 191, 36, 0.5)'
                                    }}
                                    onClick={() => setShowProBenefits(!showProBenefits)}
                                >
                                    <Star size={20} fill="currentColor" />
                                </button>
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px', // Moved badge to right so it doesn't clip off-screen left
                                    background: 'var(--gradient-primary)',
                                    color: 'white',
                                    fontSize: '8px',
                                    fontWeight: 900,
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    zIndex: 10
                                }}>
                                    PRO
                                </div>
                            </div>
                            {showProBenefits && (
                                <ProBenefitsMenu
                                    onClose={() => setShowProBenefits(false)}
                                    onUpgrade={() => {
                                        setShowProBenefits(false);
                                        setShowProModal(true);
                                    }}
                                    isMobile={true}
                                />
                            )}
                        </div>
                    )}

                    <div className="sidebar-logo">
                        <img src={appIconImg} alt="CoBill" style={{ width: 96, height: 96, borderRadius: '14px', objectFit: 'contain', background: 'white' }} />
                    </div>

                    <div style={{ position: 'absolute', right: 'var(--space-md)' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={22} />
                            {/* NotificationMenu handles the red dot Badge logic internally if passed right */}
                        </button>
                        {showNotifications && (
                            <NotificationMenu onClose={() => setShowNotifications(false)} isMobile={true} />
                        )}
                    </div>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>

            {/* Global FAB (Mobile) */}
            <div className="hide-desktop">
                <FloatingActionMenu
                    options={[
                        {
                            label: t('fab.magicDraft'),
                            description: t('fab.magicDraftDesc'),
                            onClick: () => setShowMagicDraft(true),
                            Icon: <Sparkles size={22} />,
                            color: 'var(--accent-amber)'
                        },
                        {
                            label: t('fab.personalExpense'),
                            description: t('fab.personalExpenseDesc'),
                            onClick: () => navigate('/add-personal'),
                            Icon: <User size={22} />,
                            color: 'var(--accent-purple)'
                        },
                        {
                            label: t('fab.groupExpense'),
                            description: t('fab.groupExpenseDesc'),
                            onClick: () => navigate('/add-expense'),
                            Icon: <Users size={22} />,
                            color: 'var(--accent-cyan)'
                        }
                    ]}
                />
            </div>

            {/* Mobile Bottom Tab Bar */}
            <div className="mobile-tab-bar">
                <InteractiveMenu
                    items={interactiveMenuItems}
                    accentColor="var(--accent-purple)"
                />
            </div>

            {/* Upgrade Banner for Pro Features */}
            {!isPro && (
                <UpgradeBanner
                    visible={showUpgradeBanner}
                    onClose={() => setShowUpgradeBanner(false)}
                    onUpgrade={() => {
                        setShowUpgradeBanner(false);
                        setShowProModal(true);
                    }}
                />
            )}

            {/* Modals */}
            {showProModal && (
                <ProUpgradeModal onClose={() => setShowProModal(false)} />
            )}
            {showMagicDraft && (
                <MagicDraftModal onClose={() => setShowMagicDraft(false)} />
            )}
        </div>
    );
}
