import { useState } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Users, PlusCircle, ArrowLeftRight,
    BarChart3, Settings, Receipt, Bell, LogOut, CircleUser
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import appIconImg from '../../assets/icon.png';
import NotificationMenu from './NotificationMenu';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);

    const isPro = state.members[state.currentUser]?.isPro;

    const pendingCount = state.settlements.filter(s => s.status !== 'paid').length;

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/groups', icon: Users, label: 'Gruplar' },
        { to: '/add-expense', icon: PlusCircle, label: 'Masraf Ekle' },
        { to: '/settlements', icon: ArrowLeftRight, label: 'Ödemeler', badge: pendingCount || null },
        { to: '/reports', icon: BarChart3, label: 'Raporlar' },
        { to: '/profile', icon: CircleUser, label: 'Profil' },
    ];

    const mobileNavItems = [
        { to: '/', icon: LayoutDashboard, label: 'Ana Sayfa' },
        { to: '/groups', icon: Users, label: 'Gruplar' },
        { to: '/settlements', icon: ArrowLeftRight, label: 'Ödemeler' },
        { to: '/reports', icon: BarChart3, label: 'Raporlar' },
        { to: '/profile', icon: CircleUser, label: 'Profil' },
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
                    <span className="sidebar-section-label">Ana Menü</span>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            end={item.to === '/'}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </NavLink>
                    ))}

                    <span className="sidebar-section-label" style={{ marginTop: 'var(--space-lg)' }}>Gruplar</span>
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
                    <div className="nav-item" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', justifyContent: 'flex-start' }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                            {state.members[state.currentUser]?.name?.[0] || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="text-sm font-semibold truncate">
                                {state.members[state.currentUser]?.name || 'Kullanıcı'}
                            </div>
                            <div className="text-xs text-muted">Pro Plan</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content" style={{ paddingBottom: !isPro ? '60px' : '0' }}>
                {/* DÜZELTME: Mobile Header buraya, main-content içine taşındı! 
                  Böylece Flexbox onu sayfanın soluna itip boşluk yaratmayacak.
                */}
                <header className="mobile-header" style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center', zIndex: 101 }}>
                    <div className="sidebar-logo">
                        <img src={appIconImg} alt="CoBill" style={{ width: 56, height: 56, borderRadius: '12px', objectFit: 'contain', background: 'white' }} />
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

            {/* Mobile FAB */}
            {location.pathname !== '/add-expense' && (
                <NavLink to="/add-expense" className="mobile-fab">
                    <PlusCircle size={26} />
                </NavLink>
            )}

            {/* Mobile Bottom Tab Bar */}
            <div className="mobile-tab-bar">
                <nav>
                    {mobileNavItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
                            end={item.to === '/'}
                        >
                            <item.icon size={22} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}
