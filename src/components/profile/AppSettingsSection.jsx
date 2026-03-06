import React from 'react';
import { Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AppSettingsSection({
    expanded, onToggle,
    language, onLanguageChange,
    theme, onThemeToggle,
    onSubmit,
    itemStyle, expandableStyle
}) {
    const { t } = useTranslation();

    return (
        <>
            <div className="action-item" style={itemStyle} onClick={() => onToggle('settings')}>
                <div className="flex items-center gap-md">
                    <div className="icon-box cyan"><Globe size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{t('profile.appSettings')}</span>
                        <span className="text-xs text-muted">
                            {t('profile.languageAndTheme')} (
                            <span style={{ fontFamily: 'monospace' }}>{language}</span>/
                            {theme === 'dark' ? t('profile.themeDark') : t('profile.themeLight')}
                            )
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </div>
            {expanded && (
                <div className="animate-fade-in" style={expandableStyle}>
                    <form onSubmit={onSubmit} className="flex flex-col gap-sm">
                        <div className="form-group">
                            <label className="form-label text-xs">{t('profile.languageSelection')}</label>
                            <select className="form-select btn-sm" value={language} onChange={e => onLanguageChange(e.target.value)}>
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
                                    onChange={onThemeToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm mt-xs">{t('profile.saveSettings')}</button>
                    </form>
                </div>
            )}
        </>
    );
}
