import { useState, useEffect } from 'react';
import { X, Star, Zap } from 'lucide-react';

export default function UpgradeBanner({ visible, onClose, onUpgrade }) {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            width: 'calc(100% - 32px)',
            maxWidth: '500px',
            animation: 'bannerSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
            <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.5), 0 0 15px rgba(139, 92, 246, 0.2)'
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    animation: 'pulseScale 2s infinite'
                }}>
                    <Zap size={20} color="white" fill="white" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: 'white' }}>
                        Bu bir Pro özelliğidir! 🚀
                    </h4>
                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Hatırlatıcılar ve gelişmiş raporlar için Pro'ya geçin.
                    </p>
                </div>

                <div className="flex items-center gap-sm">
                    <button
                        onClick={onUpgrade}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-purple-light)',
                            fontSize: '13px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px'
                        }}
                    >
                        Pro'ya Geç
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes bannerSlideUp {
                    from { transform: translate(-50%, 100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes pulseScale {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
                }
            `}</style>
        </div>
    );
}
