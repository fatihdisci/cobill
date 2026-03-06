import React, { useState } from 'react';
import { Copy, Check, Edit2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function IbanCard({ iban, onSave, onCopy }) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [tempIban, setTempIban] = useState(iban || '');
    const [showIban, setShowIban] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);

    const formatIBAN = (value) => {
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const limited = cleaned.slice(0, 26);
        return limited.match(/.{1,4}/g)?.join(' ') || limited;
    };

    const handleCopy = () => {
        if (!iban) return;
        onCopy();
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleSave = () => {
        onSave(tempIban.trim());
        setIsEditing(false);
    };

    return (
        <div className="glass-card stagger-1">
            <div className="flex justify-between items-start mb-md">
                <span className="form-label" style={{ fontSize: 'var(--font-xs)' }}>{t('profile.ownIbanInfo')}</span>
                {!isEditing && iban && (
                    <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={handleCopy}
                        style={{ height: '32px', width: '32px' }}
                        title={t('profile.copy')}
                    >
                        {copyFeedback ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                    </button>
                )}
            </div>

            {isEditing ? (
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
                        <button className="btn btn-primary btn-sm flex-1" onClick={handleSave}>{t('common.save')}</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            setIsEditing(false);
                            setTempIban(iban || '');
                        }}>{t('common.cancel')}</button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-xs">
                        <div className="text-lg font-mono" style={{ letterSpacing: '0.05em' }}>
                            {iban ? (
                                showIban ? iban : iban.replace(/^(.{2})(.+)(.{4})$/, (_, p1, p2, p3) => `${p1}**** **** **** ${p3}`)
                            ) : (
                                <span className="text-muted italic">{t('profile.noIbanSaved')}</span>
                            )}
                        </div>
                        {iban && (
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
                            setIsEditing(true);
                            setTempIban(iban || '');
                        }}
                        style={{ height: 'auto', padding: '4px 8px' }}
                    >
                        <Edit2 size={12} style={{ marginRight: '4px' }} /> {t('common.edit')}
                    </button>
                </div>
            )}
        </div>
    );
}
