/**
 * CoBill — Seed Data
 * Pre-populated demo data to showcase all features on first load
 */

import { generateId } from './helpers';

const now = new Date();
const today = now.toISOString();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

// Members
const members = {
    m1: { id: 'm1', name: 'Ayşe Yılmaz', email: 'ayse@example.com', isGhost: false, phone: '', iban: 'TR12 3456 7890 1234 5678 9012 34', isPro: true },
    m2: { id: 'm2', name: 'Burak Kaya', email: 'burak@example.com', isGhost: false, phone: '', iban: 'TR98 7654 3210 9876 5432 1098 76' },
    m3: { id: 'm3', name: 'Cem Demir', email: '', isGhost: true, phone: '', iban: 'TR11 2233 4455 6677 8899 0011 22' },
    m4: { id: 'm4', name: 'Deniz Acar', email: 'deniz@example.com', isGhost: true, phone: '', iban: 'TR33 4455 6677 8899 0011 2233 44' },
    m5: { id: 'm5', name: 'Elif Şen', email: 'elif@example.com', isGhost: false, phone: '', iban: 'TR55 6677 8899 0011 2233 4455 66' },
    m6: { id: 'm6', name: 'Fatih Öz', email: '', isGhost: true, phone: '', iban: 'TR77 8899 0011 2233 4455 6677 88' },
};

// Groups
const groups = [
    {
        id: 'g1',
        name: '🏢 Ofis Masrafları',
        description: 'Ortak ofis giderleri',
        currency: 'TRY',
        members: ['m1', 'm2', 'm3', 'm4'],
        createdAt: daysAgo(30),
        color: '#8b5cf6',
    },
    {
        id: 'g2',
        name: '🏠 Ev Arkadaşları',
        description: 'Kira, faturalar ve market',
        currency: 'TRY',
        members: ['m1', 'm5', 'm6'],
        createdAt: daysAgo(60),
        color: '#06b6d4',
    },
    {
        id: 'g3',
        name: '✈️ İstanbul Tatili',
        description: 'Hafta sonu tatil masrafları',
        currency: 'EUR',
        members: ['m1', 'm2', 'm5'],
        createdAt: daysAgo(10),
        color: '#10b981',
    },
];

// Expenses
const expenses = [
    // Ofis Masrafları
    {
        id: 'e1', groupId: 'g1', description: 'Öğle yemeği - Pizza',
        amount: 480, currency: 'TRY', paidBy: 'm1',
        splitAmong: ['m1', 'm2', 'm3', 'm4'], splitType: 'equal',
        category: 'food', date: daysAgo(1), isRecurring: false,
    },
    {
        id: 'e2', groupId: 'g1', description: 'Ofis kırtasiye',
        amount: 350, currency: 'TRY', paidBy: 'm2',
        splitAmong: ['m1', 'm2', 'm3', 'm4'], splitType: 'equal',
        category: 'shopping', date: daysAgo(3), isRecurring: false,
    },
    {
        id: 'e3', groupId: 'g1', description: 'Taksi - Müşteri ziyareti',
        amount: 220, currency: 'TRY', paidBy: 'm3',
        splitAmong: ['m1', 'm3'], splitType: 'equal',
        category: 'transport', date: daysAgo(5), isRecurring: false,
    },
    {
        id: 'e4', groupId: 'g1', description: 'İnternet faturası',
        amount: 600, currency: 'TRY', paidBy: 'm1',
        splitAmong: ['m1', 'm2', 'm3', 'm4'], splitType: 'equal',
        category: 'internet', date: daysAgo(7), isRecurring: true, recurringDay: 15,
    },
    {
        id: 'e5', groupId: 'g1', description: 'Kahve & çay malzemeleri',
        amount: 180, currency: 'TRY', paidBy: 'm4',
        splitAmong: ['m1', 'm2', 'm3', 'm4'], splitType: 'equal',
        category: 'food', date: daysAgo(2), isRecurring: false,
    },

    // Ev Arkadaşları
    {
        id: 'e6', groupId: 'g2', description: 'Kira - Şubat',
        amount: 15000, currency: 'TRY', paidBy: 'm1',
        splitAmong: ['m1', 'm5', 'm6'], splitType: 'equal',
        category: 'rent', date: daysAgo(4), isRecurring: true, recurringDay: 1,
    },
    {
        id: 'e7', groupId: 'g2', description: 'Elektrik faturası',
        amount: 850, currency: 'TRY', paidBy: 'm5',
        splitAmong: ['m1', 'm5', 'm6'], splitType: 'equal',
        category: 'bills', date: daysAgo(6), isRecurring: false,
    },
    {
        id: 'e8', groupId: 'g2', description: 'Market alışverişi',
        amount: 1200, currency: 'TRY', paidBy: 'm6',
        splitAmong: ['m1', 'm5', 'm6'], splitType: 'equal',
        category: 'shopping', date: daysAgo(1), isRecurring: false,
    },

    // İstanbul Tatili
    {
        id: 'e9', groupId: 'g3', description: 'Otel (2 gece)',
        amount: 450, currency: 'EUR', paidBy: 'm2',
        splitAmong: ['m1', 'm2', 'm5'], splitType: 'equal',
        category: 'rent', date: daysAgo(8), isRecurring: false,
    },
    {
        id: 'e10', groupId: 'g3', description: 'Akşam yemeği - Balık restoran',
        amount: 180, currency: 'EUR', paidBy: 'm1',
        splitAmong: ['m1', 'm2', 'm5'], splitType: 'equal',
        category: 'food', date: daysAgo(9), isRecurring: false,
    },
    {
        id: 'e11', groupId: 'g3', description: 'Müze biletleri',
        amount: 75, currency: 'EUR', paidBy: 'm5',
        splitAmong: ['m1', 'm2', 'm5'], splitType: 'equal',
        category: 'entertainment', date: daysAgo(9), isRecurring: false,
    },
];

// Settlements (some already paid)
const settlements = [
    {
        id: 's1', groupId: 'g1', from: 'm3', to: 'm1',
        amount: 200, currency: 'TRY', status: 'paid',
        date: daysAgo(2), paidAt: daysAgo(1),
    },
];

export const SEED_DATA = {
    members,
    groups,
    expenses,
    settlements,
    currentUser: 'm1',
    settings: {
        defaultCurrency: 'TRY',
        language: 'tr',
    },
};
