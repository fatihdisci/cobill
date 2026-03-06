/**
 * dateFilterUtils.js
 * 
 * Provides utility functions for filtering arrays by date ranges
 * and predefined preset date periods (e.g. '1w', '1m', '3m').
 */
import i18n from '../i18n';

export const MONTH_NAMES = [
    i18n.t('months.january'), i18n.t('months.february'), i18n.t('months.march'),
    i18n.t('months.april'), i18n.t('months.may'), i18n.t('months.june'),
    i18n.t('months.july'), i18n.t('months.august'), i18n.t('months.september'),
    i18n.t('months.october'), i18n.t('months.november'), i18n.t('months.december')
];

/**
 * Get start and end Date objects for a specific month and year.
 * @param {number} year - Full year (e.g. 2024)
 * @param {number} month - 0-indexed month (0 = Jan, 11 = Dec)
 * @returns {object} { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
 */
export const getMonthRange = (year, month) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // Last day of the month

    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    };
};

/**
 * Returns { startDate, endDate } for common requested ranges.
 * @param {string} preset - '1w', '1m', '3m', 'all'
 * @returns {object|null}
 */
export const getDateRange = (preset) => {
    if (preset === 'all' || !preset) return { startDate: null, endDate: null };

    const end = new Date();
    const start = new Date();

    switch (preset) {
        case '1w':
            start.setDate(end.getDate() - 7);
            break;
        case '1m':
            start.setMonth(end.getMonth() - 1);
            break;
        case '3m':
            start.setMonth(end.getMonth() - 3);
            break;
        default:
            return { startDate: null, endDate: null };
    }

    // Format to YYYY-MM-DD
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    };
};

/**
 * Filter an array of objects by a date range.
 * @param {Array} items - Array of objects containing a date field
 * @param {string} startDate - 'YYYY-MM-DD'
 * @param {string} endDate - 'YYYY-MM-DD'
 * @param {string} dateField - Key for the date property in the object (default: 'date')
 * @returns {Array} Filtered list
 */
export const filterByDateRange = (items, startDate, endDate, dateField = 'date') => {
    if (!startDate && !endDate) return items;

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max safe date

    // Set End Date to the very end of that day to include all expenses
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    return items.filter(item => {
        if (!item[dateField]) return true; // If no date, assume it matches or depends on your logic
        const itemDate = new Date(item[dateField]);
        return itemDate >= start && itemDate <= end;
    });
};
