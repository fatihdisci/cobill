import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { getDateRange, getMonthRange, MONTH_NAMES } from '../utils/dateFilterUtils';
const PRESETS = [
    { key: 'all', label: 'Tümü' },
    { key: '1w', label: '1 Hafta' },
    { key: '1m', label: '1 Ay' },
    { key: '3m', label: '3 Ay' },
];
/**
 * DateFilterBar — shared filter strip for CoBill pages.
 * 
 * Props:
 *  - onChange({ startDate, endDate }) — called whenever filter changes
 *  - defaultPreset — initial preset key (default: 'all')
 */
export default function DateFilterBar({ onChange, defaultPreset = 'all' }) {
    const [activePreset, setActivePreset] = useState(defaultPreset);
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const handlePreset = (key) => {
        setActivePreset(key);
        setShowCustom(false);
        setSelectedMonth('');
        setSelectedYear('');
        setCustomStart('');
        setCustomEnd('');
        onChange(getDateRange(key));
    };
    const handleMonthYear = (month, year) => {
        if (month !== '' && year !== '') {
            setActivePreset(null);
            setShowCustom(false);
            setCustomStart('');
            setCustomEnd('');
            onChange(getMonthRange(parseInt(year), parseInt(month)));
        }
    };
    const handleCustomApply = () => {
        if (customStart && customEnd) {
            setActivePreset(null);
            setSelectedMonth('');
            setSelectedYear('');
            onChange({ startDate: customStart, endDate: customEnd });
        }
    };
    return (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
            {/* Preset Chips + Month/Year */}
            <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                {PRESETS.map(p => (
                    <button
                        key={p.key}
                        className={`btn btn-sm ${activePreset === p.key ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handlePreset(p.key)}
                        style={{ fontSize: '0.78rem', padding: '5px 12px', minHeight: '32px', borderRadius: '20px' }}
                    >
                        {p.label}
                    </button>
                ))}
                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'var(--border-primary)', margin: '0 4px' }} />
                {/* Month selector */}
                <select
                    className="form-select"
                    value={selectedMonth}
                    onChange={e => {
                        setSelectedMonth(e.target.value);
                        handleMonthYear(e.target.value, selectedYear || currentYear.toString());
                        if (!selectedYear) setSelectedYear(currentYear.toString());
                    }}
                    style={{ minWidth: '100px', fontSize: '0.78rem', padding: '5px 8px', minHeight: '32px', borderRadius: '20px' }}
                >
                    <option value="">Ay</option>
                    {MONTH_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                    ))}
                </select>
                {/* Year selector */}
                <select
                    className="form-select"
                    value={selectedYear}
                    onChange={e => {
                        setSelectedYear(e.target.value);
                        if (selectedMonth !== '') handleMonthYear(selectedMonth, e.target.value);
                    }}
                    style={{ minWidth: '80px', fontSize: '0.78rem', padding: '5px 8px', minHeight: '32px', borderRadius: '20px' }}
                >
                    <option value="">Yıl</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'var(--border-primary)', margin: '0 4px' }} />
                {/* Custom range toggle */}
                <button
                    className={`btn btn-sm ${showCustom ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowCustom(!showCustom)}
                    style={{ fontSize: '0.78rem', padding: '5px 12px', minHeight: '32px', borderRadius: '20px', gap: '4px' }}
                >
                    <Calendar size={14} /> Aralık
                </button>
            </div>
            {/* Custom date range row */}
            {showCustom && (
                <div className="flex items-center gap-sm mt-md animate-fade-in" style={{ flexWrap: 'wrap' }}>
                    <input
                        type="date"
                        className="form-input"
                        value={customStart}
                        onChange={e => setCustomStart(e.target.value)}
                        style={{ fontSize: '0.78rem', padding: '5px 8px', minHeight: '32px', maxWidth: '160px', borderRadius: '12px' }}
                    />
                    <span className="text-sm text-muted">—</span>
                    <input
                        type="date"
                        className="form-input"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        style={{ fontSize: '0.78rem', padding: '5px 8px', minHeight: '32px', maxWidth: '160px', borderRadius: '12px' }}
                    />
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleCustomApply}
                        disabled={!customStart || !customEnd}
                        style={{ fontSize: '0.78rem', padding: '5px 14px', minHeight: '32px', borderRadius: '20px' }}
                    >
                        Uygula
                    </button>
                </div>
            )}
        </div>
    );
}
