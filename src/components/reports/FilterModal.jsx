import React from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import DateFilterBar from '../DateFilterBar';
import { getDateRange } from '../../utils/dateFilterUtils';

export default function FilterModal({ isOpen, onClose, dateFilter, onDateFilterChange, t }) {
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            transition: 'opacity 200ms ease, visibility 200ms ease',
        }}>
            <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                padding: 'var(--space-xl)', maxHeight: '75vh', overflowY: 'auto',
                transform: isOpen ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 300ms ease',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SlidersHorizontal size={18} /> {t('reports.filter')}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => onDateFilterChange(getDateRange('all'))} style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: '30px' }}>
                            <RotateCcw size={12} /> {t('reports.reset')}
                        </button>
                        <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ width: '30px', height: '30px', minHeight: '30px', padding: 0 }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <div style={{ width: 40, height: 4, borderRadius: 'var(--radius-full)', background: 'var(--border-secondary)', margin: '-12px auto var(--space-lg)' }} />

                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('reports.dateSelection')}
                    </div>
                    <DateFilterBar onChange={onDateFilterChange} defaultPreset="all" />
                </div>

                <button className="btn btn-primary w-full" onClick={onClose} style={{ padding: '12px', fontSize: '1rem', fontWeight: 700, borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-md)' }}>
                    {t('reports.showResults')}
                </button>
            </div>
        </div>,
        document.body
    );
}
