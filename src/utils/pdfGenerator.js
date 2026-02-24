import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './helpers';
import { formatCurrency } from './currencyUtils';

export const generateGroupPDF = (group, members, expenses, balances, settlements) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // var(--accent-purple)
    doc.text(`CoBill Finansal Rapor - ${group.name}`, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // muted text color
    doc.text(`Olusturulma Tarihi: ${formatDate(new Date().toISOString())}`, pageWidth / 2, 28, { align: 'center' });

    doc.text(`Toplam Harcama: ${formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), group.currency)}`, pageWidth / 2, 34, { align: 'center' });

    // 2. Tablo 1: Hesap Özeti (Üyeler ve Bakiyeler)
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Hesap Ozeti', 14, 48);

    const balanceData = members.map(m => {
        const balance = balances[m.id] || 0;
        const totalPaid = expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0);
        return [
            m.name,
            formatCurrency(totalPaid, group.currency),
            `${balance >= 0 ? '+' : ''}${formatCurrency(balance, group.currency)}`
        ];
    });

    doc.autoTable({
        startY: 52,
        head: [['Uye', 'Toplam Odedigi', 'Net Durum']],
        body: balanceData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { font: 'helvetica' }
    });

    // 3. Tablo 2: Sadeleştirilmiş Ödeme Planı
    const finalY = doc.lastAutoTable.finalY || 52;
    doc.setFontSize(14);
    doc.text('Sadelestirilmis Odeme Plani', 14, finalY + 14);

    const settlementData = settlements.map(s => {
        const from = members.find(m => m.id === s.from)?.name || 'Bilinmiyor';
        const to = members.find(m => m.id === s.to)?.name || 'Bilinmiyor';
        return [from, '->', to, formatCurrency(s.amount, group.currency)];
    });

    if (settlementData.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Odenecek borc bulunmamaktadir.', 14, finalY + 22);
    } else {
        doc.autoTable({
            startY: finalY + 18,
            head: [['Kimden', '', 'Kime', 'Tutar']],
            body: settlementData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }, // accent-emerald
            styles: { font: 'helvetica' }
        });
    }

    // Return as Base64 Data URI
    return doc.output('datauristring');
};
