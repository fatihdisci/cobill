import React from 'react';
import { Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SecuritySection({ expanded, onToggle, onPasswordReset, itemStyle, expandableStyle }) {
    const { t } = useTranslation();

    return (
        <>
            <div className="action-item" style={itemStyle} onClick={() => onToggle('security')}>
                <div className="flex items-center gap-md">
                    <div className="icon-box emerald"><Shield size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{t('profile.security')}</span>
                        <span className="text-xs text-muted">{t('profile.updatePasswordText')}</span>
                    </div>
                </div>
                {expanded ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
            </div>
            {expanded && (
                <div className="animate-fade-in" style={expandableStyle}>
                    <div className="flex flex-col gap-sm">
                        <p className="text-sm text-muted mb-xs">{t('profile.passwordResetDesc')}</p>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={onPasswordReset}
                        >
                            {t('profile.sendResetLinkBtn')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
