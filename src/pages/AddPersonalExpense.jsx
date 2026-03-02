import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Wallet, Save } from 'lucide-react';
import { generateId } from '../utils/helpers';

const PERSONAL_CATEGORIES = ['Market', 'Fatura', 'Eğitim', 'Eğlence', 'Ulaşım', 'Diğer'];

export default function AddPersonalExpense() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Market');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !title.trim()) return;

        setSaving(true);

        const expense = {
            id: generateId(),
            amount: parseFloat(amount),
            title: title.trim(),
            category,
            date: new Date(date).toISOString(),
            userId: state.currentUser,
        };

        await dispatch({ type: 'ADD_PERSONAL_EXPENSE', payload: expense });
        setSaving(false);
        navigate('/wallet');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="page-header">
                <div className="flex items-center gap-md">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2>Bireysel Harcama Ekle</h2>
                        <p className="page-subtitle">Kişisel masrafınızı kaydedin</p>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-xl) var(--space-2xl)' }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                    {/* Amount */}
                    <div className="form-group">
                        <label className="form-label">Tutar (₺)</label>
                        <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            autoFocus
                            style={{ fontSize: 'var(--font-xl)', fontWeight: 700, textAlign: 'center' }}
                        />
                    </div>

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Başlık</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Örn: Market alışverişi"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Kategori</label>
                        <select
                            className="form-select"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {PERSONAL_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Tarih</label>
                        <input
                            className="form-input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={saving || !amount || !title.trim()}
                    >
                        {saving ? (
                            <span className="flex items-center gap-sm">
                                <span className="animate-pulse">Kaydediliyor...</span>
                            </span>
                        ) : (
                            <>
                                <Save size={18} /> Harcamayı Kaydet
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
