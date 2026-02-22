import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpendingByCategory, MemberBalanceChart } from '../components/BalanceChart';
import { formatCurrency } from '../utils/currencyUtils';
import { CATEGORIES, formatDate } from '../utils/helpers';
import { FileText, Download, Mail, Copy } from 'lucide-react';

export default function Reports() {
    const { state } = useApp();
    const [selectedGroup, setSelectedGroup] = useState(state.groups[0]?.id || '');
    const [showExport, setShowExport] = useState(false);

    const group = state.groups.find(g => g.id === selectedGroup);
    const expenses = state.expenses.filter(e => e.groupId === selectedGroup);
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + e.amount;
    });

    // Monthly breakdown
    const monthlyData = {};
    expenses.forEach(e => {
        const month = new Date(e.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
        monthlyData[month] = (monthlyData[month] || 0) + e.amount;
    });

    // Generate report text
    const generateReport = () => {
        if (!group) return '';
        const lines = [
            `📊 CoBill Raporu — ${group.name}`,
            `${'═'.repeat(40)}`,
            `Tarih: ${formatDate(new Date().toISOString())}`,
            `Toplam Harcama: ${formatCurrency(totalSpent, group.currency)}`,
            `Masraf Sayısı: ${expenses.length}`,
            `Üye Sayısı: ${group.members.length}`,
            '',
            '📋 Kategori Dağılımı:',
            ...Object.entries(categoryBreakdown).map(([cat, amount]) => {
                const c = CATEGORIES[cat] || CATEGORIES.other;
                return `  ${c.icon} ${c.label}: ${formatCurrency(amount, group.currency)}`;
            }),
            '',
            '📅 Aylık Dağılım:',
            ...Object.entries(monthlyData).map(([month, amount]) =>
                `  ${month}: ${formatCurrency(amount, group.currency)}`
            ),
            '',
            '📝 Harcama Detayları:',
            ...expenses.map((e, i) => {
                const payer = state.members[e.paidBy];
                return `  ${i + 1}. ${e.description} — ${formatCurrency(e.amount, e.currency)} (${payer?.name || '?'})`;
            }),
            '',
            '— CoBill ile oluşturuldu',
        ];
        return lines.join('\n');
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateReport());
            alert('Rapor panoya kopyalandı!');
        } catch {
            alert('Kopyalama başarısız');
        }
    };

    const handleEmail = () => {
        const subject = `CoBill Raporu — ${group?.name || ''}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(generateReport())}`);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Raporlar</h2>
                    <p className="page-subtitle">Harcama analizi ve dışa aktarma</p>
                </div>
                <div className="flex gap-sm">
                    <button className="btn btn-secondary" onClick={handleCopy}>
                        <Copy size={14} /> Kopyala
                    </button>
                    <button className="btn btn-primary" onClick={handleEmail}>
                        <Mail size={14} /> E-posta Gönder
                    </button>
                </div>
            </div>

            {/* Group Selector */}
            <div className="form-group mb-xl" style={{ maxWidth: 300 }}>
                <label className="form-label">Grup Seçin</label>
                <select
                    className="form-select"
                    value={selectedGroup}
                    onChange={e => setSelectedGroup(e.target.value)}
                >
                    {state.groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-3 mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card animate-fade-in-up stagger-1">
                    <div className="stat-label">Toplam Harcama</div>
                    <div className="stat-value text-gradient">
                        {formatCurrency(totalSpent, group?.currency || 'TRY')}
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-2">
                    <div className="stat-label">Masraf Sayısı</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan-light)' }}>
                        {expenses.length}
                    </div>
                </div>
                <div className="stat-card animate-fade-in-up stagger-3">
                    <div className="stat-label">Kişi Başı Ortalama</div>
                    <div className="stat-value" style={{ color: 'var(--accent-amber-light)' }}>
                        {group ? formatCurrency(totalSpent / Math.max(group.members.length, 1), group.currency) : '₺0'}
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }} className="reports-grid">
                <div className="glass-card">
                    <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>📊 Kategori Dağılımı</h4>
                    <SpendingByCategory groupId={selectedGroup} />
                </div>

                <div className="glass-card">
                    <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>👥 Kişi Başı Harcama</h4>
                    <MemberBalanceChart groupId={selectedGroup} />
                </div>
            </div>

            {/* Category Table (desktop) */}
            <div className="glass-card mt-xl hide-mobile">
                <h4 className="mb-lg" style={{ fontSize: 'var(--font-base)' }}>Kategori Detayları</h4>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th style={{ textAlign: 'right' }}>Tutar</th>
                            <th style={{ textAlign: 'right' }}>Yüzde</th>
                            <th>Dağılım</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cat, amount]) => {
                                const c = CATEGORIES[cat] || CATEGORIES.other;
                                const pct = totalSpent > 0 ? (amount / totalSpent * 100) : 0;
                                return (
                                    <tr key={cat}>
                                        <td>
                                            <span className="flex items-center gap-sm">
                                                <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                                                <span className="font-medium">{c.label}</span>
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="font-bold">{formatCurrency(amount, group?.currency || 'TRY')}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="text-muted">{pct.toFixed(1)}%</span>
                                        </td>
                                        <td>
                                            <div className="progress-bar" style={{ width: 120 }}>
                                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            <style>{`
        @media (max-width: 767px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
