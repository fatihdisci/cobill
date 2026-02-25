import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
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

            alert('Kayıt başarılı! Lütfen gönderilen e-postadaki linke tıklayarak hesabınızı doğrulayın.');
            navigate('/login');
        } catch (err) {
            console.error('Registration error:', err);
            let message = 'Kayıt işlemi başarısız oldu.';

            if (err.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kullanımda.';
            } else if (err.code === 'auth/invalid-email') {
                message = 'Geçersiz bir e-posta adresi girdiniz.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Şifreniz çok zayıf. En az 6 karakter olmalıdır.';
            } else if (err.code === 'auth/network-request-failed') {
                message = 'İnternet bağlantınızı kontrol edin.';
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-lg">
            <div className="glass-card w-full" style={{ maxWidth: 420, padding: 'var(--space-2xl)' }}>
                <div className="flex flex-col items-center mb-xl">
                    <img
                        src="/icon.png"
                        alt="CoBill Logo"
                        style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 'var(--space-md)' }}
                    />
                    <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Yeni Hesap Oluştur</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                        CoBill'in avantajlarından yararlanmaya başlayın
                    </p>
                </div>

                {error && (
                    <div className="mb-lg p-md" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-md">
                    <div className="form-group">
                        <label>Ad Soyad</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Örn: Ayşe Yılmaz"
                            required
                        />
                    </div>
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
                    <div className="form-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
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
                        {loading ? 'Kayıt Olunuyor...' : <><UserPlus size={20} /> Hesap Oluştur</>}
                    </button>
                </form>

                <div className="text-center mt-xl pt-lg" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Zaten hesabınız var mı?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 700, textDecoration: 'none' }}>
                            Giriş Yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
