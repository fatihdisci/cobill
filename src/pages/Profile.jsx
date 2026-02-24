import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Bell, Globe, Palette, Shield,
    LogOut, Copy, Check, Edit2, CircleUser, ChevronRight, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials } from '../utils/helpers';

export default function Profile() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const currentUser = state.members[state.currentUser];

    // Card States
    const [isEditingIban, setIsEditingIban] = useState(false);
    const [tempIban, setTempIban] = useState(currentUser?.iban || '');
    const [copyFeedback, setCopyFeedback] = useState(false);

    // Accordion States
    const [expanded, setExpanded] = useState(null); // 'account', 'settings', 'security'

    // Form States
    const [accountForm, setAccountForm] = useState({
        email: currentUser?.email || '',
        phone: currentUser?.phone || ''
    });

    const [securityForm, setSecurityForm] = useState({
        currentPass: '',
        newPass: '',
        confirmPass: ''
    });

    // Settings States
    const [reminderFrequency, setReminderFrequency] = useState(state.settings?.reminderFrequency || 'never');
    const [language, setLanguage] = useState(state.settings?.language || 'TR');

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

    const handleToggleExtend = (section) => {
        setExpanded(expanded === section ? null : section);
    };

    const handleSaveAccount = (e) => {
        e.preventDefault();
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, email: accountForm.email, phone: accountForm.phone }
        });
        setExpanded(null);
        alert('Hesap bilgileri güncellendi.');
    };

    const handleFrequencyChange = (e) => {
        const value = e.target.value;
        setReminderFrequency(value);
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { ...state.settings, reminderFrequency: value }
        });
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: { ...state.settings, language }
        });
        setExpanded(null);
        alert('Uygulama ayarları başarıyla kaydedildi.');
    };

    const handleSaveSecurity = (e) => {
        e.preventDefault();
        if (securityForm.newPass !== securityForm.confirmPass) {
            alert('Yeni şifreler uyuşmuyor, lütfen tekrar deneyin.');
            return;
        }
        if (securityForm.newPass.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        // Simulating Password Update
        setSecurityForm({ currentPass: '', newPass: '', confirmPass: '' });
        setExpanded(null);
        alert('Güvenlik ayarlarınız başarıyla güncellendi.');
    };

    const handleLogout = () => {
        if (window.confirm('Hesabınızdan çıkış yapmak istediğinize emin misiniz?')) {
            // Gerçek bir uygulamada token silinir vs.
            navigate('/');
        }
    };

    return (
        <div className="page-content animate-fade-in flex flex-col gap-xl" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', minWidth: 0, paddingBottom: '100px' }}>
            {/* 1. Header (Kimlik Bölümü) */}
            <div className="flex flex-col items-center gap-md text-center mt-md">
                <div className="avatar avatar-xl" style={{
                    background: getAvatarColor(state.currentUser),
                    width: '100px',
                    height: '100px',
                    fontSize: '2.5rem',
                    border: '4px solid var(--border-primary)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
                }}>
                    {getInitials(currentUser?.name)}
                </div>
                <h2 className="animate-slide-up" style={{ fontSize: 'var(--font-2xl)', marginTop: 'var(--space-sm)' }}>
                    {currentUser?.name || 'Kullanıcı Kimliği'}
                </h2>
            </div>

            {/* 2. Kendi IBAN Kartın */}
            <div className="glass-card stagger-1">
                <div className="flex justify-between items-start mb-md">
                    <span className="form-label" style={{ fontSize: 'var(--font-xs)' }}>Kendi IBAN Bilgin</span>
                    {!isEditingIban && currentUser?.iban && (
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={handleCopyIBAN}
                            style={{ height: '32px', width: '32px' }}
                            title="Kopyala"
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
                            {currentUser?.iban || <span className="text-muted italic">Kayıtlı IBAN bulunamadı</span>}
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
            <div className="glass-card stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="action-list">

                    {/* Hesap Bilgileri */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('account')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box purple"><User size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Hesap Bilgileri</span>
                                <span className="text-xs text-muted">E-posta ve telefon numarası</span>
                            </div>
                        </div>
                        {expanded === 'account' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'account' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveAccount} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">E-posta Adresi</label>
                                    <input type="email" required className="form-input btn-sm" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} placeholder="ornek@mail.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Telefon Numarası</label>
                                    <input type="tel" className="form-input btn-sm" value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} placeholder="0555 555 55 55" />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">Güncelle</button>
                            </form>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Bildirimler */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('notifications')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box amber"><Bell size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Bildirimler</span>
                                <span className="text-xs text-muted">Borç Hatırlatıcı (
                                    {reminderFrequency === 'daily' ? 'Her Gün' : reminderFrequency === 'weekly' ? 'Her Hafta' : 'Kapalı'}
                                    )</span>
                            </div>
                        </div>
                        {expanded === 'notifications' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'notifications' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <div className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">Hatırlatma Sıklığı</label>
                                    <select
                                        className="form-select btn-sm"
                                        value={reminderFrequency}
                                        onChange={handleFrequencyChange}
                                    >
                                        <option value="never">Kapalı</option>
                                        <option value="daily">Her Gün</option>
                                        <option value="weekly">Her Hafta</option>
                                    </select>
                                </div>
                                <span className="text-xs text-muted mt-xs">Ödenmemiş borçlarınız için size hatırlatma göndereceğiz.</span>
                            </div>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Uygulama Ayarları */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('settings')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box cyan"><Globe size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Uygulama Ayarları</span>
                                <span className="text-xs text-muted">Dil ve Tema (<span style={{ fontFamily: 'monospace' }}>{language}</span>/OLED)</span>
                            </div>
                        </div>
                        {expanded === 'settings' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'settings' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveSettings} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">Dil Seçimi</label>
                                    <select className="form-select btn-sm" value={language} onChange={e => setLanguage(e.target.value)}>
                                        <option value="TR">Türkçe (TR)</option>
                                        <option value="EN">English (EN)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Arayüz Teması</label>
                                    <input type="text" className="form-input btn-sm" value="Koyu Tema (OLED Siyahı)" disabled style={{ opacity: 0.7 }} />
                                    <span className="text-xs text-muted mt-xs">CoBill, göz yorgunluğunu azaltan ve amoled ekranlarda pil tasarrufu sağlayan kesintisiz bir "OLED" denetimine sahiptir. Tema sabittir.</span>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">Ayarları Kaydet</button>
                            </form>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Güvenlik */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('security')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box emerald"><Shield size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">Güvenlik</span>
                                <span className="text-xs text-muted">Şifre güncelle</span>
                            </div>
                        </div>
                        {expanded === 'security' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'security' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveSecurity} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">Mevcut Şifre</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.currentPass} onChange={(e) => setSecurityForm({ ...securityForm, currentPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Yeni Şifre</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.newPass} onChange={(e) => setSecurityForm({ ...securityForm, newPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">Şifre Tekrar</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.confirmPass} onChange={(e) => setSecurityForm({ ...securityForm, confirmPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">Şifreyi Güncelle</button>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* 4. Çıkış Yap */}
            <button
                className="btn btn-ghost w-full stagger-3 hover:bg-rose-500/10"
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

            {/* Inline Styles */}
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

const expandableStyle = {
    padding: 'var(--space-md) var(--space-xl) var(--space-xl) var(--space-xl)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
};

const dividerStyle = {
    height: '1px',
    background: 'var(--border-primary)',
    margin: '0',
};
