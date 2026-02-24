import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GroupCard from '../components/GroupCard';
import { showBannerAd, hideBannerAd } from '../utils/adService';

export default function Groups() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [showNew, setShowNew] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [currency, setCurrency] = useState('TRY');
    const isPro = state.members[state.currentUser]?.isPro;

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];
    const [color, setColor] = useState(colors[0]);

    useEffect(() => {
        if (!isPro) {
            showBannerAd();
        }
        return () => {
            hideBannerAd();
        };
    }, [isPro]);

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
                createdAt: new Date().toISOString(),
                color,
            },
        });
        setShowNew(false);
        setName('');
        setDesc('');
        navigate(`/group/${id}`);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Gruplar</h2>
                    <p className="page-subtitle">{state.groups.length} aktif grup</p>
                </div>
                <div className="flex gap-md">
                    <button className="btn btn-secondary" onClick={() => navigate('/add-member')}>
                        <UserPlus size={16} /> Yeni Üye Ekle
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                        <PlusCircle size={16} /> Yeni Grup
                    </button>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {state.groups.map((group, i) => (
                    <GroupCard key={group.id} group={group} index={i} />
                ))}
            </div>

            {state.groups.length === 0 && (
                <div className="empty-state glass-card">
                    <div className="empty-icon">👥</div>
                    <h3>Henüz grup yok</h3>
                    <p className="text-sm mb-lg">İlk grubunuzu oluşturarak başlayın</p>
                    <button className="btn btn-primary" onClick={() => setShowNew(true)}>
                        <PlusCircle size={16} /> Grup Oluştur
                    </button>
                </div>
            )}

            {showNew && (
                <div className="modal-overlay" onClick={() => setShowNew(false)}>
                    <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Grup Oluştur</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="flex flex-col gap-lg">
                            <div className="form-group">
                                <label className="form-label">Grup Adı</label>
                                <input className="form-input" placeholder="Örn: 🏠 Ev Masrafları" value={name}
                                    onChange={e => setName(e.target.value)} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <input className="form-input" placeholder="Kısa açıklama..." value={desc}
                                    onChange={e => setDesc(e.target.value)} />
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
                                        <div key={c} onClick={() => setColor(c)} style={{
                                            width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                            background: c, cursor: 'pointer',
                                            border: color === c ? '3px solid white' : '3px solid transparent',
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full btn-lg">
                                <Users size={16} /> Oluştur
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
