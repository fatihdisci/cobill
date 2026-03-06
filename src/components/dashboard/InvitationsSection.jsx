import React from 'react';
import { MailCheck, UserCheck, X } from 'lucide-react';

export default function InvitationsSection({ invitations, dispatch, t }) {
    if (!invitations || invitations.length === 0) return null;

    return (
        <div className="glass-card mb-xl animate-fade-in-up" style={{ border: '1px solid rgba(245, 158, 11, 0.3)', background: 'var(--bg-card)' }}>
            <h4 className="flex items-center gap-sm mb-lg" style={{ color: 'var(--accent-amber-light)' }}>
                <MailCheck size={18} /> {t('dashboard.pendingInvitations')}
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>{invitations.length}</span>
            </h4>
            <div className="flex flex-col gap-md">
                {invitations.map(inv => (
                    <div key={inv.id} className="flex items-center gap-md" style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div className="text-sm font-semibold">
                                <strong>{inv.invitedByName || t('common.user')}</strong> {t('dashboard.invitedBy')} <strong>"{inv.groupName}"</strong>.
                            </div>
                            <div className="text-xs text-muted mt-xs">
                                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('tr-TR') : ''}
                            </div>
                        </div>
                        <div className="flex gap-sm">
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => dispatch({
                                    type: 'ACCEPT_INVITATION',
                                    payload: { invitationId: inv.id, invitation: inv }
                                })}
                            >
                                <UserCheck size={14} /> {t('dashboard.accept')}
                            </button>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => dispatch({ type: 'REJECT_INVITATION', payload: inv.id })}
                                style={{ color: 'var(--accent-rose)' }}
                            >
                                <X size={14} /> {t('dashboard.reject')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
