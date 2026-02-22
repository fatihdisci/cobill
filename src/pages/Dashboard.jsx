import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Wallet, Users, PlusCircle,
    ArrowLeftRight, Receipt, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import ActivityFeed from '../components/ActivityFeed';
import { SpendingByCategory } from '../components/BalanceChart';
import { calculateBalances, simplifyDebts } from '../utils/debtSimplification';
import { formatCurrency } from '../utils/currencyUtils';

export default function Dashboard() {
    const { state } = useApp();
    const navigate = useNavigate();
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', currency: 'TRY', color: '#8b5cf6' });

    // Calculate global stats
    let totalOwedToYou = 0;
    let totalYouOwe = 0;
    let totalExpenses = 0;
    let pendingSettlements = 0;

    state.groups.forEach(group => {
        const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
        const groupExpenses = state.expenses.filter(e => e.groupId === group.id);
        const balances = calculateBalances(groupExpenses, groupMembers);
        const myBalance = balances[state.currentUser] || 0;

        if (myBalance > 0) totalOwedToYou += myBalance;
        if (myBalance < 0) totalYouOwe += Math.abs(myBalance);

        totalExpenses += groupExpenses.reduce((s, e) => s + e.amount, 0);
    });

    pendingSettlements = state.settlements.filter(s => s.status !== 'paid').length;

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (!newGroup.name.trim()) return;

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const group = {
            id,
            name: newGroup.name,
            description: newGroup.description,
            currency: newGroup.currency,
            members: [state.currentUser],
            createdAt: new Date().toISOString(),
            color: newGroup.color,
        };
        state.groups.push(group); // We'll dispatch instead
        // dispatch add group
        location.reload(); // Simple approach for demo
    };

    const stats = [
        {
            icon: <TrendingUp size={22} />,
            iconBg: 'rgba(16, 185, 129, 0.15)',
            iconColor: 'var(--accent-emerald)',
            value: formatCurrency(totalOwedToYou, 'TRY'),
            label: 'Sana Borçlu',
            gradient: 'var(--gradient-success)',
        },
        {
            icon: <TrendingDown size={22} />,
            iconBg: 'rgba(244, 63, 94, 0.15)',
            iconColor: 'var(--accent-rose)',
            value: formatCurrency(totalYouOwe, 'TRY'),
            label: 'Senin Borcun',
            gradient: 'var(--gradient-danger)',
        },
        {
            icon: <Wallet size={22} />,
            iconBg: 'rgba(139, 92, 246, 0.15)',
            iconColor: 'var(--accent-purple)',
            value: formatCurrency(totalExpenses, 'TRY'),
            label: 'Toplam Harcama',
            gradient: 'var(--gradient-primary)',
        },
        {
            icon: <ArrowLeftRight size={22} />,
            iconBg: 'rgba(245, 158, 11, 0.15)',
            iconColor: 'var(--accent-amber)',
            value: pendingSettlements.toString(),
            label: 'Bekleyen Ödeme',
            gradient: 'var(--gradient-danger)',
        },
    ];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>
                        Merhaba, <span className="text-gradient">
                            {state.members[state.currentUser]?.name?.split(' ')[0] || 'Kullanıcı'}
                        </span> 👋
                    </h2>
                    <p className="page-subtitle">Finansal durumunun özeti</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
                    <PlusCircle size={16} /> Masraf Ekle
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-4 mb-xl">
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-xl)' }} className="dashboard-grid">
                {/* Left: Groups */}
                <div>
                    <div className="flex items-center justify-between mb-lg">
                        <h3>Grupların</h3>
                        <span className="badge badge-purple">{state.groups.length} grup</span>
                    </div>
                    <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {state.groups.map((group, i) => (
                            <GroupCard key={group.id} group={group} index={i} />
                        ))}

                        {/* Add Group Card */}
                        <div
                            className="glass-card animate-fade-in-up"
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 200,
                                border: '2px dashed var(--border-secondary)',
                                background: 'transparent',
                            }}
                            onClick={() => setShowNewGroup(true)}
                        >
                            <div className="text-center">
                                <PlusCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p className="text-sm text-muted">Yeni Grup Oluştur</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Activity + Chart */}
                <div className="flex flex-col gap-xl sidebar-panel">
                    {/* Spending Chart */}
                    <div className="glass-card">
                        <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>Harcama Dağılımı</h4>
                        <SpendingByCategory />
                    </div>

                    {/* Activity Feed */}
                    <div className="glass-card">
                        <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>Son Aktiviteler</h4>
                        <ActivityFeed limit={8} />
                    </div>
                </div>
            </div>

            {/* New Group Modal */}
            {showNewGroup && (
                <NewGroupModal
                    onClose={() => setShowNewGroup(false)}
                    onSubmit={(group) => {
                        setShowNewGroup(false);
                        navigate(`/group/${group.id}`);
                    }}
                />
            )}

            {/* Dashboard mobile grid override */}
            <style>{`
        @media (max-width: 767px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
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

function NewGroupModal({ onClose, onSubmit }) {
    const { state, dispatch } = useApp();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('TRY');

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];
    const [color, setColor] = useState(colors[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const group = {
            id,
            name: name.trim(),
            description: description.trim(),
            currency,
            members: [state.currentUser],
            createdAt: new Date().toISOString(),
            color,
        };

        dispatch({ type: 'ADD_GROUP', payload: group });
        onSubmit(group);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Yeni Grup Oluştur</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">Grup Adı</label>
                        <input
                            className="form-input"
                            placeholder="Örn: 🏠 Ev Masrafları"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Açıklama (opsiyonel)</label>
                        <input
                            className="form-input"
                            placeholder="Kısa bir açıklama..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Para Birimi</label>
                        <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                            <option value="TRY">₺ TRY</option>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="GBP">£ GBP</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Renk</label>
                        <div className="flex gap-sm">
                            {colors.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                        background: c, cursor: 'pointer',
                                        border: color === c ? '3px solid white' : '3px solid transparent',
                                        transition: 'border var(--transition-fast)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full btn-lg">
                        <Users size={16} /> Grubu Oluştur
                    </button>
                </form>
            </div>
        </div>
    );
}
