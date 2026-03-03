import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            setStatus({ type: 'error', message: t('auth.emailRequired') });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await sendPasswordResetEmail(auth, email);
            setStatus({
                type: 'success',
                message: t('auth.resetLinkSent')
            });
            // İsteğe bağlı olarak başarılı mesajı gösterdikten sonra login'e yönlendirebiliriz.
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                setStatus({ type: 'error', message: t('auth.userNotFound') });
            } else if (error.code === 'auth/invalid-email') {
                setStatus({ type: 'error', message: t('auth.invalidEmail') });
            } else {
                setStatus({ type: 'error', message: t('auth.resetLinkError') });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-lg">
            <div className="glass-card w-full relative" style={{ maxWidth: 420, padding: 'var(--space-2xl)' }}>
                <div className="absolute top-0 left-0" style={{ padding: 'var(--space-lg)' }}>
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => navigate('/login')}
                        style={{ height: '32px', width: '32px' }}
                        title={t('auth.goBack')}
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>
                <div className="flex flex-col items-center mb-xl">
                    <img
                        src="/icon.png"
                        alt="CoBill Logo"
                        style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                    />
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{t('auth.forgotPasswordTitle')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {t('auth.forgotPasswordSubtitle')}
                    </p>
                </div>

                {status.message && (
                    <div className="mb-lg p-md animate-fade-in" style={{
                        background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: status.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        textAlign: 'center'
                    }}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="flex flex-col gap-md">
                    <div className="form-group">
                        <label>{t('auth.emailLabel')}</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('auth.emailPlaceholder')}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-lg flex items-center justify-center gap-sm"
                        style={{ background: 'var(--gradient-primary)', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                        disabled={loading || status.type === 'success'}
                    >
                        {loading ? t('auth.sending') : <><Mail size={20} /> {t('auth.sendLink')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
