import { useState } from 'react';
import { Save, RotateCcw, Globe, Bell, Palette, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSupportedCurrencies } from '../utils/currencyUtils';

export default function Settings() {
    const { state, dispatch } = useApp();
    const currencies = getSupportedCurrencies();
    const currentUser = state.members[state.currentUser];

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        defaultCurrency: state.settings?.defaultCurrency || 'TRY',
    });

    const handleSave = () => {
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, name: form.name, email: form.email },
        });
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { defaultCurrency: form.defaultCurrency },
        });
        alert('Ayarlar kaydedildi!');
    };

    const handleReset = () => {
        if (window.confirm('Tüm verileri sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            dispatch({ type: 'RESET_DATA' });
            window.location.reload();
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h2>Ayarlar</h2>
                    <p className="page-subtitle">Profil ve uygulama tercihleri</p>
                </div>
            </div>

            {/* Profile */}
            <div className="glass-card mb-xl">
                <div className="flex items-center gap-md mb-xl">
                    <Shield size={20} style={{ color: 'var(--accent-purple)' }} />
                    <h4 style={{ fontSize: 'var(--font-base)' }}>Profil Bilgileri</h4>
                </div>

                <div className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">Ad Soyad</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input
                            className="form-input"
                            type="email"
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="glass-card mb-xl">
                <div className="flex items-center gap-md mb-xl">
                    <Globe size={20} style={{ color: 'var(--accent-cyan)' }} />
                    <h4 style={{ fontSize: 'var(--font-base)' }}>Tercihler</h4>
                </div>

                <div className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">Varsayılan Para Birimi</label>
                        <select
                            className="form-select"
                            value={form.defaultCurrency}
                            onChange={e => setForm(p => ({ ...p, defaultCurrency: e.target.value }))}
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <Bell size={18} style={{ color: 'var(--accent-amber)' }} />
                            <div>
                                <div className="text-sm font-medium">Hatırlatma Bildirimleri</div>
                                <div className="text-xs text-muted">Borç hatırlatmaları için bildirim al</div>
                            </div>
                        </div>
                        <div className="toggle active" />
                    </div>

                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <Palette size={18} style={{ color: 'var(--accent-purple)' }} />
                            <div>
                                <div className="text-sm font-medium">Karanlık Tema</div>
                                <div className="text-xs text-muted">Her zaman koyu tema kullan</div>
                            </div>
                        </div>
                        <div className="toggle active" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-md">
                <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ flex: 1 }}>
                    <Save size={16} /> Kaydet
                </button>
                <button className="btn btn-danger btn-lg" onClick={handleReset}>
                    <RotateCcw size={16} /> Sıfırla
                </button>
            </div>

            {/* App Info */}
            <div className="text-center mt-xl" style={{ opacity: 0.4 }}>
                <p className="text-xs">CoBill v1.0.0 — Akıllı Masraf Paylaşım Platformu</p>
                <p className="text-xs mt-xs">Made with 💜 for better financial harmony</p>
            </div>
        </div>
    );
}
