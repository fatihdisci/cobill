import React from 'react';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationSection({
    expanded, onToggle,
    pushEnabled, onPushToggle,
    emailEnabled, onEmailToggle,
    frequency, onFrequencyChange,
    itemStyle, expandableStyle, dividerStyle
}) {
    const { t } = useTranslation();

    return (
        <>
            <div className="action-item" style={itemStyle} onClick={() => onToggle('notifications')}>
                <div className="flex items-center gap-md">
                    <div className="icon-box amber"><Bell size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{t('profile.notifications')}</span>
                        <span className="text-xs text-muted">
                            {t('profile.debtReminder')} (
                            {frequency === 'daily' ? t('profile.everyDay') : frequency === 'weekly' ? t('profile.everyWeek') : t('profile.off')}
                            )
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </div>
            {expanded && (
                <div className="animate-fade-in" style={expandableStyle}>
                    <div className="flex flex-col gap-md">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t('settings.pushNotifications')}</span>
                                <span className="text-xs text-muted" style={{ maxWidth: '220px' }}>{t('settings.pushDesc')}</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={pushEnabled}
                                    onChange={onPushToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{t('settings.emailNotifications')}</span>
                                <span className="text-xs text-muted" style={{ maxWidth: '220px' }}>{t('settings.emailDesc')}</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={emailEnabled}
                                    onChange={onEmailToggle}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div style={dividerStyle} />

                        <div className="form-group">
                            <label className="form-label text-xs">{t('profile.reminderFrequency')}</label>
                            <select
                                className="form-select btn-sm"
                                value={frequency}
                                onChange={onFrequencyChange}
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
        </>
    );
}
