import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Mail, Send, BellDot, X, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';
import ProUpgradeModal from './ProUpgradeModal';

export default function NudgeButton({ memberId, amount, groupName, currency }) {
    const { state } = useApp();
    const member = state.members[memberId];
    if (!member) return null;

    const isPro = state.members[state.currentUser]?.isPro;
    const [showOptions, setShowOptions] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [isShaking, setIsShaking] = useState(false);
    const menuRef = useRef();
    const btnRef = useRef();

    useEffect(() => {
        if (isShaking) {
            const timer = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isShaking]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                btnRef.current && !btnRef.current.contains(event.target)
            ) {
                setShowOptions(false);
            }
        }

        function updatePosition() {
            if (showOptions && btnRef.current) {
                const rect = btnRef.current.getBoundingClientRect();
                setDropdownPos({
                    bottom: window.innerHeight - rect.top + 8, // 8px spacing
                    left: rect.left,
                    width: Math.max(rect.width, 240)
                });
            }
        }

        if (showOptions) {
            updatePosition();
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside, { passive: true });
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
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
        e.preventDefault();

        if (!isPro) {
            setIsShaking(true);
            window.dispatchEvent(new CustomEvent('show-pro-banner'));
        } else {
            setShowOptions(prev => !prev);
        }
    };

    return (
        <div className="flex flex-col gap-sm w-full relative">
            <button
                ref={btnRef}
                className={`btn w-full flex justify-center items-center ${isPro ? 'btn-pro-active' : 'btn-pro-gold'} ${isShaking ? 'shake-animation' : ''}`}
                onClick={handleActionClick}
                style={{ padding: '8px 12px', height: 'auto', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
            >
                <BellDot size={14} style={{ marginRight: 6 }} /> Hatırlat
            </button>

            {showOptions && isPro && createPortal(
                <div ref={menuRef} style={{
                    width: dropdownPos.width,
                    minWidth: '240px',
                    backgroundColor: 'var(--bg-card)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)',
                    padding: 'var(--space-md)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                    animation: 'slideUp 0.2s ease-out',
                    zIndex: 9999,
                    position: 'fixed',
                    bottom: dropdownPos.bottom,
                    left: dropdownPos.left,
                }}>
                    <div className="flex justify-between items-center mb-md border-b" style={{ borderColor: 'var(--border-primary)', paddingBottom: 'var(--space-sm)' }}>
                        <h4 className="flex items-center gap-xs m-0 text-sm" style={{ color: 'var(--text-primary)' }}>
                            <Star size={14} fill="var(--accent-amber)" color="var(--accent-amber)" />
                            Hatırlatıcı Gönder
                        </h4>
                        <button className="btn btn-ghost btn-icon p-0 w-6 h-6 text-muted" onClick={() => setShowOptions(false)}><X size={14} /></button>
                    </div>
                    <div className="flex flex-col gap-sm">
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md text-sm py-2" onClick={() => { handleWhatsApp(); setShowOptions(false); }}>
                            <MessageCircle size={16} style={{ color: '#25D366' }} /> WhatsApp
                        </button>
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md text-sm py-2" onClick={() => { handleEmail(); setShowOptions(false); }}>
                            <Mail size={16} style={{ color: 'var(--accent-purple)' }} /> E-posta
                        </button>
                        <button className="btn btn-secondary w-full flex justify-start items-center gap-md text-sm py-2" onClick={() => { handleCopy(); setShowOptions(false); }}>
                            <Send size={16} style={{ color: 'var(--text-secondary)' }} /> Kopyala
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .shake-animation {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

// UI Refactored to Modal
