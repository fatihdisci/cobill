import { useRef, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Override chart defaults for dark theme
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';

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

    const labels = Object.keys(categoryTotals).map(k => CATEGORIES[k]?.label || k);
    const data = Object.values(categoryTotals);
    const colors = [
        '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
        '#f43f5e', '#3b82f6', '#ec4899', '#14b8a6', '#64748b'
    ];

    if (data.length === 0) return null;

    return (
        <div style={{ maxWidth: 280, margin: '0 auto' }}>
            <Doughnut
                data={{
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: colors.slice(0, data.length),
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: 'white',
                        spacing: 2,
                    }],
                }}
                options={{
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 12,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: { size: 11, family: 'Inter' },
                            },
                        },
                        tooltip: {
                            backgroundColor: '#1a2035',
                            titleFont: { family: 'Inter', weight: 600 },
                            bodyFont: { family: 'Inter' },
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: (ctx) => {
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const pct = ((ctx.raw / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${ctx.raw.toLocaleString('tr-TR')} (${pct}%)`;
                                }
                            }
                        },
                    },
                }}
            />
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

    const labels = Object.keys(memberTotals);
    const data = Object.values(memberTotals);

    if (data.length === 0) return null;

    return (
        <Bar
            data={{
                labels,
                datasets: [{
                    label: 'Harcama',
                    data,
                    backgroundColor: data.map((_, i) => {
                        const colors = [
                            'rgba(139, 92, 246, 0.6)',
                            'rgba(6, 182, 212, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(245, 158, 11, 0.6)',
                            'rgba(244, 63, 94, 0.6)',
                            'rgba(59, 130, 246, 0.6)',
                        ];
                        return colors[i % colors.length];
                    }),
                    borderColor: data.map((_, i) => {
                        const colors = [
                            'rgba(139, 92, 246, 0.9)',
                            'rgba(6, 182, 212, 0.9)',
                            'rgba(16, 185, 129, 0.9)',
                            'rgba(245, 158, 11, 0.9)',
                            'rgba(244, 63, 94, 0.9)',
                            'rgba(59, 130, 246, 0.9)',
                        ];
                        return colors[i % colors.length];
                    }),
                    borderWidth: 1,
                    borderRadius: 6,
                }],
            }}
            options={{
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a2035',
                        titleFont: { family: 'Inter', weight: 600 },
                        bodyFont: { family: 'Inter' },
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 11 } },
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            callback: (v) => v.toLocaleString('tr-TR'),
                        },
                    },
                },
            }}
        />
    );
}
