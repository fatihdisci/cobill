import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/helpers';

// Register Chart.js elements
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function SpendingByCategory({ groupId }) {
    const { state } = useApp();
    const expenses = groupId
        ? state.expenses.filter(e => e.groupId === groupId)
        : state.expenses;

    const categoryTotals = {};
    expenses.forEach(e => {
        const cat = e.category || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
    });

    const colors = [
        '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
        '#f43f5e', '#3b82f6', '#ec4899', '#14b8a6', '#64748b'
    ];

    const rawData = Object.keys(categoryTotals).map((key, index) => ({
        label: CATEGORIES[key]?.label || key,
        value: categoryTotals[key],
        color: colors[index % colors.length]
    })).filter(item => item.value > 0);

    if (rawData.length === 0) return null;

    const chartData = {
        labels: rawData.map(item => item.label),
        datasets: [
            {
                data: rawData.map(item => item.value),
                backgroundColor: rawData.map(item => item.color),
                borderWidth: 0, // DİKKAT: Dilimler arası çizgiyi kaldırır (boşluk kalmaz)
                hoverOffset: 6  // Üzerine gelince tatlı bir büyüme efekti verir
            }
        ]
    };

    const chartOptions = {
        cutout: '75%', // İnce ve modern bir halka
        plugins: {
            legend: {
                display: false // Görsel bütünlük adına kapalı 
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.85)', // Glassmorphism Dark Mode background
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                titleFont: { family: 'Inter, sans-serif' },
                bodyFont: { family: 'Inter, sans-serif' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed !== null) {
                            label += context.parsed.toLocaleString('tr-TR') + ' ₺'; // Projenin para formatı
                        }

                        // İsteğe bağlı yüzde ekleme
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const pct = ((context.parsed / total) * 100).toFixed(1);
                        return `${label} (${pct}%)`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ height: 250, width: '100%', maxWidth: 280, margin: '0 auto' }}>
            <Doughnut data={chartData} options={chartOptions} />
        </div>
    );
}

export function MemberBalanceChart({ groupId }) {
    const { state } = useApp();
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return null;

    const expenses = state.expenses.filter(e => e.groupId === groupId);
    const memberTotals = {};

    group.members.forEach(id => {
        const member = state.members[id];
        if (!member) return;
        const paid = expenses.filter(e => e.paidBy === id).reduce((s, e) => s + e.amount, 0);
        memberTotals[member.name.split(' ')[0]] = paid;
    });

    const colors = [
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
    ];

    const rawData = Object.keys(memberTotals).map((key, index) => ({
        label: key,
        value: memberTotals[key],
        color: colors[index % colors.length]
    })).filter(item => item.value > 0);

    if (rawData.length === 0) return null;

    const chartData = {
        labels: rawData.map(item => item.label),
        datasets: [
            {
                data: rawData.map(item => item.value),
                backgroundColor: rawData.map(item => item.color),
                borderRadius: 6, // Chart.js sütun köşelerini yumuşatma
                borderWidth: 0,
                barPercentage: 0.6, // Sütun kalınlıklarını modernize etme
                hoverBackgroundColor: rawData.map((item, idx) => colors[idx % colors.length].replace('0.8', '1')), // Hover olunca koyu/tam renk
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                titleFont: { family: 'Inter, sans-serif' },
                bodyFont: { family: 'Inter, sans-serif', size: 14, weight: 'bold' },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        return `${context.parsed.y.toLocaleString('tr-TR')} ₺`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.04)', // Tema border uyumu
                    drawBorder: false,
                },
                ticks: {
                    font: { family: 'Inter, sans-serif', size: 11 },
                    color: '#475569',
                    callback: function (value) {
                        return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value;
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    font: { family: 'Inter, sans-serif', size: 11 },
                    color: '#475569'
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ height: 250, width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
}
