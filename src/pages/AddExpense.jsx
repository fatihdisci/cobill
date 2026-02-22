import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';

export default function AddExpense() {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header">
                <div className="flex items-center gap-lg">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2>Masraf Ekle</h2>
                        <p className="page-subtitle">Yeni bir harcama kaydet</p>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <ExpenseForm />
            </div>
        </div>
    );
}
