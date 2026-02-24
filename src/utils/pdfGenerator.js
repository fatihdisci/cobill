import html2pdf from 'html2pdf.js';
import { formatDate } from './helpers';
import { formatCurrency } from './currencyUtils';

export const generateGroupPDF = async (group, members, expenses, balances, settlements, paymentHistory = []) => {
    const container = document.createElement('div');
    container.style.padding = '40px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.color = '#334155';
    container.style.background = '#ffffff';

    let html = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8b5cf6; margin: 0 0 10px 0; font-size: 26px; font-weight: 800;">CoBill Finansal Rapor</h1>
            <h2 style="color: #0f172a; margin: 0 0 5px 0; font-size: 20px;">${group.name}</h2>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Oluşturulma Tarihi: ${formatDate(new Date().toISOString())}</p>
            <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px; display: inline-block;">
                <p style="color: #475569; margin: 0; font-size: 15px;">Toplam Harcama: <strong style="color: #0f172a; font-size: 18px;">${formatCurrency(expenses.reduce((s, e) => s + e.amount, 0), group.currency)}</strong></p>
            </div>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; font-size: 18px;">Hesap Özeti</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 12px; text-align: left; color: #475569;">Üye</th>
                    <th style="padding: 12px; text-align: right; color: #475569;">Toplam Ödediği</th>
                    <th style="padding: 12px; text-align: right; color: #475569;">Net Durum</th>
                </tr>
            </thead>
            <tbody>
    `;

    members.forEach(m => {
        const balance = balances[m.id] || 0;
        const totalPaid = expenses.filter(e => e.paidBy === m.id).reduce((s, e) => s + e.amount, 0);
        const balanceColor = balance >= 0 ? '#10b981' : '#f43f5e';

        html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: 600;">${m.name} ${m.isGhost ? `<span style="font-size: 10px; color: #94a3b8; background: #f8fafc; padding: 2px 6px; border-radius: 10px; font-weight: normal; margin-left: 6px;">Hayalet</span>` : ''}</td>
                    <td style="padding: 12px; text-align: right; color: #475569;">${formatCurrency(totalPaid, group.currency)}</td>
                    <td style="padding: 12px; text-align: right; color: ${balanceColor}; font-weight: 700;">
                        ${balance >= 0 ? '+' : ''}${formatCurrency(balance, group.currency)}
                    </td>
                </tr>
        `;
    });

    html += `
            </tbody>
        </table>

        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; font-size: 18px;">Sadeleştirilmiş Ödeme Planı</h3>
    `;

    if (settlements.length === 0) {
        html += `<p style="color: #64748b; margin-top: 15px; font-style: italic; padding: 16px; background: #f8fafc; border-radius: 8px; text-align: center;">Tüm hesaplar kapalı. Ödenecek borç bulunmamaktadır 🎉</p>`;
    } else {
        html += `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 12px; text-align: left; color: #475569;">Kimden</th>
                    <th style="padding: 12px; text-align: center; color: #475569;"></th>
                    <th style="padding: 12px; text-align: left; color: #475569;">Kime</th>
                    <th style="padding: 12px; text-align: right; color: #475569;">Tutar</th>
                </tr>
            </thead>
            <tbody>
        `;

        settlements.forEach(s => {
            const fromMember = members.find(m => m.id === s.from);
            const toMember = members.find(m => m.id === s.to);
            const from = fromMember?.name || 'Bilinmiyor';
            const to = toMember?.name || 'Bilinmiyor';

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: 600;">${from}</td>
                    <td style="padding: 12px; text-align: center; color: #94a3b8;">➔</td>
                    <td style="padding: 12px; font-weight: 600;">${to}</td>
                    <td style="padding: 12px; text-align: right; color: #10b981; font-weight: 700; font-size: 15px;">${formatCurrency(s.amount, group.currency)}</td>
                </tr>
            `;
        });

        html += `
            </tbody>
        </table>
        `;
    }

    // Payment History Section
    if (paymentHistory.length > 0) {
        html += `
            <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; font-size: 18px;">Tamamlanan Ödemeler</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 12px; text-align: left; color: #475569;">Tarih</th>
                        <th style="padding: 12px; text-align: left; color: #475569;">İşlem</th>
                        <th style="padding: 12px; text-align: right; color: #475569;">Tutar</th>
                    </tr>
                </thead>
                <tbody>
        `;

        paymentHistory.forEach(s => {
            const fromMember = members.find(m => m.id === s.from);
            const toMember = members.find(m => m.id === s.to);
            const from = fromMember?.name?.split(' ')[0] || 'Bilinmiyor';
            const to = toMember?.name?.split(' ')[0] || 'Bilinmiyor';

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; color: #64748b;">${formatDate(s.date || s.paidAt)}</td>
                    <td style="padding: 12px; font-weight: 600;">${from} ➔ ${to}</td>
                    <td style="padding: 12px; text-align: right; color: #059669; font-weight: 700;">${formatCurrency(s.amount, group.currency)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;
    }

    html += `
        <div style="margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
            <p style="margin: 0; font-weight: 600; color: #8b5cf6;">CoBill Hesaplayıcı</p>
            <p style="margin: 4px 0 0 0;">Bu rapor CoBill uygulaması üzerinden otomatik üretilmiştir.</p>
        </div>
    `;

    container.innerHTML = html;

    const opt = {
        margin: 10,
        filename: `CoBill_${group.name.replace(/\s+/g, '_')}_Rapor.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    return await html2pdf().set(opt).from(container).output('datauristring');
};
