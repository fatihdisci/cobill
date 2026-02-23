import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, PlusCircle, ArrowLeftRight,
    BarChart3, Settings, Receipt, Bell, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({ children }) {
    const location = useLocation();
    const { state } = useApp();

    const pendingCount = state.settlements.filter(s => s.status !== 'paid').length;

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/groups', icon: Users, label: 'Gruplar' },
        { to: '/add-expense', icon: PlusCircle, label: 'Masraf Ekle' },
        { to: '/settlements', icon: ArrowLeftRight, label: 'Ödemeler', badge: pendingCount || null },
        { to: '/reports', icon: BarChart3, label: 'Raporlar' },
        { to: '/settings', icon: Settings, label: 'Ayarlar' },
    ];

    const mobileNavItems = [
        { to: '/', icon: LayoutDashboard, label: 'Ana Sayfa' },
        { to: '/groups', icon: Users, label: 'Gruplar' },
        { to: '/settlements', icon: ArrowLeftRight, label: 'Ödemeler' },
        { to: '/reports', icon: BarChart3, label: 'Raporlar' },
        { to: '/settings', icon: Settings, label: 'Ayarlar' },
    ];

    return (
        <div className="app-layout">
            {/* Desktop Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">₺</div>
                        <h1>CoBill</h1>
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
                    <div className="nav-item" style={{ opacity: 0.6, justifyContent: 'flex-start' }}>
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
            <main className="main-content">
                {/* DÜZELTME: Mobile Header buraya, main-content içine taşındı! 
                  Böylece Flexbox onu sayfanın soluna itip boşluk yaratmayacak.
                */}
                <header className="mobile-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>₺</div>
                        <h1 style={{ fontSize: 'var(--font-lg)' }}>CoBill</h1>
                    </div>
                    <button className="btn btn-ghost btn-icon">
                        <Bell size={20} />
                    </button>
                </header>

                <div className="page-content">
                    {children}
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
