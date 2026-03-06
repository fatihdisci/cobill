import React, { useState } from 'react';
import { CalendarClock, X, CopyMinus, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { addOneMonthSafely } from '../utils/recurringUtils';
import { formatCurrency } from '../utils/currencyUtils';

export default function RecurringPromptModal({ pendingExpenses, onClose }) {
    const { t } = useTranslation();
    const { dispatch } = useApp();
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Combine group and personal expenses, but process them according to their type
    const handleSkip = async () => {
        setIsSaving(true);
        try {
            await Promise.all(pendingExpenses.map(async (expense) => {
                const nextDate = addOneMonthSafely(expense.nextRecurringDate);
                const updatedExpense = { ...expense, nextRecurringDate: nextDate };

                if (expense.userId) { // Personal expense
                    await dispatch({ type: 'UPDATE_PERSONAL_EXPENSE', payload: updatedExpense });
                } else if (expense.groupId) { // Group expense
                    await dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
                }
            }));

            setSuccess(true);
            setTimeout(onClose, 1500);
        } catch (error) {
            console.error("Skip failed", error);
            setIsSaving(false);
        }
    };

    const handleAdd = async () => {
        setIsSaving(true);
        try {
            await Promise.all(pendingExpenses.map(async (expense) => {
                // 1. Update the original template's next date
                const nextDate = addOneMonthSafely(expense.nextRecurringDate);
                const updatedExpense = { ...expense, nextRecurringDate: nextDate };

                // 2. Create the new clone to be inserted today
                const { id, nextRecurringDate: _removed, ...cloneData } = expense;

                // Set the duplicate's properties
                // They should be registered as today/the specific recurring date:
                const clone = {
                    ...cloneData,
                    id: crypto.randomUUID ? crypto.randomUUID() : `rect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    date: expense.nextRecurringDate + "T12:00:00.000Z", // Append fake time just to ensure correct ISO parse
                    isRecurring: false,
                };

                if (expense.userId) {
                    await dispatch({ type: 'UPDATE_PERSONAL_EXPENSE', payload: updatedExpense });
                    await dispatch({ type: 'ADD_PERSONAL_EXPENSE', payload: clone });
                } else if (expense.groupId) {
                    await dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
                    await dispatch({ type: 'ADD_EXPENSE', payload: clone });
                }
            }));

            setSuccess(true);
            setTimeout(onClose, 1500);
        } catch (error) {
            console.error("Add failed", error);
            setIsSaving(false);
        }
    };

    if (success) {
        return (
            <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
                <div className="modal-content text-center flex flex-col items-center justify-center gap-md" style={{ maxWidth: 360, padding: 'var(--space-3xl) var(--space-xl)' }}>
                    <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)' }} className="animate-fade-in-up" />
                    <h3 className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>{t('dashboard.successfullyCompleted')}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
                <div className="modal-header mb-md">
                    <h3 className="flex items-center gap-xs" style={{ color: 'var(--accent-amber)' }}>
                        <CalendarClock size={20} />
                        {t('dashboard.recurring.title')}
                    </h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} disabled={isSaving}>
                        <X size={18} />
                    </button>
                </div>

                <p className="text-sm text-secondary mb-xl">
                    {t('dashboard.recurring.desc')}
                </p>

                <div className="flex flex-col gap-sm mb-2xl" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    {pendingExpenses.map(e => (
                        <div key={e.id} className="glass-card flex items-center justify-between" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{e.title || e.description}</span>
                                <span className="text-xs text-muted">{e.category} {e.groupId ? t('dashboard.recurring.group') : t('dashboard.recurring.personal')}</span>
                            </div>
                            <div className="font-bold">
                                {formatCurrency(e.amount, e.currency || 'TRY')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-md mt-auto">
                    <button
                        className="btn btn-secondary flex-1"
                        onClick={handleSkip}
                        disabled={isSaving}
                    >
                        {t('dashboard.recurring.skipMonth')}
                    </button>
                    <button
                        className="btn btn-primary flex-1"
                        onClick={handleAdd}
                        disabled={isSaving}
                    >
                        {isSaving ? t('dashboard.waiting') : t('dashboard.recurring.addNow')}
                    </button>
                </div>
            </div>
        </div>
    );
}
