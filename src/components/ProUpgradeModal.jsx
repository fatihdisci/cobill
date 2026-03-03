import { Check, Star, Zap, Download, Bell, LayoutDashboard, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProUpgradeModal({ onClose }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 480);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const features = [
        {
            icon: Download,
            title: 'Detaylı PDF Raporları',
            desc: 'Tüm grup harcamalarını ve bireysel ekstrenizi PDF formatında indirin.',
            color: 'var(--accent-cyan)'
        },
        {
            icon: Bell,
            title: 'Kolay Paylaşım & Hatırlatma',
            desc: 'Tahsilat raporlarını doğrudan WhatsApp ile tek dokunuşta paylaşın.',
            color: 'var(--accent-emerald)'
        },
        {
            icon: LayoutDashboard,
            title: 'Görsel Harcama Analizleri',
            desc: 'Hangi kategoriye ne kadar harcandığını gösteren grafiklere anında erişin.',
            color: 'var(--accent-purple)'
        },
        {
            icon: Zap,
            title: 'Reklamsız Deneyim',
            desc: 'Araya giren veya ekranı kaplayan hiçbir reklam olmadan temiz bir deneyim yaşayın.',
            color: 'var(--accent-rose)'
        }
    ];

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose} style={{
            zIndex: 1100,
            padding: isMobile ? '20px 16px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 8, 15, 0.75)',
            backdropFilter: 'blur(8px)'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                width: '100%',
                maxWidth: '440px',
                maxHeight: '85vh',
                padding: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'rgb(10, 15, 28)',
                borderRadius: '32px',
                border: 'none',
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none'
            }}>
                {/* Header section with gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
                    padding: isMobile ? 'var(--space-xl) var(--space-lg)' : 'var(--space-2xl) var(--space-xl)',
                    textAlign: 'center',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{
                        width: isMobile ? 60 : 80, height: isMobile ? 60 : 80, borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto var(--space-lg)',
                        border: 'none',
                        boxShadow: 'none'
                    }}>
                        <Star size={isMobile ? 32 : 40} color="#f59e0b" fill="#f59e0b" />
                    </div>

                    <h2 style={{ color: 'white', fontSize: isMobile ? 'var(--font-2xl)' : 'var(--font-3xl)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                        CoBill <span className="text-gradient" style={{ background: 'linear-gradient(to right, #f59e0b, #fbbf24)' }}>Pro</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 'var(--space-sm)', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                        Finansal kontrolünüzü bir üst seviyeye taşıyın.
                    </p>
                </div>

                <div style={{ padding: isMobile ? 'var(--space-xl)' : 'var(--space-2xl)', flex: 1 }}>
                    <div className="flex flex-col gap-lg mb-xl">
                        {features.map((f, i) => (
                            <div key={i} className="flex gap-md animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: f.color, flexShrink: 0,
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <f.icon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: 'white', margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 600 }}>{f.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.3, margin: 0 }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: 'var(--space-md) var(--space-lg)',
                        borderRadius: '16px',
                        marginBottom: 'var(--space-lg)',
                        border: 'none',
                        boxShadow: 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aylık Abonelik</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>29,99₺ <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ay</span></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-purple" style={{ fontSize: '10px' }}>PRO AKTİF</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full btn-lg"
                        style={{
                            background: 'var(--gradient-primary)',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 700,
                            padding: '14px',
                            boxShadow: 'none',
                            transition: 'all 0.2s ease',
                            marginBottom: 'var(--space-md)'
                        }}
                        onClick={() => {
                            alert("Bize olan güvenin için teşekkürler! \nŞu anda geliştirme aşamasındayız, Pro özelliklerini hesabında ücretsiz test etmen için hemen aktif ediyoruz.");
                            onClose();
                        }}
                    >
                        Ücretsiz Beta'yı Dene
                    </button>

                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        margin: 0
                    }}>
                        Geliştirme sürecinde limitler tamamen kaldırılmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
}
