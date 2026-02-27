import { useRef, useEffect } from 'react';
import { Star, Check, Zap, Download, Bell, LayoutDashboard, X } from 'lucide-react';

export default function ProBenefitsMenu({ onClose, onUpgrade, isMobile }) {
    const menuRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const benefits = [
        {
            icon: Download,
            title: 'Detaylı PDF Raporları',
            desc: 'Grup harcamalarını ve borç durumunu PDF formatında görüntüleyin.',
            color: 'var(--accent-cyan)'
        },
        {
            icon: Bell,
            title: 'Kolay Paylaşım & Hatırlatma',
            desc: 'Tahsilat raporlarını WhatsApp ile tek dokunuşta paylaşın.',
            color: 'var(--accent-emerald)'
        },
        {
            icon: LayoutDashboard,
            title: 'Görsel Harcama Analizleri',
            desc: 'Harcama kategorilerini gösteren grafiklere anında erişin.',
            color: 'var(--accent-purple)'
        },
        {
            icon: Zap,
            title: 'Reklamsız Deneyim',
            desc: 'Araya giren hiçbir reklam olmadan temiz bir deneyim yaşayın.',
            color: 'var(--accent-rose)'
        }
    ];

    return (
        <div ref={menuRef} style={{
            position: 'absolute',
            top: isMobile ? '56px' : '40px',
            left: isMobile ? '0' : '-80px',
            width: '290px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div className="flex items-center gap-xs">
                    <Star size={18} fill="var(--accent-amber)" color="var(--accent-amber)" />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>CoBill Pro</h4>
                </div>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onClose}
                    style={{ width: 24, height: 24, padding: 0, color: 'var(--text-tertiary)' }}
                >
                    <X size={16} />
                </button>
            </div>

            <div style={{ padding: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {benefits.map((benefit, i) => (
                    <div key={i} style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        gap: 'var(--space-md)',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '8px',
                            background: `${benefit.color}10`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: benefit.color, flexShrink: 0
                        }}>
                            <benefit.icon size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{benefit.title}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{benefit.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: 'var(--space-md) var(--space-lg) var(--space-lg)', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <button
                    className="btn btn-primary w-full"
                    style={{
                        background: 'var(--gradient-primary)',
                        padding: '10px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        boxShadow: '0 8px 16px rgba(139, 92, 246, 0.25)',
                        border: 'none',
                        color: 'white'
                    }}
                    onClick={onUpgrade}
                >
                    Pro Özelliklerini Aç
                </button>
            </div>
        </div>
    );
}
