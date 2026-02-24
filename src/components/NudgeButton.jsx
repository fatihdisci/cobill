import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mail, Send, BellDot, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import ProUpgradeModal from './ProUpgradeModal';

export default function NudgeButton({ memberId, amount, groupName, currency }) {
    const { state } = useApp();
    const member = state.members[memberId];
    if (!member) return null;

    const isPro = state.members[state.currentUser]?.isPro;
    const [showOptions, setShowOptions] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }
        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showOptions]);

    const message = `Merhaba ${member.name.split(' ')[0]},\n\n"${groupName}" grubunda toplam ${formatCurrency(Math.abs(amount), currency)} ödenmemiş borcun bulunuyor. Müsait olduğunda kontrol edebilir misin?\n\n(CoBill ile gönderildi)`;

    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setShowOptions(false);
    };

    const handleEmail = () => {
        const subject = `CoBill - ${groupName} Borç Hatırlatması`;
        const url = `mailto:${member.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(url);
        setShowOptions(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            alert('Mesaj panoya kopyalandı!');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = message;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert('Mesaj panoya kopyalandı!');
        }
        setShowOptions(false);
    };

    const handleActionClick = (e) => {
        e.stopPropagation();
        if (!isPro) {
            setShowProModal(true);
        } else {
            setShowOptions(true);
        }
    };

    return (
        <div className="flex flex-col gap-sm w-full">
            <button
                className={`btn w-full flex justify-center items-center ${isPro ? 'btn-pro-active' : 'btn-pro-gold'}`}
                onClick={handleActionClick}
                style={{ padding: '8px 12px', height: 'auto', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
            >
                <BellDot size={14} style={{ marginRight: 6 }} /> Hatırlat
            </button>

            {showOptions && isPro && (
                <div ref={menuRef} style={{
                    width: '100%',
                    minWidth: '220px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-primary)',
                    padding: 'var(--space-md)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    animation: 'slideUp 0.15s ease-out'
                }}>
                    <div className="modal-header mb-md">
                        <h3 className="flex items-center gap-xs"><BellDot size={18} /> Hatırlatıcı Gönder</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => setShowOptions(false)}><X size={18} /></button>
                    </div>
                    <div className="flex flex-col gap-sm">
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => { handleWhatsApp(); setShowOptions(false); }}>
                            <MessageCircle size={18} style={{ color: '#25D366' }} /> WhatsApp ile Gönder
                        </button>
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => { handleEmail(); setShowOptions(false); }}>
                            <Mail size={18} style={{ color: 'var(--accent-purple)' }} /> E-posta Gönder
                        </button>
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md" onClick={() => { handleCopy(); setShowOptions(false); }}>
                            <Send size={18} style={{ color: 'var(--text-secondary)' }} /> Metin Olarak Kopyala
                        </button>
                    </div>
                </div>
            )}

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
    );
}

// UI Refactored to Modal
