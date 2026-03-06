import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { Plus, Repeat } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';
import SubscriptionItem from './SubscriptionItem';
import AddSubscriptionModal from './AddSubscriptionModal';

export default function SubscriptionsDashboard() {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const subscriptions = state.subscriptions || [];

    // Calculate approximate monthly total
    const monthlyTotal = subscriptions.reduce((acc, sub) => {
        if (!sub.isActive) return acc;
        let amount = sub.amount;
        if (sub.cycle === 'yearly') amount = amount / 12;
        return acc + amount;
    }, 0);

    const handleSave = (newSub) => {
        dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSub });
    };

    const handleDelete = (id) => {
        if (window.confirm(t('subscriptions.deleteConfirm'))) {
            dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
        }
    };

    return (
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="flex items-center justify-between mb-md">
                <h3 className="section-title flex items-center gap-xs m-0">
                    <Repeat size={18} style={{ color: 'var(--accent-purple)' }} />
                    {t('subscriptions.title')}
                </h3>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsModalOpen(true)}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem' }}
                >
                    <Plus size={16} /> <span>{t('common.add', 'Ekle')}</span>
                </button>
            </div>

            <div className="glass-card static-card" style={{
                padding: 'var(--space-xl)',
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(139, 92, 246, 0.05) 100%)',
            }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                <div className="text-sm text-muted mb-xs">{t('subscriptions.monthlyTotal')}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }} className="text-gradient">
                    {formatCurrency(monthlyTotal, 'TRY')}
                </div>
            </div>

            <div className="flex flex-col gap-sm mt-md">
                {subscriptions.length > 0 ? (
                    subscriptions.map((sub, i) => (
                        <div key={sub.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                            <SubscriptionItem sub={sub} onDelete={handleDelete} />
                        </div>
                    ))
                ) : (
                    <div className="empty-state glass-card p-xl text-center">
                        <div className="empty-icon" style={{ filter: 'grayscale(1)', opacity: 0.5 }}>🔁</div>
                        <h4 className="mt-md mb-xs">{t('subscriptions.noSubscriptions')}</h4>
                        <p className="text-sm text-muted m-0">{t('subscriptions.noSubscriptionsDesc')}</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddSubscriptionModal
                    userId={state.currentUser}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
