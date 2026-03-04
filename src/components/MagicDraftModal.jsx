import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, Loader2, Users, User, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseMagicDraft, AI_CATEGORIES } from '../services/aiService';
import { generateId } from '../utils/helpers';
import { useTranslation } from 'react-i18next';

const CATEGORY_ICONS = {
    'Market': '🛒',
    'Fatura': '📋',
    'Eğitim': '📚',
    'Eğlence': '🎬',
    'Ulaşım': '🚕',
    'Diğer': '📦',
};

export default function MagicDraftModal({ onClose }) {
    const { state, dispatch } = useApp();
    const { t } = useTranslation();

    const [inputText, setInputText] = useState('');
    const [drafts, setDrafts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [savingId, setSavingId] = useState(null);

    // Ayrıştır butonu
    const handleParse = async () => {
        if (!inputText.trim() || isLoading) return;
        setError('');
        setIsLoading(true);

        try {
            const results = await parseMagicDraft(inputText.trim());
            if (!results || results.length === 0) {
                setError(t('magicDraft.noResults'));
                setIsLoading(false);
                return;
            }
            // Her sonuç için düzenlenebilir taslak oluştur
            const newDrafts = results.map(item => ({
                _draftId: generateId(),
                amount: item.amount,
                title: item.title,
                category: item.category,
                date: item.date,
                currency: state.settings?.defaultCurrency || 'TRY',
                expenseType: 'personal', // 'personal' | 'group'
                groupId: '',
                paidBy: state.currentUser,
                saved: false,
            }));
            setDrafts(prev => [...prev, ...newDrafts]);
        } catch (err) {
            setError(err.message || t('magicDraft.parseError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Taslak alanını güncelle
    const updateDraft = (draftId, field, value) => {
        setDrafts(prev => prev.map(d =>
            d._draftId === draftId ? { ...d, [field]: value } : d
        ));
    };

    // Grup değiştiğinde paidBy ve splitAmong güncelle
    const handleGroupChange = (draftId, groupId) => {
        const group = state.groups.find(g => g.id === groupId);
        setDrafts(prev => prev.map(d =>
            d._draftId === draftId
                ? {
                    ...d,
                    groupId,
                    paidBy: group?.members?.includes(state.currentUser) ? state.currentUser : (group?.members?.[0] || state.currentUser),
                }
                : d
        ));
    };

    // Kaydet
    const handleSave = async (draft) => {
        if (savingId) return;

        // Validation: grup masrafıysa grup seçilmiş olmalı
        if (draft.expenseType === 'group' && !draft.groupId) {
            setError(t('magicDraft.selectGroupFirst'));
            return;
        }

        setSavingId(draft._draftId);
        setError('');

        try {
            if (draft.expenseType === 'personal') {
                const personalExpense = {
                    id: generateId(),
                    amount: parseFloat(draft.amount),
                    currency: draft.currency,
                    title: draft.title,
                    category: draft.category,
                    date: new Date(draft.date).toISOString(),
                    userId: state.currentUser,
                    isRecurring: false,
                    nextRecurringDate: null,
                };
                await dispatch({ type: 'ADD_PERSONAL_EXPENSE', payload: personalExpense });
            } else {
                // Grup masrafı
                const group = state.groups.find(g => g.id === draft.groupId);
                const expense = {
                    id: generateId(),
                    groupId: draft.groupId,
                    description: draft.title,
                    amount: parseFloat(draft.amount),
                    currency: draft.currency,
                    paidBy: draft.paidBy,
                    splitAmong: group?.members || [],
                    splitType: 'equal',
                    category: draft.category.toLowerCase() === 'market' ? 'shopping' :
                        draft.category.toLowerCase() === 'fatura' ? 'bills' :
                            draft.category.toLowerCase() === 'eğlence' ? 'entertainment' :
                                draft.category.toLowerCase() === 'ulaşım' ? 'transport' :
                                    'other',
                    date: new Date(draft.date).toISOString(),
                    isRecurring: false,
                    nextRecurringDate: null,
                };
                await dispatch({ type: 'ADD_EXPENSE', payload: expense });
            }

            // Kartı başarılı olarak işaretle, kısa süre sonra kaldır
            setDrafts(prev => prev.map(d =>
                d._draftId === draft._draftId ? { ...d, saved: true } : d
            ));
            setTimeout(() => {
                setDrafts(prev => prev.filter(d => d._draftId !== draft._draftId));
            }, 600);
        } catch (err) {
            setError(err.message || t('magicDraft.saveError'));
        } finally {
            setSavingId(null);
        }
    };

    const activeDrafts = drafts.filter(d => !d.saved);

    return (
        <div className="magic-draft-overlay" onClick={onClose}>
            <motion.div
                className="magic-draft-sheet"
                onClick={e => e.stopPropagation()}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
                {/* Header */}
                <div className="magic-draft-header">
                    <div className="flex items-center gap-sm">
                        <Sparkles size={20} style={{ color: 'var(--accent-amber)' }} />
                        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                            {t('magicDraft.title')}
                        </h3>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ minHeight: 36, width: 36, height: 36 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
                    <div style={{
                        width: 40, height: 4,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--border-secondary)',
                    }} />
                </div>

                {/* Input Area */}
                <div className="magic-draft-input-area">
                    <textarea
                        className="form-textarea magic-draft-textarea"
                        placeholder={t('magicDraft.placeholder')}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        rows={3}
                    />
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleParse}
                        disabled={!inputText.trim() || isLoading}
                        style={{ borderRadius: 'var(--radius-md)' }}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-sm">
                                <Loader2 size={18} className="magic-draft-spinner" />
                                {t('magicDraft.parsing')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-sm">
                                <Sparkles size={18} />
                                {t('magicDraft.parseButton')}
                            </span>
                        )}
                    </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="magic-draft-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="magic-draft-skeletons">
                        {[1, 2].map(i => (
                            <div key={i} className="magic-draft-skeleton-card">
                                <div className="skeleton-line skeleton-line-sm" />
                                <div className="skeleton-line skeleton-line-lg" />
                                <div className="skeleton-line skeleton-line-md" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Draft Cards */}
                <AnimatePresence>
                    {activeDrafts.length > 0 && (
                        <motion.div
                            className="magic-draft-cards"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-xs font-semibold text-muted" style={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 'var(--space-sm)',
                            }}>
                                {t('magicDraft.parsedExpenses')} ({activeDrafts.length})
                            </div>

                            {activeDrafts.map(draft => (
                                <DraftCard
                                    key={draft._draftId}
                                    draft={draft}
                                    state={state}
                                    t={t}
                                    onUpdate={updateDraft}
                                    onGroupChange={handleGroupChange}
                                    onSave={handleSave}
                                    isSaving={savingId === draft._draftId}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

// ─── Draft Card Sub-component ───
function DraftCard({ draft, state, t, onUpdate, onGroupChange, onSave, isSaving }) {

    const selectedGroup = state.groups.find(g => g.id === draft.groupId);
    const groupMembers = selectedGroup
        ? selectedGroup.members.map(id => state.members[id]).filter(Boolean)
        : [];

    const isGroupValid = draft.expenseType !== 'group' || draft.groupId;

    return (
        <motion.div
            className={`magic-draft-card ${draft.saved ? 'saved' : ''}`}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: draft.saved ? 0 : 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            {/* Tutar + Başlık */}
            <div className="flex gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ flex: '0 0 100px' }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 2 }}>
                        {t('magicDraft.amount')}
                    </label>
                    <input
                        type="number"
                        className="form-input"
                        value={draft.amount}
                        onChange={e => onUpdate(draft._draftId, 'amount', e.target.value)}
                        min="0"
                        step="0.01"
                        style={{
                            fontWeight: 700,
                            fontSize: 'var(--font-md)',
                            padding: 'var(--space-sm)',
                            minHeight: 40,
                        }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 2 }}>
                        {t('magicDraft.expenseTitle')}
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        value={draft.title}
                        onChange={e => onUpdate(draft._draftId, 'title', e.target.value)}
                        style={{ padding: 'var(--space-sm)', minHeight: 40 }}
                    />
                </div>
            </div>

            {/* Kategori Chips */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 4 }}>
                    {t('magicDraft.category')}
                </label>
                <div className="flex flex-wrap gap-xs">
                    {AI_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`btn btn-sm ${draft.category === cat ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => onUpdate(draft._draftId, 'category', cat)}
                            style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 30 }}
                        >
                            {CATEGORY_ICONS[cat]} {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tarih */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 2 }}>
                    {t('magicDraft.date')}
                </label>
                <input
                    type="date"
                    className="form-input"
                    value={draft.date}
                    onChange={e => onUpdate(draft._draftId, 'date', e.target.value)}
                    style={{ padding: 'var(--space-sm)', minHeight: 40 }}
                />
            </div>

            {/* Masraf Tipi Toggle */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 4 }}>
                    {t('magicDraft.expenseType')}
                </label>
                <div className="flex gap-sm">
                    <button
                        type="button"
                        className={`btn btn-sm flex items-center gap-xs ${draft.expenseType === 'personal' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => onUpdate(draft._draftId, 'expenseType', 'personal')}
                        style={{ flex: 1, minHeight: 38 }}
                    >
                        <User size={14} /> {t('magicDraft.personal')}
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm flex items-center gap-xs ${draft.expenseType === 'group' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => onUpdate(draft._draftId, 'expenseType', 'group')}
                        style={{ flex: 1, minHeight: 38 }}
                    >
                        <Users size={14} /> {t('magicDraft.group')}
                    </button>
                </div>
            </div>

            {/* Grup seçimi (sadece Grup seçiliyken) */}
            <AnimatePresence>
                {draft.expenseType === 'group' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: 'var(--space-md)' }}
                    >
                        <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 4 }}>
                            {t('magicDraft.selectGroup')}
                        </label>
                        <select
                            className="form-select"
                            value={draft.groupId}
                            onChange={e => {
                                onGroupChange(draft._draftId, e.target.value);
                            }}
                            style={{
                                minHeight: 40,
                                padding: 'var(--space-sm) var(--space-md)',
                                border: !draft.groupId ? '1px solid var(--accent-amber)' : '1px solid var(--border-primary)',
                            }}
                        >
                            <option value="">{t('magicDraft.chooseGroup')}</option>
                            {state.groups.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.name} ({g.members.length} {t('magicDraft.members')})
                                </option>
                            ))}
                        </select>

                        {/* Kim Ödedi — sadece grup seçildiyse */}
                        {draft.groupId && groupMembers.length > 0 && (
                            <div style={{ marginTop: 'var(--space-sm)' }}>
                                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: 4 }}>
                                    {t('magicDraft.paidBy')}
                                </label>
                                <select
                                    className="form-select"
                                    value={draft.paidBy}
                                    onChange={e => onUpdate(draft._draftId, 'paidBy', e.target.value)}
                                    style={{ minHeight: 40, padding: 'var(--space-sm) var(--space-md)' }}
                                >
                                    {groupMembers.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.isGhost ? '(👻)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Onayla Butonu */}
            <button
                className="btn btn-success w-full"
                onClick={() => onSave(draft)}
                disabled={isSaving || !draft.amount || !draft.title.trim() || !isGroupValid}
                style={{ borderRadius: 'var(--radius-md)', minHeight: 42 }}
            >
                {isSaving ? (
                    <span className="flex items-center gap-sm">
                        <Loader2 size={16} className="magic-draft-spinner" />
                        {t('magicDraft.saving')}
                    </span>
                ) : (
                    <span className="flex items-center gap-sm">
                        <Check size={16} />
                        {t('magicDraft.confirmSave')}
                    </span>
                )}
            </button>
        </motion.div>
    );
}
