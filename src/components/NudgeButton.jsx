import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mail, Send, BellDot } from 'lucide-react';
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
    const menuRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = () => {
        if (!isPro) {
            setShowProModal(true);
        } else {
            setShowOptions(!showOptions);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="btn btn-sm"
                onClick={handleActionClick}
                style={{
                    padding: '4px 10px', height: 'auto', fontSize: 'var(--font-xs)',
                    background: isPro ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-card)',
                    color: isPro ? 'var(--accent-purple)' : 'var(--text-secondary)',
                    border: `1px solid ${isPro ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-secondary)'}`
                }}
            >
                <BellDot size={12} style={{ marginRight: 4 }} /> Hatırlat
            </button>

            {showOptions && isPro && (
                <div
                    className="animate-fade-in-up"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        background: 'var(--bg-glass)', backdropFilter: 'blur(12px)',
                        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-xs)', zIndex: 100, minWidth: 200,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                >
                    <button className="dropdown-item" onClick={handleWhatsApp} style={dropdownItemStyle}>
                        <MessageCircle size={14} style={{ color: '#25D366' }} /> WhatsApp ile Gönder
                    </button>
                    <button className="dropdown-item" onClick={handleEmail} style={dropdownItemStyle}>
                        <Mail size={14} style={{ color: 'var(--accent-blue-light)' }} /> E-posta Gönder
                    </button>
                    <button className="dropdown-item" onClick={handleCopy} style={dropdownItemStyle}>
                        <Send size={14} style={{ color: 'var(--text-secondary)' }} /> Metni Kopyala
                    </button>
                </div>
            )}

            {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
        </div>
    );
}

const dropdownItemStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', padding: '8px 12px',
    background: 'transparent', border: 'none',
    color: 'var(--text-primary)', fontSize: 'var(--font-sm)',
    textAlign: 'left', cursor: 'pointer', borderRadius: '4px',
    transition: 'background 0.2s'
};
