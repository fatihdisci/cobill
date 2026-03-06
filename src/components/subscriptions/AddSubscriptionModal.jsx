import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, Calendar, Repeat, Check } from 'lucide-react';
import { getSupportedCurrencies } from '../../utils/currencyUtils';

const calculateNextPayment = (startDateStr, cycle) => {
    const start = new Date(startDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let next = new Date(start);
    next.setHours(0, 0, 0, 0);

    // If start date is in the future, it is the next payment
    if (next >= today) return next.toISOString();

    // Advance until next payment is in the future
    if (cycle === 'monthly') {
        while (next < today) {
            next.setMonth(next.getMonth() + 1);
        }
    } else if (cycle === 'yearly') {
        while (next < today) {
            next.setFullYear(next.getFullYear() + 1);
        }
    }
    return next.toISOString();
};

export default function AddSubscriptionModal({ onClose, onSave, userId }) {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('TRY');
    const [cycle, setCycle] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const currencies = getSupportedCurrencies();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !amount || !startDate) return;

        const nextPaymentDate = calculateNextPayment(startDate, cycle);

        const newSub = {
            userId,
            title,
            amount: parseFloat(amount),
            currency,
            cycle,
            startDate: new Date(startDate).toISOString(),
            nextPaymentDate,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        onSave(newSub);
        onClose();
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
            <div className="glass-card modal-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{
                maxWidth: '480px',
                padding: 'var(--space-2xl)',
                background: 'var(--bg-primary)',
            }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onClose}
                    style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }}
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-xl">
                    <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto var(--space-md)',
                        color: 'white'
                    }}>
                        <Repeat size={24} />
                    </div>
                    <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>{t('subscriptions.addSubscription')}</h3>
                    <p className="text-sm text-muted">{t('subscriptions.noSubscriptionsDesc')}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
                    {/* Amount Input - Big Premium Style */}
                    <div className="text-center">
                        <label className="form-label" style={{ marginBottom: 'var(--space-sm)', display: 'block' }}>
                            {t('subscriptions.amount')}
                        </label>
                        <div className="flex items-center justify-center gap-sm">
                            <select
                                className="form-select"
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, fontSize: 'var(--font-lg)' }}
                            >
                                {currencies.map(c => (
                                    <option key={c.code} value={c.code}>{c.symbol}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                className="form-input"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                style={{
                                    fontSize: 'var(--font-3xl)',
                                    fontWeight: 900,
                                    textAlign: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid var(--accent-purple)',
                                    borderRadius: 0,
                                    padding: 'var(--space-xs)',
                                    width: '180px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-xs">
                            <CreditCard size={14} /> {t('subscriptions.subscriptionName')}
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Netflix, Spotify, Kira..."
                            required
                        />
                    </div>

                    {/* Cycle Selection - Premium Segment Controls */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-xs">
                            <Repeat size={14} /> {t('subscriptions.billingCycle')}
                        </label>
                        <div className="flex gap-sm p-xs" style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-primary)'
                        }}>
                            <button
                                type="button"
                                className={`btn btn-sm w-full`}
                                onClick={() => setCycle('monthly')}
                                style={{
                                    flex: 1,
                                    background: cycle === 'monthly' ? 'var(--bg-card)' : 'transparent',
                                    color: cycle === 'monthly' ? 'var(--accent-purple)' : 'var(--text-tertiary)',
                                    boxShadow: cycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
                                    border: cycle === 'monthly' ? '1px solid var(--border-secondary)' : 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: cycle === 'monthly' ? 700 : 500
                                }}
                            >
                                {t('subscriptions.monthly')}
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm w-full`}
                                onClick={() => setCycle('yearly')}
                                style={{
                                    flex: 1,
                                    background: cycle === 'yearly' ? 'var(--bg-card)' : 'transparent',
                                    color: cycle === 'yearly' ? 'var(--accent-purple)' : 'var(--text-tertiary)',
                                    boxShadow: cycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
                                    border: cycle === 'yearly' ? '1px solid var(--border-secondary)' : 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: cycle === 'yearly' ? 700 : 500
                                }}
                            >
                                {t('subscriptions.yearly')}
                            </button>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="form-group">
                        <label className="form-label flex items-center gap-xs">
                            <Calendar size={14} /> {t('subscriptions.startDate')}
                        </label>
                        <input
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-md mt-lg">
                        <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary w-full" disabled={!amount || !title}>
                            <Check size={18} /> {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
