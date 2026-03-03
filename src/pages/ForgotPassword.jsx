import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Mail, ArrowLeft } from 'lucide-react';
import splashScreenImg from '../../assets/splash.png';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!email) {
            setStatus({ type: 'error', message: 'Lütfen e-posta adresinizi girin.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await sendPasswordResetEmail(auth, email);
            setStatus({
                type: 'success',
                message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.'
            });
            // İsteğe bağlı olarak başarılı mesajı gösterdikten sonra login'e yönlendirebiliriz.
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                setStatus({ type: 'error', message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' });
            } else if (error.code === 'auth/invalid-email') {
                setStatus({ type: 'error', message: 'Geçersiz bir e-posta adresi girdiniz.' });
            } else {
                setStatus({ type: 'error', message: 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu.' });
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
                        className="btn btn-ghost btn-icon"
                        onClick={() => navigate('/login')}
                        style={{ height: '48px', width: '48px', borderRadius: '50%' }}
                        title="Geri Dön"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="flex flex-col items-center mb-xl">
                    <img
                        src={splashScreenImg}
                        alt="CoBill Logo"
                        style={{ width: 250, height: 250, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                    />
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Şifremi Unuttum</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                        E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
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
                        <label>E-posta Adresi</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ornek@mail.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-lg flex items-center justify-center gap-sm"
                        style={{ background: 'var(--gradient-primary)', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                        disabled={loading || status.type === 'success'}
                    >
                        {loading ? 'Gönderiliyor...' : <><Mail size={20} /> Bağlantı Gönder</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
