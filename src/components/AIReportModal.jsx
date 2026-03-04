import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, MessageCircle, CheckCircle2, Loader2, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * AIReportModal — Yapay zeka bütçe analiz raporu modalı
 * Props:
 *   isOpen       — boolean
 *   onClose      — () => void
 *   reportHtml   — string | null (AI'dan gelen HTML)
 *   isLoading    — boolean
 *   error        — string | null
 */
export default function AIReportModal({ isOpen, onClose, reportHtml, isLoading, error }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const contentRef = useRef(null);
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    const loadingMessages = [
        t('aiReport.analyzing', { defaultValue: 'Yapay zeka bütçenizi inceliyor...' }),
        t('aiReport.loadingMessages.insights', { defaultValue: 'Harcama alışkanlıklarınız analiz ediliyor...' }),
        t('aiReport.loadingMessages.opportunities', { defaultValue: 'Tasarruf fırsatları değerlendiriliyor...' }),
        t('aiReport.loadingMessages.finalizing', { defaultValue: 'Raporunuz hazırlanıyor...' })
    ];

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
            }, 2500);
        } else {
            setLoadingMsgIdx(0);
        }
        return () => clearInterval(interval);
    }, [isLoading, loadingMessages.length]);

    if (!isOpen) return null;

    const handleCopyText = async () => {
        if (!contentRef.current) return;
        const text = contentRef.current.innerText;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsApp = () => {
        if (!contentRef.current) return;
        const text = contentRef.current.innerText;
        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    };

    return (
        <AnimatePresence>
            <motion.div
                className="magic-draft-overlay"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="ai-report-modal"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                    {/* Header */}
                    <div className="ai-report-header" style={{ background: 'var(--gradient-primary)', borderBottom: 'none', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
                        <div className="flex items-center gap-sm">
                            <Sparkles size={20} style={{ color: 'white' }} />
                            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'white' }}>
                                {t('aiReport.title')}
                            </h3>
                        </div>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ minHeight: 36, width: 36, height: 36, color: 'white' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="ai-report-body">
                        {isLoading && (
                            <div className="ai-report-loading">
                                <motion.div
                                    className="ai-report-loading-icon"
                                    animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                >
                                    <BrainCircuit size={32} style={{ color: 'var(--accent-purple)' }} />
                                </motion.div>

                                <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 'var(--space-sm)' }}>
                                    <AnimatePresence mode="wait">
                                        <motion.h4
                                            key={loadingMsgIdx}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textAlign: 'center' }}
                                        >
                                            {loadingMessages[loadingMsgIdx]}
                                        </motion.h4>
                                    </AnimatePresence>
                                </div>

                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 'var(--space-xs)' }}>
                                    {t('aiReport.analyzingDesc', { defaultValue: 'Lütfen bekleyin, bu işlem biraz sürebilir.' })}
                                </p>

                                {/* Premium Skeleton bars */}
                                <div className="ai-report-skeleton mt-lg">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            className={`skeleton-line skeleton-line-${i % 2 === 0 ? 'md' : i === 3 ? 'sm' : 'lg'} premium-shimmer`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1, duration: 0.4 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="ai-report-error">
                                <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>⚠️ {error}</p>
                            </div>
                        )}

                        {reportHtml && !isLoading && (
                            <div
                                ref={contentRef}
                                className="ai-report-content"
                                dangerouslySetInnerHTML={{ __html: reportHtml }}
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    {reportHtml && !isLoading && (
                        <div className="ai-report-actions">
                            <button
                                className="btn btn-primary flex items-center gap-sm"
                                onClick={handleWhatsApp}
                                style={{ flex: 1, minHeight: 42, borderRadius: 'var(--radius-md)' }}
                            >
                                <MessageCircle size={16} />
                                {t('aiReport.shareWhatsapp')}
                            </button>
                            <button
                                className="btn btn-primary flex items-center gap-sm"
                                onClick={handleCopyText}
                                style={{ flex: 1, minHeight: 42, borderRadius: 'var(--radius-md)' }}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        {t('aiReport.copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} />
                                        {t('aiReport.copyText')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
