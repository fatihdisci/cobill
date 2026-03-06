import React, { useState } from 'react';
import { Users } from 'lucide-react';

export default function NewGroupModal({ onClose, onSubmit, t, dispatch, currentUser }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('TRY');

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];
    const [color, setColor] = useState(colors[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const group = {
            id,
            name: name.trim(),
            description: description.trim(),
            currency,
            members: [currentUser],
            createdAt: new Date().toISOString(),
            color,
        };

        dispatch({ type: 'ADD_GROUP', payload: group });
        onSubmit(group);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('dashboard.newGroupModalTitle')}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                    <div className="form-group">
                        <label className="form-label">{t('dashboard.groupName')}</label>
                        <input
                            className="form-input"
                            placeholder={t('dashboard.groupNamePlaceholder')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('dashboard.description')}</label>
                        <input
                            className="form-input"
                            placeholder={t('dashboard.descriptionPlaceholder')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('dashboard.currency')}</label>
                        <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                            <option value="TRY">₺ TRY</option>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="GBP">£ GBP</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('dashboard.color')}</label>
                        <div className="flex gap-sm">
                            {colors.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: 32, height: 32, borderRadius: 'var(--radius-full)',
                                        background: c, cursor: 'pointer',
                                        border: color === c ? '3px solid white' : '3px solid transparent',
                                        transition: 'border var(--transition-fast)',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full btn-lg">
                        <Users size={16} /> {t('dashboard.createNewGroup')}
                    </button>
                </form>
            </div>
        </div>
    );
}
