import React from 'react';

export default function StatsGrid({ stats }) {
    return (
        <div className="grid grid-4 mb-xl mobile-scroller">
            {stats.map((stat, i) => (
                <div key={i} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
                    <div className="stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
                        {stat.icon}
                    </div>
                    <div className="stat-value" style={{
                        background: stat.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {stat.value}
                    </div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
