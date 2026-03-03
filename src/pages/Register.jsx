import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, MailCheck } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create user document in Firestore 'users' collection
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                name: name,
                email: email,
                phone: '',
                iban: '',
                isPro: false,
                isGhost: false,
                createdAt: new Date().toISOString()
            });

            // 3. Send email verification
            await sendEmailVerification(user);

            // 4. Sign out the user immediately so they must verify and log in
            await signOut(auth);

            setSuccess(true);
        } catch (err) {
            console.error('Registration error:', err);
            let message = t('auth.registerFailed');

            if (err.code === 'auth/email-already-in-use') {
                message = t('auth.emailInUse');
            } else if (err.code === 'auth/invalid-email') {
                message = t('auth.invalidEmail');
            } else if (err.code === 'auth/weak-password') {
                message = t('auth.weakPassword');
            } else if (err.code === 'auth/network-request-failed') {
                message = t('auth.networkError');
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-lg">
            <div className="glass-card w-full" style={{ maxWidth: 420, padding: 'var(--space-2xl)' }}>
                {success ? (
                    <div className="flex flex-col items-center text-center">
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-lg)',
                            color: 'var(--accent-emerald)'
                        }}>
                            <MailCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>{t('auth.emailSentTitle')}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 'var(--space-xl)', lineHeight: 1.5 }}>
                            <Trans i18nKey="auth.emailSentDesc" values={{ email: email }} />
                        </p>
                        <Link to="/login" className="btn btn-primary w-full flex justify-center" style={{ padding: '12px' }}>
                            {t('auth.backToLogin')}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center mb-xl">
                            <img
                                src="/icon.png"
                                alt="CoBill Logo"
                                style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                            />
                            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{t('auth.registerTitle')}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                                {t('auth.registerSubtitle')}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-lg p-md" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="flex flex-col gap-md">
                            <div className="form-group">
                                <label>{t('auth.fullNameLabel')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder={t('auth.fullNamePlaceholder')}
                                    required
                                />
                            </div>
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
                            <div className="form-group">
                                <label>{t('auth.passwordLabel')}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={t('auth.passwordPlaceholder')}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-lg flex items-center justify-center gap-sm"
                                style={{ background: 'var(--gradient-primary)', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
                                disabled={loading}
                            >
                                {loading ? t('auth.registering') : <><UserPlus size={20} /> {t('auth.registerButton')}</>}
                            </button>
                        </form>

                        <div className="text-center mt-xl pt-lg" style={{ borderTop: '1px solid var(--border-primary)' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {t('auth.alreadyHaveAccount')}{' '}
                                <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>
                                    {t('auth.loginButton')}
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
