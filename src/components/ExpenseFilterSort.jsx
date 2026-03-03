import { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, ArrowUpDown, Tag, User, X, Check, RotateCcw } from 'lucide-react';
import DateFilterBar from './DateFilterBar';
import { getDateRange, filterByDateRange } from '../utils/dateFilterUtils';

/**
 * Evrensel Masraf Filtreleme ve Sıralama Bileşeni
 */
export default function ExpenseFilterSort({
    expenses = [],
    categories = {},
    categoryKey = 'category',
    members = null,
    dateKey = 'date',
    amountKey = 'amount',
    enableDateFilter = false, // EKLENDI
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Sıralama state
    const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, amount-desc, amount-asc

    // Kategori filtre state
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [filterInitialized, setFilterInitialized] = useState(false);

    // PaidBy filtre state
    const [selectedMembers, setSelectedMembers] = useState(new Set());
    const [memberFilterInitialized, setMemberFilterInitialized] = useState(false);

    // Tarih filtre state
    const [dateFilter, setDateFilter] = useState(getDateRange('all')); // EKLENDİ

    // Mevcut benzersiz kategorileri bul
    const availableCategories = useMemo(() => {
        const cats = new Set();
        expenses.forEach(e => {
            if (e[categoryKey]) cats.add(e[categoryKey]);
        });
        return Array.from(cats);
    }, [expenses, categoryKey]);

    // Mevcut benzersiz ödeyenleri bul
    const availableMembers = useMemo(() => {
        if (!members) return [];
        const payers = new Set();
        expenses.forEach(e => {
            if (e.paidBy) payers.add(e.paidBy);
        });
        return Array.from(payers);
    }, [expenses, members]);

    // İlk açılışta tüm kategorileri seç
    if (!filterInitialized && availableCategories.length > 0) {
        setSelectedCategories(new Set(availableCategories));
        setFilterInitialized(true);
    }
    if (!memberFilterInitialized && availableMembers.length > 0) {
        setSelectedMembers(new Set(availableMembers));
        setMemberFilterInitialized(true);
    }

    const toggleCategory = useCallback((cat) => {
        setSelectedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    }, []);

    const toggleMember = useCallback((id) => {
        setSelectedMembers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectAllCategories = () => setSelectedCategories(new Set(availableCategories));
    const clearCategories = () => setSelectedCategories(new Set());
    const selectAllMembers = () => setSelectedMembers(new Set(availableMembers));
    const clearMembers = () => setSelectedMembers(new Set());

    const resetAll = () => {
        setSortBy('date-desc');
        setSelectedCategories(new Set(availableCategories));
        if (availableMembers.length > 0) setSelectedMembers(new Set(availableMembers));
        if (enableDateFilter) setDateFilter(getDateRange('all')); // EKLENDİ
    };

    // Aktif filtre sayısı
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (sortBy !== 'date-desc') count++;
        if (selectedCategories.size < availableCategories.length) count++;
        if (members && selectedMembers.size < availableMembers.length) count++;
        if (enableDateFilter && (dateFilter.startDate || dateFilter.endDate)) count++; // EKLENDİ
        return count;
    }, [sortBy, selectedCategories, availableCategories, selectedMembers, availableMembers, members, enableDateFilter, dateFilter]);

    // Filtreleme ve sıralama (useMemo ile optimize)
    const filteredExpenses = useMemo(() => {
        let result = expenses.filter(e => {
            // Kategori filtresi
            if (selectedCategories.size > 0 && !selectedCategories.has(e[categoryKey])) return false;
            if (selectedCategories.size === 0) return false;
            // PaidBy filtresi
            if (members && selectedMembers.size > 0 && !selectedMembers.has(e.paidBy)) return false;
            if (members && selectedMembers.size === 0) return false;
            return true;
        });

        // Tarih filtresi EKLENDİ
        if (enableDateFilter && dateFilter) {
            result = filterByDateRange(result, dateFilter.startDate, dateFilter.endDate, dateKey);
        }

        // Sıralama
        result.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a[dateKey]) - new Date(b[dateKey]);
                case 'date-desc':
                    return new Date(b[dateKey]) - new Date(a[dateKey]);
                case 'amount-asc':
                    return a[amountKey] - b[amountKey];
                case 'amount-desc':
                    return b[amountKey] - a[amountKey];
                default:
                    return new Date(b[dateKey]) - new Date(a[dateKey]);
            }
        });

        return result;
    }, [expenses, selectedCategories, selectedMembers, sortBy, members, categoryKey, dateKey, amountKey, enableDateFilter, dateFilter]);

    const sortOptions = [
        { value: 'date-desc', label: 'Yeni → Eski' },
        { value: 'date-asc', label: 'Eski → Yeni' },
        { value: 'amount-desc', label: 'Yüksek → Düşük' },
        { value: 'amount-asc', label: 'Düşük → Yüksek' },
    ];

    return {
        filteredExpenses,
        filterUI: (
            <div>
                {/* Trigger Button */}
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        minHeight: '36px',
                        fontSize: '0.82rem',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    <span>Filtrele</span>
                    {activeFilterCount > 0 && (
                        <span style={{
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 800,
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '2px',
                        }}>
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Filter Modal — always in DOM, visibility toggled via CSS */}
                {createPortal(
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        pointerEvents: isOpen ? 'auto' : 'none',
                        visibility: isOpen ? 'visible' : 'hidden',
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 200ms ease, visibility 200ms ease',
                    }}>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.3)',
                                transition: 'opacity 200ms ease',
                                opacity: isOpen ? 1 : 0,
                            }}
                        />
                        {/* Bottom Sheet */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                                padding: 'var(--space-xl)',
                                maxHeight: '75vh',
                                overflowY: 'auto',
                                boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
                                transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
                                transition: 'transform 300ms ease',
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <SlidersHorizontal size={18} /> Filtrele & Sırala
                                </h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={resetAll}
                                        style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '30px' }}
                                    >
                                        <RotateCcw size={12} /> Sıfırla
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => setIsOpen(false)}
                                        style={{ width: '30px', height: '30px', minHeight: '30px', padding: 0 }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Drag handle */}
                            <div style={{
                                width: 40, height: 4, borderRadius: 'var(--radius-full)',
                                background: 'var(--border-secondary)', margin: '-12px auto var(--space-lg)',
                            }} />

                            {/* Sort Section */}
                            <div style={{ marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <ArrowUpDown size={14} /> Sıralama
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {sortOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSortBy(opt.value)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: 'var(--radius-full)',
                                                border: sortBy === opt.value ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-secondary)',
                                                background: sortBy === opt.value ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)',
                                                color: sortBy === opt.value ? 'var(--accent-purple)' : 'var(--text-secondary)',
                                                fontWeight: sortBy === opt.value ? 700 : 500,
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                outline: 'none',
                                                WebkitTapHighlightColor: 'transparent',
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tarih Seçimi EKLENDİ */}
                            {enableDateFilter && (
                                <div style={{ marginBottom: 'var(--space-xl)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Tarih Seçimi
                                    </div>
                                    <DateFilterBar onChange={setDateFilter} defaultPreset="all" />
                                </div>
                            )}

                            {/* Category Section */}
                            <div style={{ marginBottom: members ? 'var(--space-xl)' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Tag size={14} /> Kategori
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={selectAllCategories} style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tümü</button>
                                        <span style={{ color: 'var(--border-secondary)' }}>|</span>
                                        <button onClick={clearCategories} style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Temizle</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {availableCategories.map(cat => {
                                        const catInfo = categories[cat];
                                        const isSelected = selectedCategories.has(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius-full)',
                                                    border: isSelected ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-secondary)',
                                                    background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)',
                                                    color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.15s ease',
                                                    outline: 'none',
                                                    WebkitTapHighlightColor: 'transparent',
                                                }}
                                            >
                                                {catInfo?.icon && <span>{catInfo.icon}</span>}
                                                <span>{catInfo?.label || cat}</span>
                                                {isSelected && <Check size={12} style={{ color: 'var(--accent-purple)' }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* PaidBy Section (optional) */}
                            {members && availableMembers.length > 0 && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <User size={14} /> Kim Ödedi?
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={selectAllMembers} style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tümü</button>
                                            <span style={{ color: 'var(--border-secondary)' }}>|</span>
                                            <button onClick={clearMembers} style={{ fontSize: '0.72rem', color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Temizle</button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {availableMembers.map(memberId => {
                                            const member = members[memberId];
                                            const isSelected = selectedMembers.has(memberId);
                                            return (
                                                <button
                                                    key={memberId}
                                                    onClick={() => toggleMember(memberId)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 'var(--radius-full)',
                                                        border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-secondary)',
                                                        background: isSelected ? 'rgba(8, 145, 178, 0.1)' : 'var(--bg-card)',
                                                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                                                        fontWeight: isSelected ? 600 : 400,
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.15s ease',
                                                        outline: 'none',
                                                        WebkitTapHighlightColor: 'transparent',
                                                    }}
                                                >
                                                    <span>{member?.name || memberId}</span>
                                                    {isSelected && <Check size={12} style={{ color: 'var(--accent-cyan)' }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Apply Button */}
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    width: '100%',
                                    marginTop: 'var(--space-xl)',
                                    minHeight: '44px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 700,
                                }}
                            >
                                <Check size={16} /> Uygula ({filteredExpenses.length} sonuç)
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        ),
        // Empty state component
        emptyState: filteredExpenses.length === 0 && expenses.length > 0 ? (
            <div style={{
                textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-xl)',
                color: 'var(--text-muted)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🔍</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)', fontSize: '0.95rem' }}>
                    Bu filtreye uygun masraf bulunamadı
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                    Filtre ayarlarını değiştirmeyi deneyin.
                </div>
            </div>
        ) : null,
    };
}

