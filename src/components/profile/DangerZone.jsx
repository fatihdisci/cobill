import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DangerZone({ onLogout, onDeleteAccount }) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-xl mt-xl">
            {/* Logout Button */}
            <button
                className="btn btn-ghost w-full stagger-3 hover:bg-rose-500/10"
                onClick={onLogout}
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

            {/* Delete Account Area */}
            <div style={{ marginTop: 'var(--space-md)' }}>
                <button
                    className="btn w-full"
                    onClick={onDeleteAccount}
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
        </div>
    );
}
