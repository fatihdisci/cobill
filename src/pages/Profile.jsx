import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Bell, Globe, Palette, Shield,
    LogOut, Copy, Check, Edit2, CircleUser, ChevronRight, ChevronDown,
    Eye, EyeOff, AlertCircle, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { getInitials } from '../utils/helpers';
import { auth } from '../config/firebase';
import { updatePassword, sendPasswordResetEmail, verifyBeforeUpdateEmail, deleteUser } from 'firebase/auth';
import { dbService } from '../utils/dbService';
import AvatarPicker from '../components/ui/AvatarPicker';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Toast State
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Accordion States
    const [expanded, setExpanded] = useState(null); // 'account', 'settings', 'security'

    // Form States
    const [accountForm, setAccountForm] = useState({
        email: currentUser?.email || '',
        phone: currentUser?.phone || ''
    });

    // Settings States
    const [reminderFrequency, setReminderFrequency] = useState(state.settings?.reminderFrequency || 'never');
    const [language, setLanguage] = useState(i18n.language?.toUpperCase() === 'EN' ? 'EN' : 'TR');
    const [theme, setTheme] = useState(state.settings?.theme || 'light');

    // Notification Preferences
    const userPrefs = currentUser?.preferences || {};
    const [pushEnabled, setPushEnabled] = useState(userPrefs.pushNotifications ?? true);
    const [emailEnabled, setEmailEnabled] = useState(userPrefs.emailNotifications ?? false);

    const handleToggleNotification = async (type) => {
        const newPush = type === 'push' ? !pushEnabled : pushEnabled;
        const newEmail = type === 'email' ? !emailEnabled : emailEnabled;

        // Push şalteri açılıyorsa FCM izin akışını başlat
        if (type === 'push' && newPush === true) {
            try {
                const { requestAndSaveFCMToken } = await import('../utils/notificationService');
                const token = await requestAndSaveFCMToken();

                setPushEnabled(true);
                const updatedPrefs = { pushNotifications: true, emailNotifications: newEmail };

                dispatch({
                    type: 'UPDATE_MEMBER',
                    payload: { id: state.currentUser, preferences: updatedPrefs, fcmToken: token }
                });
                showToast(t('profile.pushEnabledSuccess'));
                return;

            } catch (error) {
                if (error.message === 'NOT_SUPPORTED') {
                    showToast(t('profile.pushNotSupported'), 'error');
                } else {
                    showToast(t('profile.pushPermissionDenied'), 'error');
                }
                setPushEnabled(false);
                return;
            }
        }

        if (type === 'push') setPushEnabled(newPush);
        if (type === 'email') setEmailEnabled(newEmail);

        const updatedPrefs = { pushNotifications: newPush, emailNotifications: newEmail };

        // Optimistic UI — arka planda sessizce kaydet
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, preferences: updatedPrefs }
        });
    };

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

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        try {
            let emailChanged = false;

            // Eğer e-posta değiştiyse Auth tarafında işlem yap
            if (accountForm.email !== currentUser.email) {
                if (auth.currentUser && auth.currentUser.uid !== 'test-user-id') {
                    await verifyBeforeUpdateEmail(auth.currentUser, accountForm.email);
                    emailChanged = true;
                } else if (auth.currentUser?.uid === 'test-user-id') {
                    showToast(t('profile.testAccountMock'));
                    return;
                }
            }

            // Firestore'u güncelle (Telefon ve Email için)
            dispatch({
                type: 'UPDATE_MEMBER',
                payload: { id: state.currentUser, email: accountForm.email, phone: accountForm.phone }
            });

            setExpanded(null);

            // E-posta değiştiyse farklı, değişmediyse farklı mesaj göster
            if (emailChanged) {
                showToast(t('profile.verifyEmailSent'));
            } else {
                showToast(t('profile.accountInfoUpdated'));
            }

        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                showToast(t('profile.reauthRequired'), 'error');
            } else {
                showToast(t('profile.emailUpdateError') + " " + error.message, 'error');
            }
        }
    };

    const handleFrequencyChange = (e) => {
        const value = e.target.value;
        setReminderFrequency(value);

        const newSettings = { ...state.settings, reminderFrequency: value };

        // 1. Local State Settings Güncellemesi
        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: newSettings
        });

        // 2. Firebase User Settings Güncellemesi (Optimistic UI)
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, settings: newSettings }
        });

        // Başarılı toast mesajı
        showToast(t('profile.reminderUpdated'));
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
        showToast(t('settings.saved'));
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);

        // Anında uygula (Optimistic UI)
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        const newSettings = { ...state.settings, theme: newTheme };

        dispatch({
            type: 'UPDATE_SETTINGS',
            payload: newSettings
        });

        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, settings: newSettings }
        });
    };

    const handleSendPasswordReset = async () => {
        try {
            if (auth.currentUser && auth.currentUser.email && auth.currentUser.uid !== 'test-user-id') {
                await sendPasswordResetEmail(auth, auth.currentUser.email);
                showToast(t('profile.passwordResetEmailSent'));
                setExpanded(null);
            } else {
                showToast(t('profile.testAccountMock')); // Test kullanıcısı koruması
            }
        } catch (error) {
            showToast(t('profile.passwordError') + error.message, 'error');
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

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('profile.deleteAccountConfirm'))) return;

        try {
            if (auth.currentUser?.uid === 'test-user-id') {
                showToast(t('profile.testAccountMock'));
                return;
            }

            // 1. Firestore'da anonimleştir (Ghost User)
            await dbService.anonymizeUser(auth.currentUser.uid);

            // 2. Firebase Auth'tan kalıcı olarak sil
            await deleteUser(auth.currentUser);

            // 3. Session/Token temizliği
            sessionStorage.removeItem('MOCK_FIREBASE_USER');
            localStorage.clear();
            navigate('/login');
            window.location.reload();

        } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
                showToast(t('profile.deleteReauthRequired'), 'error');
            } else {
                showToast(t('profile.emailUpdateError') + ' ' + error.message, 'error');
            }
        }
    };

    const handleAvatarSelect = (avatarId) => {
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, avatarId }
        });
    };

    return (
        <div className="page-content animate-fade-in flex flex-col gap-xl" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', minWidth: 0, paddingBottom: '100px' }}>
            {/* 1. Header (Avatar Picker) */}
            <div className="flex flex-col items-center gap-md text-center mt-md">
                <AvatarPicker
                    selectedId={currentUser?.avatarId || 1}
                    onSelect={handleAvatarSelect}
                    userName={currentUser?.name || t('profile.userIdentity')}
                    subtitle={t('profile.selectAvatar')}
                />
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
                                    <span className="text-xs text-muted mt-xs">{t('profile.emailChangeWarning')}</span>
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
                            <div className="flex flex-col gap-md">
                                {/* Push Notifications Toggle */}
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{t('settings.pushNotifications')}</span>
                                        <span className="text-xs text-muted" style={{ maxWidth: '220px' }}>{t('settings.pushDesc')}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={pushEnabled}
                                            onChange={() => handleToggleNotification('push')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                {/* Email Notifications Toggle */}
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{t('settings.emailNotifications')}</span>
                                        <span className="text-xs text-muted" style={{ maxWidth: '220px' }}>{t('settings.emailDesc')}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={emailEnabled}
                                            onChange={() => handleToggleNotification('email')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>

                                <div style={dividerStyle} />

                                {/* Existing Reminder Frequency */}
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
                                <span className="text-xs text-muted">{t('profile.languageAndTheme')} (<span style={{ fontFamily: 'monospace' }}>{language}</span>/{theme === 'dark' ? t('profile.themeDark') : t('profile.themeLight')})</span>
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
                                <div className="flex justify-between items-center" style={{ marginTop: 'var(--space-md)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{t('profile.uiTheme')}</span>
                                        <span className="text-xs text-muted">{theme === 'dark' ? t('profile.themeDark') : t('profile.themeLight')}</span>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={theme === 'dark'}
                                            onChange={handleThemeChange}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
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
                            <div className="flex flex-col gap-sm">
                                <p className="text-sm text-muted mb-xs">{t('profile.passwordResetDesc')}</p>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleSendPasswordReset}
                                >
                                    {t('profile.sendResetLinkBtn')}
                                </button>
                            </div>
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

            {/* 5. Tehlike Alanı — Hesabı Sil */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
                <button
                    className="btn w-full"
                    onClick={handleDeleteAccount}
                    style={{
                        color: '#fff',
                        background: 'linear-gradient(135deg, #e11d48, #be123c)',
                        border: '1px solid var(--accent-rose)',
                        padding: 'var(--space-lg)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderRadius: 'var(--radius-lg)'
                    }}
                >
                    <Trash2 size={18} />
                    {t('profile.deleteAccountBtn')}
                </button>
                <p style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginTop: 'var(--space-xs)',
                    opacity: 0.7
                }}>
                    {t('profile.deleteAccountWarning')}
                </p>
            </div>

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

            {/* Portal for Toast Notification */}
            {createPortal(
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: 'var(--space-xl)',
                                left: '16px',
                                right: '16px',
                                zIndex: 9999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-sm)',
                                background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                                color: 'white',
                                padding: '12px 20px',
                                borderRadius: '100px',
                                fontSize: 'var(--font-sm)',
                                fontWeight: 500,
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                margin: '0 auto',
                                width: 'max-content',
                                maxWidth: 'calc(100vw - 32px)'
                            }}
                        >
                            {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
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
