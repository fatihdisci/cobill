import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Bell, Globe, Palette, Shield,
    LogOut, Copy, Check, Edit2, CircleUser, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials } from '../utils/helpers';

export default function Profile() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const currentUser = state.members[state.currentUser];

    const [isEditingIban, setIsEditingIban] = useState(false);
    const [tempIban, setTempIban] = useState(currentUser?.iban || '');
    const [copyFeedback, setCopyFeedback] = useState(false);

    const formatIBAN = (value) => {
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const limited = cleaned.slice(0, 26);
        return limited.match(/.{1,4}/g)?.join(' ') || limited;
    };

    const handleCopyIBAN = () => {
        if (!currentUser?.iban) return;
        const cleanIban = currentUser.iban.replace(/\s/g, '');
        navigator.clipboard.writeText(cleanIban).then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        });
    };

    const handleSaveIban = () => {
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, iban: tempIban.trim() }
        });
        setIsEditingIban(false);
    };

    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            // Gerçek bir auth sisteminde burada logout tetiklenirdi
            navigate('/');
        }
    };

    return (
        <div className="page-content animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', minWidth: 0 }}>
            {/* 1. Header (Kimlik Bölümü) */}
            <div className="flex flex-col items-center gap-md mb-3xl text-center">
                <div className="avatar avatar-xl" style={{
                    background: getAvatarColor(state.currentUser),
                    width: '100px',
                    height: '100px',
                    fontSize: '2rem',
                    border: '4px solid var(--border-primary)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
                }}>
                    {getInitials(currentUser?.name)}
                </div>
                <h2 className="animate-slide-up" style={{ fontSize: 'var(--font-2xl)', marginTop: 'var(--space-sm)' }}>
                    {currentUser?.name || 'Kullanıcı'}
                </h2>
            </div>

            {/* 2. Kendi IBAN Kartın */}
            <div className="glass-card mb-2xl stagger-1">
                <div className="flex justify-between items-start mb-md">
                    <span className="form-label" style={{ fontSize: 'var(--font-xs)' }}>Kendi IBAN Bilgin</span>
                    {!isEditingIban && currentUser?.iban && (
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={handleCopyIBAN}
                            style={{ height: '32px', width: '32px' }}
                        >
                            {copyFeedback ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                        </button>
                    )}
                </div>

                {isEditingIban ? (
                    <div className="flex flex-col gap-sm">
                        <input
                            className="form-input"
                            style={{ fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}
                            value={tempIban}
                            onChange={(e) => setTempIban(formatIBAN(e.target.value))}
                            placeholder="TR00 0000..."
                            autoFocus
                        />
                        <div className="flex gap-sm mt-xs">
                            <button className="btn btn-primary btn-sm flex-1" onClick={handleSaveIban}>Kaydet</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                setIsEditingIban(false);
                                setTempIban(currentUser?.iban || '');
                            }}>İptal</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-mono" style={{ letterSpacing: '0.05em' }}>
                            {currentUser?.iban || <span className="text-muted italic">Kayıtlı IBAN yok</span>}
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                                setIsEditingIban(true);
                                setTempIban(currentUser?.iban || '');
                            }}
                            style={{ height: 'auto', padding: '4px 8px' }}
                        >
                            <Edit2 size={12} style={{ marginRight: '4px' }} /> Düzenle
                        </button>
                    </div>
                )}
            </div>

            {/* 3. İşlem Listesi (Action List) */}
            <div className="glass-card mb-2xl stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="action-list">
                    {/* Hesap Bilgileri */}
                    <div className="action-item" style={itemStyle}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box purple"><Shield size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Hesap Bilgileri</span>
                                <span className="text-xs text-muted">E-posta ve telefon</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-muted" />
                    </div>
                    <div className="divider" style={dividerStyle} />

                    {/* Bildirimler */}
                    <div className="action-item" style={itemStyle}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box amber"><Bell size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Bildirimler</span>
                                <span className="text-xs text-muted">Uygulama içi uyarılar</span>
                            </div>
                        </div>
                        <div className="toggle active" style={{ zoom: 0.8 }} />
                    </div>
                    <div className="divider" style={dividerStyle} />

                    {/* Uygulama Ayarları */}
                    <div className="action-item" style={itemStyle}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box cyan"><Globe size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Uygulama Ayarları</span>
                                <span className="text-xs text-muted">Dil: Türkçe / Tema: OLED</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-muted" />
                    </div>
                    <div className="divider" style={dividerStyle} />

                    {/* Güvenlik */}
                    <div className="action-item" style={itemStyle}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box emerald"><Shield size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Güvenlik</span>
                                <span className="text-xs text-muted">Şifre güncelleme (placeholder)</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-muted" />
                    </div>
                </div>
            </div>

            {/* 4. Çıkış Yap */}
            <button
                className="btn btn-ghost w-full stagger-3"
                onClick={handleLogout}
                style={{
                    color: 'var(--accent-rose)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    background: 'rgba(244, 63, 94, 0.05)',
                    padding: 'var(--space-lg)'
                }}
            >
                <LogOut size={18} style={{ marginRight: '8px' }} />
                Hesaptan Çıkış Yap
            </button>

            {/* Inline Styles for clarity or move to index.css if preferred */}
            <style>{`
                .action-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-lg) var(--space-xl);
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .action-item:hover {
                    background: var(--bg-glass);
                }
                .icon-box {
                    width: 36px;
                    height: 36px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .icon-box.purple { background: rgba(139, 92, 246, 0.2); color: var(--accent-purple-light); }
                .icon-box.amber { background: rgba(245, 158, 11, 0.2); color: var(--accent-amber-light); }
                .icon-box.cyan { background: rgba(6, 182, 212, 0.2); color: var(--accent-cyan-light); }
                .icon-box.emerald { background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald-light); }
                
                .text-emerald { color: var(--accent-emerald-light) !important; }
            `}</style>
        </div>
    );
}

const itemStyle = {
    minHeight: '72px'
};

const dividerStyle = {
    height: '1px',
    background: 'var(--border-primary)',
    margin: '0 var(--space-xl)'
};
