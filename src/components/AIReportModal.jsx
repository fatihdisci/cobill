import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
                    <div className="ai-report-header">
                        <div className="flex items-center gap-sm">
                            <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} />
                            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>
                                {t('aiReport.title')}
                            </h3>
                        </div>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ minHeight: 36, width: 36, height: 36 }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="ai-report-body">
                        {isLoading && (
                            <div className="ai-report-loading">
                                <div className="ai-report-loading-icon">
                                    <Loader2 size={32} className="magic-draft-spinner" />
                                </div>
                                <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {t('aiReport.analyzing')}
                                </h4>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {t('aiReport.analyzingDesc')}
                                </p>
                                {/* Skeleton bars */}
                                <div className="ai-report-skeleton">
                                    <div className="skeleton-line skeleton-line-lg" />
                                    <div className="skeleton-line skeleton-line-md" />
                                    <div className="skeleton-line skeleton-line-sm" />
                                    <div className="skeleton-line skeleton-line-lg" />
                                    <div className="skeleton-line skeleton-line-md" />
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
                                className="btn btn-secondary flex items-center gap-sm"
                                onClick={handleWhatsApp}
                                style={{ flex: 1, minHeight: 42, borderRadius: 'var(--radius-md)' }}
                            >
                                <MessageCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                                {t('aiReport.shareWhatsapp')}
                            </button>
                            <button
                                className="btn btn-secondary flex items-center gap-sm"
                                onClick={handleCopyText}
                                style={{ flex: 1, minHeight: 42, borderRadius: 'var(--radius-md)' }}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
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
