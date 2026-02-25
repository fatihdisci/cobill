import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { dbService } from '../utils/dbService';
import { SEED_DATA } from '../utils/seedData';
import { encryptIBAN, decryptIBAN } from '../utils/cryptoUtils';
import { updateDebtReminder } from '../utils/notificationService';
import { sendInviteNotification } from '../utils/notificationService';
import { getTotalUserDebt } from '../utils/debtSimplification';

const AppContext = createContext(null);

const INITIAL_STATE = {
    currentUser: null,
    members: {},
    groups: [],
    expenses: [],
    settlements: [],
    invitations: [],
    settings: { reminderFrequency: 'never' }
};

function appReducer(state, action) {
    if (!state) return INITIAL_STATE;

    switch (action.type) {
        case 'INIT_DATA':
            return { ...state, ...action.payload };

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

        // Real-time Sync actions
        case 'SYNC_GROUPS':
            return { ...state, groups: action.payload };
        case 'SYNC_EXPENSES':
            return { ...state, expenses: action.payload };
        case 'SYNC_SETTLEMENTS':
            return { ...state, settlements: action.payload };
        case 'SYNC_INVITATIONS':
            return { ...state, invitations: action.payload };

        // Invitations
        case 'ACCEPT_INVITATION': {
            return {
                ...state,
                invitations: state.invitations.filter(inv => inv.id !== action.payload.invitationId),
            };
        }
        case 'REJECT_INVITATION': {
            return {
                ...state,
                invitations: state.invitations.filter(inv => inv.id !== action.payload),
            };
        }

        // Reset
        case 'RESET_DATA':
            return INITIAL_STATE;

        default:
            return state;
    }
}

