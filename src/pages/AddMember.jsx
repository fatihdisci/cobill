import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils/helpers';
import { ArrowLeft, UserPlus, Mail, Phone, Lock } from 'lucide-react';

export default function AddMember() {
    const { dispatch } = useApp();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        iban: ''
    });

    const formatIBAN = (value) => {
        // Only alphanumeric, uppercase
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        // Limit to 26 characters (standard TR IBAN length without spaces is 26)
        const limited = cleaned.slice(0, 26);
        // Space every 4
        return limited.match(/.{1,4}/g)?.join(' ') || limited;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'iban') {
            setFormData(prev => ({ ...prev, [name]: formatIBAN(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const newMember = {
            id: 'm' + generateId(),
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            iban: formData.iban.trim(),
            isGhost: false
        };

        dispatch({ type: 'ADD_MEMBER', payload: newMember });
        navigate(-1);
    };

    return (
        <div className="page-content animate-fade-in">
            <div className="page-header">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="animate-slide-right">Yeni Üye Ekle</h2>
                    <p className="page-subtitle">Gruba eklemek üzere yeni bir profil oluşturun</p>
                </div>
            </div>

            <div className="glass-card stagger-1" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
                    <div className="form-group">
                        <label className="form-label">Ad Soyad *</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Örn: Ahmet Yılmaz"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="ahmet@example.com"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Telefon</label>
                        <div className="relative">
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="05XX XXX XX XX"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ minWidth: 0 }}>
                        <label className="form-label">IBAN Bilgisi</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                style={{ fontFamily: 'monospace' }}
                            />
                        </div>
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-xs)' }}>
                            Para transferleri için IBAN bilgisi kaydedebilirsiniz.
                        </p>
                    </div>

                    <div className="flex justify-between items-center gap-lg flex-wrap" style={{ marginTop: 'var(--space-lg)' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary flex-1">
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={!formData.name.trim()}
                        >
                            <UserPlus size={18} />
                            Üyeyi Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
