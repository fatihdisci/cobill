import React, { useState } from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { addOneMonthSafely } from '../utils/recurringUtils';

export default function WelcomeProModal({ selectedPlan, onClose }) {
    const { t } = useTranslation();
    const { state, dispatch } = useApp();
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const priceMap = {
        'ad-free': 349,
        'pro-yearly': 699,
        'pro-monthly': 89
    };

    const handleAutoTrack = async () => {
        setIsSaving(true);
        try {
            const amount = priceMap[selectedPlan] || 89;
            const now = new Date();

            const dateString = now.toISOString().split('T')[0];
            const nextDate = addOneMonthSafely(dateString);

            // The user explicitly wanted it automatically tracked "her ay", so isRecurring is true.
            const newExpense = {
                id: crypto.randomUUID ? crypto.randomUUID() : `rect-${now.getTime()}`,
                userId: state.currentUser,
                title: t('dashboard.pro.subscriptionName'),
                amount: amount.toString(),
                currency: "TRY",
                category: "Abonelik/Yazılım",
                date: now.toISOString(),
                isRecurring: true,
                nextRecurringDate: nextDate,
                createdAt: now.toISOString()
            };

            // Setup recurring tracking
            await dispatch({ type: 'ADD_PERSONAL_EXPENSE', payload: newExpense });

            // Set User to Pro
            await dispatch({
                type: 'UPDATE_MEMBER',
                payload: { id: state.currentUser, isPro: true }
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Auto track failed", error);
            setIsSaving(false);
        }
    };

    const handleSkip = async () => {
        setIsSaving(true);
        try {
            await dispatch({
                type: 'UPDATE_MEMBER',
                payload: { id: state.currentUser, isPro: true }
            });
            onClose();
        } catch (error) {
            console.error("Set Pro failed", error);
            setIsSaving(false);
        }
    };

    if (success) {
        return (
            <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
                <div className="modal-content text-center flex flex-col items-center justify-center gap-md" style={{ maxWidth: 360, padding: 'var(--space-3xl) var(--space-xl)' }}>
                    <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)' }} className="animate-fade-in-up" />
                    <h3 className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>{t('dashboard.welcomePro')}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="modal-header mb-md">
                    <h3 className="flex items-center gap-xs" style={{ color: 'var(--accent-amber)' }}>
                        <Sparkles size={20} />
                        {t('dashboard.pro.welcome')}
                    </h3>
                    <button className="btn btn-ghost btn-icon" onClick={handleSkip} disabled={isSaving}>
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-secondary mb-xl">
                    {t('dashboard.pro.autoTrackDesc')}
                </p>

                <div className="flex gap-md mt-auto">
                    <button
                        className="btn btn-secondary flex-1"
                        onClick={handleSkip}
                        disabled={isSaving}
                    >
                        {t('dashboard.pro.noThanks')}
                    </button>
                    <button
                        className="btn btn-primary flex-1"
                        onClick={handleAutoTrack}
                        disabled={isSaving}
                    >
                        {isSaving ? t('dashboard.pro.saving') : t('dashboard.pro.yesAutoTrack')}
                    </button>
                </div>
            </div>
        </div>
    );
}
