import { useState } from 'react';
import { Save, RotateCcw, Globe, Bell, Palette, Shield, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { getSupportedCurrencies } from '../utils/currencyUtils';

export default function Settings() {
    const { t, i18n } = useTranslation();
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
        alert(t('settings.saved'));
    };

    const handleReset = () => {
        if (window.confirm(t('settings.resetConfirm'))) {
            dispatch({ type: 'RESET_DATA' });
            window.location.reload();
        }
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h2>{t('settings.title')}</h2>
                    <p className="page-subtitle">{t('settings.subtitle')}</p>
                </div>
            </div>

            {/* Profile */}
            <div className="glass-card mb-xl">
                <div className="flex items-center gap-md mb-xl">
                    <Shield size={20} style={{ color: 'var(--accent-purple)' }} />
                    <h4 style={{ fontSize: 'var(--font-base)' }}>{t('settings.profileInfo')}</h4>
                </div>

                <div className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">{t('settings.fullName')}</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('settings.email')}</label>
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
                    <h4 style={{ fontSize: 'var(--font-base)' }}>{t('settings.preferences')}</h4>
                </div>

                <div className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">{t('settings.defaultCurrency')}</label>
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

                    {/* Language Selector */}
                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <Languages size={18} style={{ color: 'var(--accent-purple)' }} />
                            <div>
                                <div className="text-sm font-medium">{t('settings.language')}</div>
                                <div className="text-xs text-muted">{t('settings.languageDesc')}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                            <button
                                onClick={() => changeLanguage('tr')}
                                style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: i18n.language === 'tr' ? 700 : 500,
                                    background: i18n.language === 'tr' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                                    color: i18n.language === 'tr' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                🇹🇷 {t('common.turkish')}
                            </button>
                            <button
                                onClick={() => changeLanguage('en')}
                                style={{
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: i18n.language === 'en' ? 700 : 500,
                                    background: i18n.language === 'en' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                                    color: i18n.language === 'en' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                🇬🇧 {t('common.english')}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <Bell size={18} style={{ color: 'var(--accent-amber)' }} />
                            <div>
                                <div className="text-sm font-medium">{t('settings.reminderNotifications')}</div>
                                <div className="text-xs text-muted">{t('settings.reminderNotificationsDesc')}</div>
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
                                <div className="text-sm font-medium">{t('settings.darkTheme')}</div>
                                <div className="text-xs text-muted">{t('settings.darkThemeDesc')}</div>
                            </div>
                        </div>
                        <div className="toggle active" />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-md">
                <button className="btn btn-primary btn-lg" onClick={handleSave} style={{ flex: 1 }}>
                    <Save size={16} /> {t('settings.save')}
                </button>
                <button className="btn btn-danger btn-lg" onClick={handleReset}>
                    <RotateCcw size={16} /> {t('settings.reset')}
                </button>
            </div>

            {/* App Info */}
            <div className="text-center mt-xl" style={{ opacity: 0.4 }}>
                <p className="text-xs">{t('settings.appInfo')}</p>
                <p className="text-xs mt-xs">Made with 💜 for better financial harmony</p>
            </div>
        </div>
    );
}
