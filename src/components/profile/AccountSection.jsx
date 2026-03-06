import React from 'react';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AccountSection({ expanded, onToggle, form, onChange, onSubmit, itemStyle, expandableStyle }) {
    const { t } = useTranslation();

    return (
        <>
            <div className="action-item" style={itemStyle} onClick={() => onToggle('account')}>
                <div className="flex items-center gap-md">
                    <div className="icon-box purple"><User size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{t('profile.accountInfo')}</span>
                        <span className="text-xs text-muted">{t('profile.emailAndPhone')}</span>
                    </div>
                </div>
                {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </div>
            {expanded && (
                <div className="animate-fade-in" style={expandableStyle}>
                    <form onSubmit={onSubmit} className="flex flex-col gap-sm">
                        <div className="form-group">
                            <label className="form-label text-xs">{t('profile.emailAddress')}</label>
                            <input
                                type="email"
                                required
                                className="form-input btn-sm"
                                value={form.email}
                                onChange={(e) => onChange('email', e.target.value)}
                                placeholder={t('profile.exampleEmail')}
                            />
                            <span className="text-xs text-muted mt-xs">{t('profile.emailChangeWarning')}</span>
                        </div>
                        <div className="form-group">
                            <label className="form-label text-xs">{t('profile.phoneNumber')}</label>
                            <input
                                type="tel"
                                className="form-input btn-sm"
                                value={form.phone}
                                onChange={(e) => onChange('phone', e.target.value)}
                                placeholder={t('profile.examplePhone')}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-sm mt-xs">{t('profile.update')}</button>
                    </form>
                </div>
            )}
        </>
    );
}
