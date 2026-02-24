import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { dbService } from '../utils/dbService';
import { LogIn } from 'lucide-react';
import splashScreenImg from '../../assets/splash.png';

export default function Login() {
    const [email, setEmail] = useState('test');
    const [password, setPassword] = useState('test');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if ((email.toLowerCase() === 'test' && password === 'test') || (email.toLowerCase() === 'demo' && password === 'demo')) {
            // Tamamen sahte (mock) user objesi yaratarak Firebase'i by-pass ederiz.
            // Bu event listener sadece App.jsx'teki state'i değiştiğinde devreye girer.
            // Bu local mock router işini session storage üstünden de yapabilirsek daha stabil olur.
            // Fakat React state üstünden de hacklenebilir.

            // App.jsx mock user alabilmesi için window objesine hook atıp sayfayı yeniletmek en kısasıdır
            // (Ya da onAuthStateChanged dinleyicisini ezip mocklamak gereklidir).
            const isDemo = email.toLowerCase() === 'demo';
            sessionStorage.setItem('MOCK_FIREBASE_USER', JSON.stringify({
                uid: isDemo ? 'demo-user-id' : 'test-user-id',
                email: isDemo ? 'demo@cobill.local' : 'test@cobill.local',
                displayName: isDemo ? 'Demo Kullanıcısı' : 'Test Kullanıcısı'
            }));
            window.location.reload();
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin veya "test" ile giriniz.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-lg">
            <div className="glass-card w-full" style={{ maxWidth: 420, padding: 'var(--space-2xl)' }}>
                <div className="flex flex-col items-center mb-xl">
                    <img
                        src={splashScreenImg}
                        alt="CoBill Logo"
                        style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                    />
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>CoBill'e Giriş Yapın</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                        Finansal hesaplarınızı ve gruplarınızı yönetmeye devam edin.
                    </p>
                </div>

                {error && (
                    <div className="mb-lg p-md" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-md">
                    <div className="form-group">
                        <label>E-posta Adresi</label>
                        <input
                            type="text"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ornek@mail.com veya 'test'"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="flex justify-between items-center mb-xs">
                            <label style={{ marginBottom: 0 }}>Şifre</label>
                            <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                Şifremi Unuttum?
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-lg flex items-center justify-center gap-sm"
                        style={{ background: 'var(--gradient-primary)' }}
                        disabled={loading}
                    >
                        {loading ? 'Giriş Yapılıyor...' : <><LogIn size={20} /> Giriş Yap</>}
                    </button>
                </form>

                <div className="text-center mt-xl pt-lg" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Hesabınız yok mu?{' '}
                        <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>
                            Hemen Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
