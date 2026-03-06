/**
 * CoBill — Currency Utilities
 * 
 * Live exchange rates, caching, and currency formatting.
 */
import i18n from '../i18n';

const CACHE_KEY = 'cobill_exchange_rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const CURRENCY_SYMBOLS = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: 'C$',
    AUD: 'A$',
    SEK: 'kr',
    NOK: 'kr',
};

const CURRENCY_NAMES = {
    TRY: i18n.t('currencies.TRY'),
    USD: i18n.t('currencies.USD'),
    EUR: i18n.t('currencies.EUR'),
    GBP: i18n.t('currencies.GBP'),
    JPY: i18n.t('currencies.JPY'),
    CHF: i18n.t('currencies.CHF'),
    CAD: i18n.t('currencies.CAD'),
    AUD: i18n.t('currencies.AUD'),
};

// Default fallback rates (approximate, used when API is unavailable)
const FALLBACK_RATES = {
    TRY: 1,
    USD: 0.029,
    EUR: 0.027,
    GBP: 0.023,
    JPY: 4.35,
    CHF: 0.026,
    CAD: 0.04,
    AUD: 0.046,
};

/**
 * Get cached rates or fetch fresh ones
 */
export async function getExchangeRates(baseCurrency = 'TRY') {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { rates, timestamp, base } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL && base === baseCurrency) {
                return rates;
            }
        }

        const response = await fetch(
            `https://api.frankfurter.app/latest?from=${baseCurrency}`
        );

        if (!response.ok) throw new Error('API failed');

        const data = await response.json();
        const rates = { [baseCurrency]: 1, ...data.rates };

        localStorage.setItem(CACHE_KEY, JSON.stringify({
            rates,
            timestamp: Date.now(),
            base: baseCurrency
        }));

        return rates;
    } catch (error) {
        console.warn('Exchange rate fetch failed, using fallback rates:', error);
        return FALLBACK_RATES;
    }
}

/**
 * Convert currency amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (fromCurrency === toCurrency) return amount;
    if (!rates) return amount;

    // Convert to base first (TRY), then to target
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;

    return (amount / fromRate) * toRate;
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount, currency = 'TRY') {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = Math.abs(amount).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const sign = amount < 0 ? '-' : '';
    return `${sign}${symbol}${formatted}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency) {
    return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Get supported currencies list
 */
export function getSupportedCurrencies() {
    return Object.entries(CURRENCY_NAMES).map(([code, name]) => ({
        code,
        name,
        symbol: CURRENCY_SYMBOLS[code]
    }));
}
