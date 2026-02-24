import { createContext, useContext, useReducer, useEffect } from 'react';
import { SEED_DATA } from '../utils/seedData';
import { updateDebtReminder } from '../utils/notificationService';
import { getTotalUserDebt } from '../utils/debtSimplification';

const AppContext = createContext(null);

const STORAGE_KEY = 'cobill_data';

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);

            // Ensure currentUser has isPro defined
            if (parsed.members && parsed.currentUser && parsed.members[parsed.currentUser]) {
                if (parsed.members[parsed.currentUser].isPro === undefined) {
                    parsed.members[parsed.currentUser].isPro = false;
                }
            }

            return parsed;
        }
    } catch (e) {
        console.warn('Failed to load state:', e);
    }
    return SEED_DATA;
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

function appReducer(state, action) {
    switch (action.type) {
        // Groups
        case 'ADD_GROUP':
            return { ...state, groups: [...state.groups, action.payload] };
        case 'UPDATE_GROUP':
            return {
                ...state,
                groups: state.groups.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g),
            };
        case 'DELETE_GROUP':
            return {
                ...state,
                groups: state.groups.filter(g => g.id !== action.payload),
                expenses: state.expenses.filter(e => e.groupId !== action.payload),
                settlements: state.settlements.filter(s => s.groupId !== action.payload),
            };

        // Members
        case 'ADD_MEMBER':
            return {
                ...state,
                members: { ...state.members, [action.payload.id]: action.payload },
            };
        case 'UPDATE_MEMBER':
            return {
                ...state,
                members: {
                    ...state.members,
                    [action.payload.id]: { ...state.members[action.payload.id], ...action.payload },
                },
            };
        case 'ADD_MEMBER_TO_GROUP': {
            const group = state.groups.find(g => g.id === action.payload.groupId);
            if (!group || group.members.includes(action.payload.memberId)) return state;
            return {
                ...state,
                groups: state.groups.map(g =>
                    g.id === action.payload.groupId
                        ? { ...g, members: [...g.members, action.payload.memberId] }
                        : g
                ),
            };
        }
        case 'REMOVE_MEMBER_FROM_GROUP': {
            return {
                ...state,
                groups: state.groups.map(g =>
                    g.id === action.payload.groupId
                        ? { ...g, members: g.members.filter(id => id !== action.payload.memberId) }
                        : g
                ),
            };
        }

        // Expenses
        case 'ADD_EXPENSE':
            return { ...state, expenses: [action.payload, ...state.expenses] };
        case 'UPDATE_EXPENSE':
            return {
                ...state,
                expenses: state.expenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e),
            };
        case 'DELETE_EXPENSE':
            return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

        // Settlements
        case 'ADD_SETTLEMENT':
            return { ...state, settlements: [action.payload, ...state.settlements] };
        case 'MARK_SETTLEMENT_PAID':
            return {
                ...state,
                settlements: state.settlements.map(s =>
                    s.id === action.payload
                        ? { ...s, status: 'paid', paidAt: new Date().toISOString() }
                        : s
                ),
            };

        // Settings
        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };

        // Reset
        case 'RESET_DATA':
            return SEED_DATA;

        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, null, loadState);

    // Auto-save on every state change
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Debt Reminder Automation
    useEffect(() => {
        if (!state) return;
        const totalDebt = getTotalUserDebt(state);
        const frequency = state.settings?.reminderFrequency || 'never';
        updateDebtReminder(frequency, totalDebt);
    }, [state?.expenses, state?.settings?.reminderFrequency]);

    // Process recurring expenses on mount
    useEffect(() => {
        const today = new Date();
        const dayOfMonth = today.getDate();

        state.expenses
            .filter(e => e.isRecurring && e.recurringDay === dayOfMonth)
            .forEach(recurring => {
                // Check if already processed this month
                const thisMonth = `${today.getFullYear()}-${today.getMonth()}`;
                const alreadyProcessed = state.expenses.some(
                    e => !e.isRecurring &&
                        e.description === recurring.description &&
                        e.groupId === recurring.groupId &&
                        e.date?.startsWith(today.toISOString().slice(0, 7))
                );

                if (!alreadyProcessed) {
                    // Auto-generated recurring expenses are handled by the user seeing them as templates
                    console.log(`Recurring expense due: ${recurring.description}`);
                }
            });
    }, []);

    const value = { state, dispatch };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}

export default AppContext;
