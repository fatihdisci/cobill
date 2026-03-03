import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Star } from 'lucide-react';

export default function ProUpgradeModal({ onClose }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 480);
    const [selectedPlan, setSelectedPlan] = useState('pro-yearly');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 480);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const features = [
        "Tüm ekran reklamlarını sonsuza dek kaldırın.",
        "Bireysel ve Grup masraflarını PDF olarak dışa aktarın.",
        "Gelişmiş bütçe grafikleri ve kişi bazlı raporlar."
    ];

    const plans = [
        {
            id: 'ad-free',
            title: 'Reklamsız',
            subtitle: '(Ömür Boyu)',
            price: '149 ₺',
            period: 'Tek Seferlik',
            desc: 'Sadece reklamları kaldırır. Pro özellikler içermez.'
        },
        {
            id: 'pro-yearly',
            title: 'Pro',
            subtitle: '(Yıllık)',
            price: '299 ₺',
            period: 'Yıl',
            desc: 'Aylık sadece 24.90 TL\'ye gelir',
            badge: 'EN İYİ FIRSAT - %50 TASARRUF'
        },
        {
            id: 'pro-monthly',
            title: 'Pro',
            subtitle: '(Aylık)',
            price: '49 ₺',
            period: 'Ay',
            desc: 'İstediğin zaman iptal et.'
        }
    ];

    const handleUpgrade = () => {
        alert('Ödeme altyapısı entegre edilecek: ' + selectedPlan);
        // onClose();
    };

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose} style={{
            zIndex: 1100,
            padding: isMobile ? '20px 16px' : '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 8, 15, 0.85)',
            backdropFilter: 'blur(10px)'
        }}>
            <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()} style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: 0
            }}>
                {/* Close Button */}
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={onClose}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div style={{
                    padding: isMobile ? '40px 24px 24px' : '48px 32px 32px',
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 100%)'
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '20px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.5)'
                    }}>
                        <Star size={32} color="white" fill="white" />
                    </div>

                    <h2 style={{
                        fontSize: isMobile ? '1.5rem' : '2rem',
                        fontWeight: 800,
                        margin: '0 0 16px',
                        lineHeight: 1.2,
                        background: 'linear-gradient(to right, #fff, #cbd5e1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em'
                    }}>
                        CoBill deneyiminizi <br /> sınırların ötesine taşıyın.
                    </h2>

                    <div className="flex flex-col gap-sm" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-md">
                                <CheckCircle2 size={20} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: 2 }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.4 }}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 32px' }}>
                    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-md mb-2xl`}>
                        {plans.map(plan => {
                            const isSelected = selectedPlan === plan.id;
                            const isYearly = plan.id === 'pro-yearly';

                            return (
                                <div
                                    key={plan.id}
                                    className="glass-card"
                                    onClick={() => setSelectedPlan(plan.id)}
                                    style={{
                                        flex: 1,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        border: isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border-primary)',
                                        background: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-glass)',
                                        boxShadow: isSelected && isYearly ? '0 0 20px rgba(139, 92, 246, 0.3)' : 'none',
                                        transform: isSelected && !isMobile ? 'scale(1.05)' : 'scale(1)',
                                        padding: '24px 16px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        opacity: isSelected ? 1 : 0.7
                                    }}
                                >
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: -12,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'linear-gradient(90deg, #d946ef 0%, #8b5cf6 100%)',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            whiteSpace: 'nowrap',
                                            boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{plan.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{plan.subtitle}</div>
                                    </div>

                                    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                            {plan.price}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            / {plan.period}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto', lineHeight: 1.4 }}>
                                        {plan.desc}
                                    </div>

                                    {/* Selection Indicator */}
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        border: isSelected ? '6px solid var(--accent-purple)' : '2px solid var(--border-secondary)',
                                        margin: '16px auto 0',
                                        background: 'var(--bg-primary)',
                                        transition: 'all 0.2s ease'
                                    }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* CTA Section */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            className="btn btn-primary w-full"
                            onClick={handleUpgrade}
                            style={{
                                padding: '16px',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.5)',
                                color: 'white',
                                marginBottom: '16px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Şimdi Yükselt
                        </button>

                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.5,
                            margin: 0,
                            padding: '0 20px'
                        }}>
                            Ödeme App Store / Google Play hesabınızdan alınır. Abonelikleri cihaz ayarlarınızdan istediğiniz zaman iptal edebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
