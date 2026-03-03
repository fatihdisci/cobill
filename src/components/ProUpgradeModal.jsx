import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Star, Circle } from 'lucide-react';

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
            subtitle: 'Ömür Boyu',
            price: '149 ₺',
            period: 'Tek Seferlik',
            desc: 'Sadece reklamları kaldırır. Pro özellikler içermez.'
        },
        {
            id: 'pro-yearly',
            title: 'Pro',
            subtitle: 'Yıllık',
            price: '299 ₺',
            period: 'Yıl',
            desc: 'Aylık sadece 24.90 TL\'ye gelir',
            badge: 'EN İYİ FIRSAT - %50 TASARRUF'
        },
        {
            id: 'pro-monthly',
            title: 'Pro',
            subtitle: 'Aylık',
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
                maxWidth: '540px',
                maxHeight: '90vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                border: '1px solid var(--border-primary)',
                boxShadow: 'none',
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
                    padding: isMobile ? '32px 20px 20px' : '40px 32px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '16px',
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Star size={28} color="white" fill="white" />
                    </div>

                    <h2 style={{
                        fontSize: isMobile ? '1.35rem' : '1.75rem',
                        fontWeight: 800,
                        margin: '0 auto 16px',
                        lineHeight: 1.3,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        maxWidth: '400px'
                    }}>
                        CoBill deneyiminizi sınırların ötesine taşıyın.
                    </h2>

                    <div className="flex flex-col gap-sm" style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-md">
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-purple)', flexShrink: 0, marginTop: 2 }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Cards */}
                <div style={{ padding: isMobile ? '0 16px 20px' : '0 32px 32px' }}>
                    <div className="flex flex-col gap-md mb-xl">
                        {plans.map((plan, i) => {
                            const isSelected = selectedPlan === plan.id;

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        border: isSelected ? '2px solid var(--accent-purple)' : '1px solid var(--border-primary)',
                                        background: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-card)',
                                        borderRadius: '16px',
                                        padding: '12px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        gap: '12px'
                                    }}
                                >
                                    {/* Desktop & Mobile: Badge top center or right */}
                                    {plan.badge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-10px',
                                            right: '16px',
                                            background: 'var(--gradient-primary)',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            whiteSpace: 'nowrap',
                                            letterSpacing: '0.03em',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 2
                                        }}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    {/* Radio indicator */}
                                    <div style={{ flexShrink: 0 }}>
                                        {isSelected ? (
                                            <CheckCircle2 size={24} style={{ color: 'var(--accent-purple)' }} fill="var(--accent-purple)" stroke="white" />
                                        ) : (
                                            <Circle size={24} style={{ color: 'var(--text-muted)' }} />
                                        )}
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className="flex w-full" style={{ alignItems: 'center', gap: '12px' }}>
                                        {/* Title area */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                    {plan.title}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {plan.subtitle}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                                                {plan.desc}
                                            </div>
                                        </div>

                                        {/* Price area */}
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                                {plan.price}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                / {plan.period}
                                            </div>
                                        </div>
                                    </div>
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
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                borderRadius: '16px',
                                background: 'var(--gradient-primary)',
                                border: 'none',
                                color: 'white',
                                marginBottom: '12px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Şimdi Yükselt
                        </button>

                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.5,
                            margin: 0,
                            padding: '0 10px'
                        }}>
                            Ödeme App Store / Google Play hesabınızdan alınır. Abonelikleri cihaz ayarlarınızdan istediğiniz zaman iptal edebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
