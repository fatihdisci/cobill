import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Bell, Globe, Palette, Shield,
    LogOut, Copy, Check, Edit2, CircleUser, ChevronRight, ChevronDown,
    Eye, EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { getAvatarColor, getInitials } from '../utils/helpers';
import { auth } from '../config/firebase';
import { updatePassword } from 'firebase/auth';

export default function Profile() {
    const { state, dispatch } = useApp();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentUser = state.members[state.currentUser];

    // Card States
    const [isEditingIban, setIsEditingIban] = useState(false);
    const [tempIban, setTempIban] = useState(currentUser?.iban || '');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [showIban, setShowIban] = useState(false);

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
    const [language, setLanguage] = useState(i18n.language?.toUpperCase() === 'EN' ? 'EN' : 'TR');

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
        alert(t('profile.accountInfoUpdated'));
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
        const newSettings = { ...state.settings, language, reminderFrequency };
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: newSettings
        });
        // Sadece AppContext değil, kullanıcı profiline de yansıtalım.
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, settings: newSettings }
        });
        // i18n dil değiştirme
        const langCode = language.toLowerCase();
        i18n.changeLanguage(langCode);
        setExpanded(null);
        alert(t('settings.saved'));
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        if (securityForm.newPass !== securityForm.confirmPass) {
            alert(t('profile.passwordsDoNotMatch'));
            return;
        }
        if (securityForm.newPass.length < 6) {
            alert(t('profile.passwordMinLength'));
            return;
        }

        try {
            if (auth.currentUser && auth.currentUser.uid !== 'test-user-id') {
                await updatePassword(auth.currentUser, securityForm.newPass);
                alert(t('profile.securityUpdated'));
            } else {
                // Mock user
                alert(t('profile.testAccountMock'));
            }
            setSecurityForm({ currentPass: '', newPass: '', confirmPass: '' });
            setExpanded(null);
        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                alert(t('profile.reauthRequired'));
            } else {
                alert(t('profile.passwordError') + error.message);
            }
        }
    };

    const handleLogout = () => {
        if (window.confirm(t('profile.logoutConfirm'))) {
            // Gerçek bir uygulamada token silinir vs.
            sessionStorage.removeItem('MOCK_FIREBASE_USER');
            // Normally you would sign out of Firebase here as well:
            // auth.signOut();
            navigate('/login');
            window.location.reload();
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
                <h2 style={{ fontSize: 'var(--font-2xl)', marginTop: 'var(--space-sm)' }}>
                    {currentUser?.name || t('profile.userIdentity')}
                </h2>
            </div>

            {/* 2. Kendi IBAN Kartın */}
            <div className="glass-card stagger-1">
                <div className="flex justify-between items-start mb-md">
                    <span className="form-label" style={{ fontSize: 'var(--font-xs)' }}>{t('profile.ownIbanInfo')}</span>
                    {!isEditingIban && currentUser?.iban && (
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={handleCopyIBAN}
                            style={{ height: '32px', width: '32px' }}
                            title={t('profile.copy')}
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
                            <button className="btn btn-primary btn-sm flex-1" onClick={handleSaveIban}>{t('common.save')}</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => {
                                setIsEditingIban(false);
                                setTempIban(currentUser?.iban || '');
                            }}>{t('common.cancel')}</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-xs">
                            <div className="text-lg font-mono" style={{ letterSpacing: '0.05em' }}>
                                {currentUser?.iban ? (
                                    showIban ? currentUser.iban : currentUser.iban.replace(/^(.{2})(.+)(.{4})$/, (_, p1, p2, p3) => `${p1}**** **** **** ${p3}`)
                                ) : (
                                    <span className="text-muted italic">{t('profile.noIbanSaved')}</span>
                                )}
                            </div>
                            {currentUser?.iban && (
                                <button
                                    className="btn btn-ghost btn-sm btn-icon ml-xs"
                                    onClick={() => setShowIban(!showIban)}
                                    title={showIban ? t('settings.hide') : t('settings.show')}
                                    style={{ height: '24px', width: '24px' }}
                                >
                                    {showIban ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            )}
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                                setIsEditingIban(true);
                                setTempIban(currentUser?.iban || '');
                            }}
                            style={{ height: 'auto', padding: '4px 8px' }}
                        >
                            <Edit2 size={12} style={{ marginRight: '4px' }} /> {t('common.edit')}
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
                                <span className="text-sm font-semibold">{t('profile.accountInfo')}</span>
                                <span className="text-xs text-muted">{t('profile.emailAndPhone')}</span>
                            </div>
                        </div>
                        {expanded === 'account' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'account' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveAccount} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.emailAddress')}</label>
                                    <input type="email" required className="form-input btn-sm" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} placeholder={t('profile.exampleEmail')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.phoneNumber')}</label>
                                    <input type="tel" className="form-input btn-sm" value={accountForm.phone} onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} placeholder={t('profile.examplePhone')} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">{t('profile.update')}</button>
                            </form>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Bildirimler */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('notifications')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box amber"><Bell size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t('profile.notifications')}</span>
                                <span className="text-xs text-muted">{t('profile.debtReminder')} (
                                    {reminderFrequency === 'daily' ? t('profile.everyDay') : reminderFrequency === 'weekly' ? t('profile.everyWeek') : t('profile.off')}
                                    )</span>
                            </div>
                        </div>
                        {expanded === 'notifications' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'notifications' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <div className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.reminderFrequency')}</label>
                                    <select
                                        className="form-select btn-sm"
                                        value={reminderFrequency}
                                        onChange={handleFrequencyChange}
                                    >
                                        <option value="never">{t('profile.off')}</option>
                                        <option value="daily">{t('profile.everyDay')}</option>
                                        <option value="weekly">{t('profile.everyWeek')}</option>
                                    </select>
                                </div>
                                <span className="text-xs text-muted mt-xs">{t('profile.reminderDesc')}</span>
                            </div>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Uygulama Ayarları */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('settings')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box cyan"><Globe size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t('profile.appSettings')}</span>
                                <span className="text-xs text-muted">{t('profile.languageAndTheme')} (<span style={{ fontFamily: 'monospace' }}>{language}</span>/Light)</span>
                            </div>
                        </div>
                        {expanded === 'settings' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'settings' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveSettings} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.languageSelection')}</label>
                                    <select className="form-select btn-sm" value={language} onChange={e => setLanguage(e.target.value)}>
                                        <option value="TR">{t('common.turkish')} (TR)</option>
                                        <option value="EN">{t('common.english')} (EN)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.uiTheme')}</label>
                                    <input type="text" className="form-input btn-sm" value={t('profile.lightThemeMin')} disabled style={{ opacity: 0.7 }} />
                                    <span className="text-xs text-muted mt-xs">{t('profile.themeDesc')}</span>
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">{t('profile.saveSettings')}</button>
                            </form>
                        </div>
                    )}
                    <div className="divider" style={dividerStyle} />

                    {/* Güvenlik */}
                    <div className="action-item" style={itemStyle} onClick={() => handleToggleExtend('security')}>
                        <div className="flex items-center gap-md">
                            <div className="icon-box emerald"><Shield size={18} /></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t('profile.security')}</span>
                                <span className="text-xs text-muted">{t('profile.updatePasswordText')}</span>
                            </div>
                        </div>
                        {expanded === 'security' ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
                    </div>
                    {expanded === 'security' && (
                        <div className="animate-fade-in" style={expandableStyle}>
                            <form onSubmit={handleSaveSecurity} className="flex flex-col gap-sm">
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.currentPass')}</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.currentPass} onChange={(e) => setSecurityForm({ ...securityForm, currentPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.newPass')}</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.newPass} onChange={(e) => setSecurityForm({ ...securityForm, newPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label text-xs">{t('profile.confirmPass')}</label>
                                    <input type="password" required className="form-input btn-sm" value={securityForm.confirmPass} onChange={(e) => setSecurityForm({ ...securityForm, confirmPass: e.target.value })} placeholder="••••••••" />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm mt-xs">{t('profile.updatePasswordBtn')}</button>
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
                {t('profile.logout')}
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
