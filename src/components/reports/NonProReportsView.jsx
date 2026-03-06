import React from 'react';
import { FileText, PieChart, Users, Sparkles, Download, Lock, Star } from 'lucide-react';

export default function NonProReportsView({ groups, selectedGroup, setSelectedGroup, setShowProModal, t }) {
    const features = [
        { icon: <PieChart size={18} />, color: 'var(--accent-purple)', title: t('reports.features.categoryAnalysis.title'), desc: t('reports.features.categoryAnalysis.desc') },
        { icon: <Users size={18} />, color: 'var(--accent-cyan)', title: t('reports.features.personBased.title'), desc: t('reports.features.personBased.desc') },
        { icon: <Sparkles size={18} />, color: 'var(--accent-amber)', title: t('reports.features.aiAnalysis.title'), desc: t('reports.features.aiAnalysis.desc') },
        { icon: <Download size={18} />, color: 'var(--accent-emerald)', title: t('reports.features.pdfExport.title'), desc: t('reports.features.pdfExport.desc') },
    ];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)' }}>
            <div className="page-header">
                <div>
                    <h2>{t('reports.pageTitle')}</h2>
                    <p className="page-subtitle">{t('reports.nonProSubtitle')}</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="glass-card" style={{
                position: 'relative', overflow: 'hidden', textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-xl)', marginBottom: 'var(--space-xl)'
            }}>
                {/* Gradient glow blobs */}
                <div style={{ position: 'absolute', top: -60, left: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                <div style={{
                    width: 56, height: 56, borderRadius: '16px', background: 'var(--gradient-primary)',
                    margin: '0 auto var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FileText size={26} color="white" />
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 'var(--space-xs)', color: 'var(--text-primary)' }}>
                    {t('reports.discoverPro')}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto var(--space-xl)' }}>
                    {t('reports.discoverProDesc')}
                </p>

                <button
                    className="btn btn-primary"
                    style={{
                        background: 'var(--gradient-primary)', border: 'none', fontWeight: 700,
                        padding: '12px 32px', fontSize: '0.95rem', borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)', transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => setShowProModal(true)}
                >
                    <Star size={16} fill="currentColor" style={{ marginRight: 6 }} /> {t('reports.upgradeToPro')}
                </button>
            </div>

            {/* Feature List */}
            <div className="flex flex-col gap-md">
                {features.map((f, i) => (
                    <div key={i} className="glass-card flex items-center gap-lg animate-fade-in-up" style={{
                        padding: 'var(--space-md) var(--space-lg)',
                        animationDelay: `${i * 80}ms`,
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '12px',
                            background: `${f.color}15`, color: f.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {f.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{f.title}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{f.desc}</div>
                        </div>
                        <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.4 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
