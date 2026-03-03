import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, CalendarClock, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateId, CATEGORIES } from '../utils/helpers';
import { getSupportedCurrencies } from '../utils/currencyUtils';
import { showInterstitialAd } from '../utils/adService';
import { addOneMonthSafely } from '../utils/recurringUtils';

export default function ExpenseForm({ groupId, onClose }) {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const currencies = getSupportedCurrencies();

    const group = groupId ? state.groups.find(g => g.id === groupId) : null;

    const [form, setForm] = useState({
        groupId: groupId || (state.groups[0]?.id || ''),
        description: '',
        amount: '',
        currency: group?.currency || state.settings.defaultCurrency || 'TRY',
        paidBy: state.currentUser,
        splitType: 'equal',
        splitAmong: group?.members || [],
        splitAmong: group?.members || [],
        category: 'other',
        isRecurring: false,
    });

    const selectedGroup = state.groups.find(g => g.id === form.groupId);
    const groupMembers = selectedGroup
        ? selectedGroup.members.map(id => state.members[id]).filter(Boolean)
        : [];

    const isPro = state.members[state.currentUser]?.isPro;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.description || !form.amount || !form.groupId) return;
        const nowIso = new Date().toISOString();
        const expenseDateStr = nowIso.split('T')[0];
        const nextRecurringDate = form.isRecurring ? addOneMonthSafely(expenseDateStr) : null;

        const expense = {
            id: generateId(),
            groupId: form.groupId,
            description: form.description,
            amount: parseFloat(form.amount),
            currency: form.currency,
            paidBy: form.paidBy,
            splitAmong: form.splitAmong,
            splitType: form.splitType,
            category: form.category,
            date: nowIso,
            isRecurring: form.isRecurring,
            nextRecurringDate: nextRecurringDate,
        };

        dispatch({ type: 'ADD_EXPENSE', payload: expense });

        const finishNavigation = () => {
            if (onClose) {
                onClose();
            } else {
                navigate(`/group/${form.groupId}`);
            }
        };

        if (!isPro) {
            showInterstitialAd().then(finishNavigation);
        } else {
            finishNavigation();
        }
    };

    const handleGroupChange = (newGroupId) => {
        const g = state.groups.find(g => g.id === newGroupId);
        setForm(prev => ({
            ...prev,
            groupId: newGroupId,
            splitAmong: g?.members || [],
            currency: g?.currency || prev.currency,
        }));
    };

    const toggleMemberSplit = (memberId) => {
        setForm(prev => ({
            ...prev,
            splitAmong: prev.splitAmong.includes(memberId)
                ? prev.splitAmong.filter(id => id !== memberId)
                : [...prev.splitAmong, memberId],
        }));
    };

    const perPerson = form.amount && form.splitAmong.length > 0
        ? (parseFloat(form.amount) / form.splitAmong.length)
        : 0;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
            {/* Amount Input - Big style */}
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                <label className="form-label" style={{ marginBottom: 'var(--space-md)', display: 'block' }}>
                    Tutar
                </label>
                <div className="flex items-center justify-center gap-md">
                    <select
                        className="form-select"
                        value={form.currency}
                        onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                        style={{ width: '90px', textAlign: 'center' }}
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
                {perPerson > 0 && (
                    <div className="text-sm text-muted mt-md animate-fade-in">
                        Kişi başı: <strong style={{ color: 'var(--accent-cyan-light)' }}>
                            {perPerson.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {form.currency}
                        </strong>
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="form-group">
                <label className="form-label">Açıklama</label>
                <input
                    className="form-input"
                    placeholder="Örn: Öğle yemeği, Taksi, Fatura..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                />
            </div>

            {/* Group Select (if not pre-selected) */}
            {!groupId && (
                <div className="form-group">
                    <label className="form-label">Grup</label>
                    <select
                        className="form-select"
                        value={form.groupId}
                        onChange={e => handleGroupChange(e.target.value)}
                        required
                    >
                        <option value="">Grup Seçin</option>
                        {state.groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Paid By */}
            <div className="form-group">
                <label className="form-label">Ödeyen</label>
                <select
                    className="form-select"
                    value={form.paidBy}
                    onChange={e => setForm(prev => ({ ...prev, paidBy: e.target.value }))}
                >
                    {groupMembers.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.name} {m.isGhost ? '(👻)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category */}
            <div className="form-group">
                <label className="form-label">Kategori</label>
                <div className="flex flex-wrap gap-sm">
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
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

            {/* Split Among */}
            <div className="form-group">
                <label className="form-label">Paylaşılanlar</label>
                <div className="flex flex-col gap-sm">
                    {groupMembers.map(m => (
                        <label
                            key={m.id}
                            className="flex items-center gap-md"
                            style={{
                                padding: 'var(--space-md)',
                                background: form.splitAmong.includes(m.id) ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                border: `1px solid ${form.splitAmong.includes(m.id) ? 'var(--accent-purple)' : 'var(--border-primary)'}`,
                                transition: 'all var(--transition-fast)',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={form.splitAmong.includes(m.id)}
                                onChange={() => toggleMemberSplit(m.id)}
                                style={{ display: 'none' }}
                            />
                            <div style={{
                                width: 20, height: 20,
                                borderRadius: 'var(--radius-sm)',
                                background: form.splitAmong.includes(m.id) ? 'var(--gradient-primary)' : 'var(--bg-glass)',
                                border: form.splitAmong.includes(m.id) ? 'none' : '1px solid var(--border-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {form.splitAmong.includes(m.id) && <Check size={12} color="white" />}
                            </div>
                            <span className="text-sm font-medium">{m.name}</span>
                            {m.isGhost && <span className="badge badge-ghost" style={{ fontSize: '0.6rem' }}>👻</span>}
                        </label>
                    ))}
                </div>
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between" style={{
                padding: 'var(--space-lg)',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
            }}>
                <div className="flex items-center gap-sm">
                    <CalendarClock size={18} style={{ color: 'var(--accent-amber)' }} />
                    <div>
                        <div className="text-sm font-medium">Tekrarlayan Masraf</div>
                        <div className="text-xs text-muted">Aylık olarak otomatik hatırlatılır</div>
                    </div>
                </div>
                <div
                    className={`toggle ${form.isRecurring ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                />
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={!form.amount || !form.description}>
                <Receipt size={18} /> Masrafı Kaydet
            </button>
        </form>
    );
}
