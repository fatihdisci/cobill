import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { auth } from '../config/firebase';
import { sendPasswordResetEmail, verifyBeforeUpdateEmail, deleteUser, signOut } from 'firebase/auth';
import { dbService } from '../utils/dbService';
import AvatarPicker from '../components/ui/AvatarPicker';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-components
import IbanCard from '../components/profile/IbanCard';
import AccountSection from '../components/profile/AccountSection';
import NotificationSection from '../components/profile/NotificationSection';
import AppSettingsSection from '../components/profile/AppSettingsSection';
import SecuritySection from '../components/profile/SecuritySection';
import DangerZone from '../components/profile/DangerZone';

export default function Profile() {
    const { state, dispatch } = useApp();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const currentUser = state.members[state.currentUser];

    // Card/Logic States
    const [toast, setToast] = useState(null);
    const [expanded, setExpanded] = useState(null); // 'account', 'notifications', 'settings', 'security'

    // Form States
    const [accountForm, setAccountForm] = useState({
        email: currentUser?.email || '',
        phone: currentUser?.phone || ''
    });

    // Local state for UI responsiveness
    const pushEnabled = currentUser?.preferences?.pushNotifications ?? true;
    const emailEnabled = currentUser?.preferences?.emailNotifications ?? false;
    const reminderFrequency = state.settings?.reminderFrequency || 'never';
    const theme = state.settings?.theme || 'light';
    const language = i18n.language?.toUpperCase() === 'EN' ? 'EN' : 'TR';

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleNotification = async (type) => {
        const isPush = type === 'push';
        const currentPush = pushEnabled;
        const currentEmail = emailEnabled;

        const newPush = isPush ? !currentPush : currentPush;
        const newEmail = !isPush ? !currentEmail : currentEmail;

        if (isPush && newPush === true) {
            try {
                const { requestAndSaveFCMToken } = await import('../utils/notificationService');
                const token = await requestAndSaveFCMToken();

                dispatch({
                    type: 'UPDATE_MEMBER',
                    payload: { id: state.currentUser, preferences: { pushNotifications: true, emailNotifications: newEmail }, fcmToken: token }
                });
                showToast(t('profile.pushEnabledSuccess'));
                return;
            } catch (error) {
                showToast(error.message === 'NOT_SUPPORTED' ? t('profile.pushNotSupported') : t('profile.pushPermissionDenied'), 'error');
                return;
            }
        }

        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: state.currentUser, preferences: { pushNotifications: newPush, emailNotifications: newEmail } }
        });
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        try {
            let emailChanged = false;
            if (accountForm.email !== currentUser.email) {
                if (auth.currentUser && auth.currentUser.uid !== 'test-user-id') {
                    await verifyBeforeUpdateEmail(auth.currentUser, accountForm.email);
                    emailChanged = true;
                } else if (auth.currentUser?.uid === 'test-user-id') {
                    showToast(t('profile.testAccountMock'));
                    return;
                }
            }

            dispatch({
                type: 'UPDATE_MEMBER',
                payload: { id: state.currentUser, email: accountForm.email, phone: accountForm.phone }
            });

            setExpanded(null);
            showToast(emailChanged ? t('profile.verifyEmailSent') : t('profile.accountInfoUpdated'));
        } catch (error) {
            showToast(error.code === 'auth/requires-recent-login' ? t('profile.reauthRequired') : t('profile.emailUpdateError') + " " + error.message, 'error');
        }
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        const newSettings = { ...state.settings, language: language.toLowerCase() };
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        dispatch({ type: 'UPDATE_MEMBER', payload: { id: state.currentUser, settings: newSettings } });
        i18n.changeLanguage(language.toLowerCase());
        setExpanded(null);
        showToast(t('settings.saved'));
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        const newSettings = { ...state.settings, theme: newTheme };
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        dispatch({ type: 'UPDATE_MEMBER', payload: { id: state.currentUser, settings: newSettings } });
    };

    const handleFrequencyChange = (e) => {
        const value = e.target.value;
        const newSettings = { ...state.settings, reminderFrequency: value };
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
        dispatch({ type: 'UPDATE_MEMBER', payload: { id: state.currentUser, settings: newSettings } });
        showToast(t('profile.reminderUpdated'));
    };

    const handleLogout = async () => {
        if (window.confirm(t('profile.logoutConfirm'))) {
            try {
                // 1. Varsa sahte test kullanıcısını temizle
                sessionStorage.removeItem('MOCK_FIREBASE_USER');

                // 2. Gerçek Firebase oturumunu kapat
                await signOut(auth);

                // 3. Login sayfasına yönlendir (Reload'a gerek yok, auth state listener halledecek)
                navigate('/login');
            } catch (error) {
                console.error("Çıkış yapılırken hata oluştu:", error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('profile.deleteAccountConfirm'))) return;
        try {
            if (auth.currentUser?.uid === 'test-user-id') {
                showToast(t('profile.testAccountMock'));
                return;
            }
            await dbService.anonymizeUser(auth.currentUser.uid);
            await deleteUser(auth.currentUser);
            sessionStorage.removeItem('MOCK_FIREBASE_USER');
            localStorage.clear();
            navigate('/login');
            window.location.reload();
        } catch (error) {
            showToast(error.code === 'auth/requires-recent-login' ? t('profile.deleteReauthRequired') : t('profile.emailUpdateError') + ' ' + error.message, 'error');
        }
    };

    return (
        <div className="page-content animate-fade-in flex flex-col gap-xl" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', minWidth: 0, paddingBottom: '100px' }}>
            {/* 1. Header */}
            <div className="flex flex-col items-center gap-md text-center mt-md">
                <AvatarPicker
                    selectedId={currentUser?.avatarId || 1}
                    onSelect={(avatarId) => dispatch({ type: 'UPDATE_MEMBER', payload: { id: state.currentUser, avatarId } })}
                    userName={currentUser?.name || t('profile.userIdentity')}
                    subtitle={t('profile.selectAvatar')}
                />
            </div>

            {/* 2. IBAN Card */}
            <IbanCard
                iban={currentUser?.iban}
                onSave={(iban) => dispatch({ type: 'UPDATE_MEMBER', payload: { id: state.currentUser, iban } })}
                onCopy={() => { }} // Internal feedback handles it
            />

            {/* 3. Action List Accordion */}
            <div className="glass-card stagger-2" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="action-list">
                    <AccountSection
                        expanded={expanded === 'account'}
                        onToggle={setExpanded}
                        form={accountForm}
                        onChange={(key, val) => setAccountForm({ ...accountForm, [key]: val })}
                        onSubmit={handleSaveAccount}
                        itemStyle={itemStyle}
                        expandableStyle={expandableStyle}
                    />
                    <div className="divider" style={dividerStyle} />

                    <NotificationSection
                        expanded={expanded === 'notifications'}
                        onToggle={setExpanded}
                        pushEnabled={pushEnabled}
                        onPushToggle={() => handleToggleNotification('push')}
                        emailEnabled={emailEnabled}
                        onEmailToggle={() => handleToggleNotification('email')}
                        frequency={reminderFrequency}
                        onFrequencyChange={handleFrequencyChange}
                        itemStyle={itemStyle}
                        expandableStyle={expandableStyle}
                        dividerStyle={dividerStyle}
                    />
                    <div className="divider" style={dividerStyle} />

                    <AppSettingsSection
                        expanded={expanded === 'settings'}
                        onToggle={setExpanded}
                        language={language}
                        onLanguageChange={(lang) => i18n.changeLanguage(lang.toLowerCase())}
                        theme={theme}
                        onThemeToggle={handleThemeChange}
                        onSubmit={(e) => { e.preventDefault(); setExpanded(null); showToast(t('settings.saved')); }}
                        itemStyle={itemStyle}
                        expandableStyle={expandableStyle}
                    />
                    <div className="divider" style={dividerStyle} />

                    <SecuritySection
                        expanded={expanded === 'security'}
                        onToggle={setExpanded}
                        onPasswordReset={async () => {
                            try {
                                if (auth.currentUser?.email && auth.currentUser.uid !== 'test-user-id') {
                                    await sendPasswordResetEmail(auth, auth.currentUser.email);
                                    showToast(t('profile.passwordResetEmailSent'));
                                    setExpanded(null);
                                } else showToast(t('profile.testAccountMock'));
                            } catch (e) { showToast(t('profile.passwordError') + e.message, 'error'); }
                        }}
                        itemStyle={itemStyle}
                        expandableStyle={expandableStyle}
                    />
                </div>
            </div>

            {/* 4. Logout & Delete */}
            <DangerZone onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />

            {/* Inline Styles & Toast Portal */}
            <ProfileStyles />
            {createPortal(
                <AnimatePresence>
                    {toast && <Toast message={toast.message} type={toast.type} />}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

// Internal Helper Components for clean Profile.jsx
const ProfileStyles = () => (
    <style>{`
        .action-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg) var(--space-xl); cursor: pointer; transition: background 0.2s ease; }
        .action-item:hover { background: var(--bg-glass); }
        .icon-box { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white; }
        .icon-box.purple { background: rgba(139, 92, 246, 0.2); color: var(--accent-purple-light); }
        .icon-box.amber { background: rgba(245, 158, 11, 0.2); color: var(--accent-amber-light); }
        .icon-box.cyan { background: rgba(6, 182, 212, 0.2); color: var(--accent-cyan-light); }
        .icon-box.emerald { background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald-light); }
        .text-emerald { color: var(--accent-emerald-light) !important; }
    `}</style>
);

const Toast = ({ message, type }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        style={{
            position: 'fixed', top: 'var(--space-xl)', left: '16px', right: '16px', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)',
            background: type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            color: 'white', padding: '12px 20px', borderRadius: '100px', fontSize: 'var(--font-sm)',
            fontWeight: 500, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)', margin: '0 auto', width: 'max-content', maxWidth: 'calc(100vw - 32px)'
        }}
    >
        {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
        {message}
    </motion.div>
);

const itemStyle = { minHeight: '72px' };
const expandableStyle = { padding: 'var(--space-md) var(--space-xl) var(--space-xl) var(--space-xl)', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' };
const dividerStyle = { height: '1px', background: 'var(--border-primary)', margin: '0' };