export function AppProvider({ children, user }) {
    const [state, defaultDispatch] = useReducer(appReducer, INITIAL_STATE);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Initial Data Fetching from Firebase when fully authenticated
    useEffect(() => {
        let isMounted = true;
        let unsubGroups = null;
        let unsubExpenses = null;
        let unsubSettlements = null;
        let unsubInvitations = null;

        const loadFirebaseData = async () => {
            if (!user) {
                if (isMounted) {
                    defaultDispatch({ type: 'RESET_DATA' });
                    setIsDataLoaded(true);
                }
                return;
            }

            try {
                // If this is our local mock user, bypass Firebase DB fetching
                if (user.uid === 'test-user-id' || user.uid === 'demo-user-id') {
                    if (isMounted) {
                        const isDemo = user.uid === 'demo-user-id';

                        // Map 'm1' to user id in the seed data dynamically
                        const mockMembers = { ...SEED_DATA.members };
                        mockMembers[user.uid] = {
                            ...mockMembers.m1,
                            id: user.uid,
                            name: isDemo ? 'Demo Kullanıcısı' : 'Test Kullanıcısı',
                            email: isDemo ? 'demo@cobill.local' : 'test@cobill.local',
                            isPro: !isDemo // Demo user is NOT pro
                        };
                        delete mockMembers.m1;

                        const replaceM1 = (id) => id === 'm1' ? user.uid : id;

                        const mockGroups = SEED_DATA.groups.map(g => ({
                            ...g,
                            members: g.members.map(replaceM1)
                        }));

                        const mockExpenses = SEED_DATA.expenses.map(e => ({
                            ...e,
                            paidBy: replaceM1(e.paidBy),
                            splitAmong: e.splitAmong.map(replaceM1)
                        }));

                        const mockSettlements = SEED_DATA.settlements.map(s => ({
                            ...s,
                            from: replaceM1(s.from),
                            to: replaceM1(s.to)
                        }));

                        defaultDispatch({
                            type: 'INIT_DATA',
                            payload: {
                                currentUser: user.uid,
                                members: mockMembers,
                                groups: mockGroups,
                                expenses: mockExpenses,
                                settlements: mockSettlements,
                                invitations: []
                            }
                        });
                        setIsDataLoaded(true);
                    }
                    return;
                }

                // 1. Fetch current user from DB (to get isPro, phone, etc.)
                let currentUserData = await dbService.getUser(user.uid);
                if (!currentUserData) {
                    // Fallback create if not exists (e.g. they registered but doc failed)
                    currentUserData = {
                        id: user.uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        isPro: false,
                        isGhost: false
                    };
                    await dbService.saveUser(currentUserData);
                } else if (currentUserData.iban) {
                    currentUserData.iban = decryptIBAN(currentUserData.iban);
                }

                // 2. Fetch all groups for this user (one-shot for fast initial load)
                const groups = await dbService.getGroupsForUser(user.uid);
                const groupIds = groups.map(g => g.id);

                // 3. Collect all unique member IDs across these groups
                const allMemberIds = new Set([user.uid]);
                groups.forEach(g => {
                    g.members?.forEach(mId => allMemberIds.add(mId));
                });

                // 4. Fetch all user data for these members
                let membersObj = {};
                if (allMemberIds.size > 0) {
                    membersObj = await dbService.getUsersByIds(Array.from(allMemberIds));
                    // Decrypt IBANs for local state
                    Object.values(membersObj).forEach(m => {
                        if (m.iban) m.iban = decryptIBAN(m.iban);
                    });
                } else {
                    membersObj = { [user.uid]: currentUserData };
                }

                // 5. Fetch expenses, settlements, and invitations for these groups (one-shot)
                let expenses = [];
                let settlements = [];
                if (groupIds.length > 0) {
                    expenses = await dbService.getExpensesForGroups(groupIds);
                    settlements = await dbService.getSettlementsForGroups(groupIds);
                }
                const invitations = await dbService.getInvitationsForUser(user.uid);

                // Initialize State
                if (isMounted) {
                    defaultDispatch({
                        type: 'INIT_DATA',
                        payload: {
                            currentUser: user.uid,
                            members: membersObj,
                            groups,
                            expenses,
                            settlements,
                            invitations,
                            settings: currentUserData.settings || { reminderFrequency: 'never', language: 'TR' }
                        }
                    });
                    setIsDataLoaded(true);

                    // ═══ Set up real-time listeners after initial load ═══
                    unsubGroups = dbService.subscribeToGroups(user.uid, (liveGroups) => {
                        if (isMounted) {
                            defaultDispatch({ type: 'SYNC_GROUPS', payload: liveGroups });
                            // Also re-fetch members for any new group members
                            const newMemberIds = new Set();
                            liveGroups.forEach(g => g.members?.forEach(mId => newMemberIds.add(mId)));
                            dbService.getUsersByIds(Array.from(newMemberIds)).then(newMembers => {
                                if (isMounted) {
                                    Object.values(newMembers).forEach(m => {
                                        if (m.iban) m.iban = decryptIBAN(m.iban);
                                    });
                                    // Merge with existing members
                                    Object.entries(newMembers).forEach(([id, member]) => {
                                        defaultDispatch({ type: 'ADD_MEMBER', payload: { id, ...member } });
                                    });
                                }
                            });

                            // Re-subscribe expenses/settlements with updated groupIds
                            const liveGroupIds = liveGroups.map(g => g.id);
                            if (unsubExpenses) unsubExpenses();
                            unsubExpenses = dbService.subscribeToExpenses(liveGroupIds, (liveExpenses) => {
                                if (isMounted) defaultDispatch({ type: 'SYNC_EXPENSES', payload: liveExpenses });
                            });
                            if (unsubSettlements) unsubSettlements();
                            unsubSettlements = dbService.subscribeToSettlements(liveGroupIds, (liveSettlements) => {
                                if (isMounted) defaultDispatch({ type: 'SYNC_SETTLEMENTS', payload: liveSettlements });
                            });
                        }
                    });

                    // Subscribe to invitations
                    let knownInvitationIds = new Set(invitations.map(inv => inv.id));
                    unsubInvitations = dbService.subscribeToInvitations(user.uid, (liveInvitations) => {
                        if (isMounted) {
                            defaultDispatch({ type: 'SYNC_INVITATIONS', payload: liveInvitations });
                            // Fire local notification for truly NEW invitations
                            liveInvitations.forEach(inv => {
                                if (!knownInvitationIds.has(inv.id)) {
                                    sendInviteNotification(inv.groupName, inv.invitedByName);
                                }
                            });
                            knownInvitationIds = new Set(liveInvitations.map(inv => inv.id));
                        }
                    });
                }
            } catch (error) {
                console.error("Error loading data from Firebase:", error);
                // Fallback to empty state on error to unblock UI
                setIsDataLoaded(true);
            }
        };

        setIsDataLoaded(false);
        loadFirebaseData();

        return () => {
            isMounted = false;
            if (unsubGroups) unsubGroups();
            if (unsubExpenses) unsubExpenses();
            if (unsubSettlements) unsubSettlements();
            if (unsubInvitations) unsubInvitations();
        };
    }, [user]);

    // Wrapper dispatch to intercept actions and route them to Firestore asynchronously
    const dispatch = async (action) => {
        // Optimistic update locally immediately
        defaultDispatch(action);

        // If mock user, do NOT attempt to sync with Firebase
        if (state.currentUser === 'test-user-id') return;

        // Async side effects to Firestore (Failures will log to console, but could be enhanced)
        try {
            switch (action.type) {
                // Groups
                case 'ADD_GROUP':
                case 'UPDATE_GROUP':
                    await dbService.saveGroup(action.payload);
                    break;
                case 'DELETE_GROUP':
                    await dbService.deleteGroup(action.payload);
                    break;

                // Members (Ghost members or updating real profile)
                case 'ADD_MEMBER':
                case 'UPDATE_MEMBER': {
                    const memberToSave = { ...action.payload };
                    if (memberToSave.iban) {
                        memberToSave.iban = encryptIBAN(memberToSave.iban);
                    }
                    await dbService.saveUser(memberToSave);
                    break;
                }
                case 'ADD_MEMBER_TO_GROUP':
                case 'REMOVE_MEMBER_FROM_GROUP': {
                    // We need to re-save the group since its member array changed
                    const targetGroup = state.groups.find(g => g.id === action.payload.groupId);
                    if (targetGroup) {
                        // Recalculate members locally to save accurate payload
                        const updatedMembers = action.type === 'ADD_MEMBER_TO_GROUP'
                            ? [...targetGroup.members, action.payload.memberId]
                            : targetGroup.members.filter(id => id !== action.payload.memberId);

                        await dbService.saveGroup({ ...targetGroup, members: updatedMembers });
                    }
                    break;
                }

                // Expenses
                case 'ADD_EXPENSE':
                case 'UPDATE_EXPENSE':
                    await dbService.saveExpense(action.payload);
                    break;
                case 'DELETE_EXPENSE':
                    await dbService.deleteExpense(action.payload);
                    break;

                // Settlements
                case 'ADD_SETTLEMENT':
                    await dbService.saveSettlement(action.payload);
                    break;
                case 'MARK_SETTLEMENT_PAID': {
                    const targetSettlement = state.settlements.find(s => s.id === action.payload);
                    if (targetSettlement) {
                        await dbService.saveSettlement({ ...targetSettlement, status: 'paid', paidAt: new Date().toISOString() });
                    }
                    break;
                }

                // Invitations
                case 'ACCEPT_INVITATION': {
                    const { invitationId, invitation } = action.payload;
                    await dbService.updateInvitationStatus(invitationId, 'accepted');
                    // Also add the user to the group
                    if (invitation && invitation.groupId) {
                        const grp = state.groups.find(g => g.id === invitation.groupId);
                        if (grp && !grp.members.includes(state.currentUser)) {
                            await dbService.saveGroup({ ...grp, members: [...grp.members, state.currentUser] });
                        }
                    }
                    break;
                }
                case 'REJECT_INVITATION':
                    await dbService.updateInvitationStatus(action.payload, 'rejected');
                    break;

                default:
                    // No firebase action needed for others like UPDATE_SETTINGS, INIT_DATA, SYNC_*
                    break;
            }
        } catch (error) {
            console.error("Firestore sync error:", error);
            alert("İşlem başarısız, lütfen internet bağlantınızı kontrol edin.");
        }
    };

    // Debt Reminder Automation
    useEffect(() => {
        if (!state.currentUser || !isDataLoaded) return;
        const totalDebt = getTotalUserDebt(state);
        const frequency = state.settings?.reminderFrequency || 'never';
        updateDebtReminder(frequency, totalDebt);
    }, [state.expenses, state.settings?.reminderFrequency, isDataLoaded]);

    const value = { state, dispatch, isDataLoaded };

    // Prevent rendering children until initial data from Firebase is hydrated (if user exists)
    if (user && !isDataLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted">Verileriniz Senkronize Ediliyor...</div>
            </div>
        );
    }

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
