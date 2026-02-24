import { Check, Star } from 'lucide-react';

export default function ProUpgradeModal({ onClose }) {
    const features = [
        "Gelişmiş Harcama Grafikleri",
        "WhatsApp & E-posta ile Borç Hatırlatma",
        "Satır içi PDF Dışa Aktarım",
        "Reklamsız Deneyim"
    ];

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}>
                <div style={{ background: 'var(--gradient-primary)', padding: 'var(--space-2xl) var(--space-lg)', textAlign: 'center', position: 'relative' }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={onClose}
                        style={{ position: 'absolute', top: 12, right: 12, color: 'white' }}
                    >✕</button>
                    <Star size={48} color="white" fill="white" style={{ margin: '0 auto', marginBottom: 'var(--space-md)' }} />
                    <h2 style={{ color: 'white', fontSize: 'var(--font-2xl)', margin: 0 }}>CoBill Pro</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 'var(--space-sm)' }}>Finansal yönetimini bir üst seviyeye taşı.</p>
                </div>

                <div style={{ padding: 'var(--space-xl)' }}>
                    <div className="flex flex-col gap-md mb-xl">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-md">
                                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: 6, borderRadius: '50%' }}>
                                    <Check size={16} style={{ color: 'var(--accent-purple)' }} />
                                </div>
                                <span style={{ fontWeight: 500 }}>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary w-full btn-lg"
                        style={{ background: 'var(--gradient-primary)', border: 'none', fontSize: 'var(--font-lg)' }}
                        onClick={() => {
                            alert("Şu anda Beta aşamasında olduğumuz için Pro hesap yükseltmeleri geçici olarak devre dışıdır.");
                            onClose();
                        }}
                    >
                        Pro'ya Yükselt
                    </button>
                </div>
            </div>
        </div>
    );
}
