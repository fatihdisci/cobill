import { MessageCircle, Mail, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currencyUtils';

export default function NudgeButton({ memberId, amount, groupName, currency }) {
    const { state } = useApp();
    const member = state.members[memberId];
    if (!member) return null;

    const message = `CoBill Hatırlatması 💰\n\n"${groupName}" grubu için güncel bakiyen: ${formatCurrency(Math.abs(amount), currency)}.\n\nMüsait olduğunda bakabilir misin? 🙏\n\n— CoBill ile gönderildi`;

    const handleWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleEmail = () => {
        const subject = `CoBill - ${groupName} Borç Hatırlatması`;
        const url = `mailto:${member.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(url);
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
    };

    return (
        <div className="flex items-center gap-sm">
            <button
                className="btn btn-ghost btn-sm"
                onClick={handleWhatsApp}
                title="WhatsApp ile hatırlat"
                style={{ color: '#25D366' }}
            >
                <MessageCircle size={14} /> WA
            </button>
            <button
                className="btn btn-ghost btn-sm"
                onClick={handleEmail}
                title="E-posta ile hatırlat"
                style={{ color: 'var(--accent-blue-light)' }}
            >
                <Mail size={14} />
            </button>
            <button
                className="btn btn-ghost btn-sm"
                onClick={handleCopy}
                title="Mesajı kopyala"
            >
                <Send size={14} />
            </button>
        </div>
    );
}
