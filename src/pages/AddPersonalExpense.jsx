import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Save, CalendarClock } from 'lucide-react';
import { generateId } from '../utils/helpers';
import { getSupportedCurrencies } from '../utils/currencyUtils';
import { addOneMonthSafely } from '../utils/recurringUtils';
import { useTranslation } from 'react-i18next';

export default function AddPersonalExpense() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const currencies = getSupportedCurrencies();

    const getCategories = () => ({
        Market: { icon: '🛒', label: t('wallet.categories.market') },
        Fatura: { icon: '📋', label: t('wallet.categories.bill') },
        'Eğitim': { icon: '📚', label: t('wallet.categories.education') },
        'Eğlence': { icon: '🎬', label: t('wallet.categories.entertainment') },
        'Ulaşım': { icon: '🚕', label: t('wallet.categories.transport') },
        'Diğer': { icon: '📦', label: t('wallet.categories.other') },
    });

    const [form, setForm] = useState({
        amount: '',
        currency: state.settings?.defaultCurrency || 'TRY',
        title: '',
        category: 'Market',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.title.trim()) return;

        setSaving(true);

        const expenseDateStr = new Date(form.date).toISOString().split('T')[0];
        const nextRecurringDate = form.isRecurring ? addOneMonthSafely(expenseDateStr) : null;

        const expense = {
            id: generateId(),
            amount: parseFloat(form.amount),
            currency: form.currency,
            title: form.title.trim(),
            category: form.category,
            date: new Date(form.date).toISOString(),
            userId: state.currentUser,
            isRecurring: form.isRecurring,
            nextRecurringDate: nextRecurringDate,
        };

        await dispatch({ type: 'ADD_PERSONAL_EXPENSE', payload: expense });
        setSaving(false);
        navigate('/wallet');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header">
                <div className="flex items-center gap-lg">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2>{t('expenseForm.addPersonalExpenseTitle')}</h2>
                        <p className="page-subtitle">{t('expenseForm.addPersonalExpenseSubtitle')}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
                    {/* Amount Input - Big style (matches ExpenseForm) */}
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                        <label className="form-label" style={{ marginBottom: 'var(--space-md)', display: 'block' }}>
                            {t('expenseForm.amount')}
                        </label>
                        <div className="flex items-center justify-center gap-md">
                            <select
                                className="form-select"
                                value={form.currency}
                                onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                                style={{ minWidth: '100px', textAlign: 'center' }}
                            >
                                {currencies.map(c => (
                                    <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                                min="0"
                                step="0.01"
                                required
                                autoFocus
                                style={{
                                    fontSize: 'var(--font-2xl)',
                                    fontWeight: 800,
                                    textAlign: 'center',
                                    maxWidth: '200px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid var(--border-secondary)',
                                    borderRadius: 0,
                                    padding: 'var(--space-sm)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">{t('expenseForm.title')}</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder={t('expenseForm.titlePlaceholder')}
                            value={form.title}
                            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Category - Chip style (matches ExpenseForm) */}
                    <div className="form-group">
                        <label className="form-label">{t('expenseForm.category')}</label>
                        <div className="flex flex-wrap gap-sm">
                            {Object.entries(getCategories()).map(([key, cat]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`btn btn-sm ${form.category === key ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setForm(prev => ({ ...prev, category: key }))}
                                    style={{ fontSize: 'var(--font-sm)' }}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">{t('expenseForm.date')}</label>
                        <input
                            className="form-input"
                            type="date"
                            value={form.date}
                            onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                    </div>

                    {/* Recurring Toggle (matches ExpenseForm) */}
                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-lg)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <CalendarClock size={18} style={{ color: 'var(--accent-amber)' }} />
                            <div>
                                <div className="text-sm font-medium">{t('expenseForm.recurring')}</div>
                                <div className="text-xs text-muted">{t('expenseForm.recurringHint')}</div>
                            </div>
                        </div>
                        <div
                            className={`toggle ${form.isRecurring ? 'active' : ''}`}
                            onClick={() => setForm(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={saving || !form.amount || !form.title.trim()}
                    >
                        {saving ? (
                            <span className="animate-pulse">{t('expenseForm.saving')}</span>
                        ) : (
                            <><Save size={18} /> {t('expenseForm.saveExpense')}</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
