import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { dbService } from '../utils/dbService';
import { LogIn } from 'lucide-react';
import splashScreenImg from '../../assets/splash.png';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                await signOut(auth);
                const error = new Error(t('auth.emailNotVerified'));
                error.code = 'custom/email-not-verified';
                throw error;
            }

            navigate('/wallet');
        } catch (err) {
            console.error('Login error:', err);
            if (err.code === 'custom/email-not-verified') {
                setError(t('auth.errorVerficationLink'));
            } else {
                setError(t('auth.loginFailed'));
            }
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
                        style={{ width: 250, height: 250, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                    />
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{t('auth.loginTitle')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {t('auth.loginSubtitle')}
                    </p>
                </div>

                {error && (
                    <div className="mb-lg p-md" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-md">
                    <div className="form-group">
                        <label>{t('auth.emailLabel')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('auth.emailPlaceholderLogin')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="flex justify-between items-center mb-xs">
                            <label style={{ marginBottom: 0 }}>{t('auth.passwordLabel')}</label>
                            <Link to="/forgot-password" style={{ fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                                {t('auth.forgotPasswordLink')}
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
                        {loading ? t('auth.loggingIn') : <><LogIn size={20} /> {t('auth.loginButton')}</>}
                    </button>
                </form>

                <div className="text-center mt-xl pt-lg" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {t('auth.noAccount')}{' '}
                        <Link to="/register" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>
                            {t('auth.registerNow')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
