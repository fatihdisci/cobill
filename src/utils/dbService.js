import { db } from '../config/firebase';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where, onSnapshot, orderBy, addDoc
} from 'firebase/firestore';

export const dbService = {
    // Users
    getUser: async (userId) => {
        try {
            if (!userId) return null;
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error in getUser:', error);
            return null;
        }
    },

    // Get strictly by email (for searching existing app users)
    getUserByEmail: async (email) => {
        try {
            if (!email) return null;
            const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error in getUserByEmail:', error);
            return null;
        }
    },

    // Will fetch multiple users by IDs
    getUsersByIds: async (userIds) => {
        if (!userIds || userIds.length === 0) return {};
        const usersObj = {};
        for (const id of userIds) {
            const user = await dbService.getUser(id);
            if (user) {
                usersObj[id] = user;
            }
        }
        return usersObj;
    },

    // Save/Update user
    saveUser: async (userObj) => {
        try {
            if (!userObj || !userObj.id) return;
            await setDoc(doc(db, 'users', userObj.id), userObj, { merge: true });
        } catch (error) {
            console.error('Error in saveUser:', error);
        }
    },

    // Anonymize user (Ghost User) — App Store Compliance
    anonymizeUser: async (userId) => {
        try {
            if (!userId) return;
            const ghostData = {
                name: 'Silinmiş Kullanıcı', // This line is intended to be changed by the user's instruction.
                email: 'deleted@cobill.app',
                iban: '',
                phone: '',
                avatarId: 1,
                isGhost: true,
                preferences: {}
            };
            await setDoc(doc(db, 'users', userId), ghostData, { merge: true });
        } catch (error) {
            console.error('Error in anonymizeUser:', error);
        }
    },

    // Groups
    getGroupsForUser: async (userId) => {
        try {
            if (!userId) return [];
            const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
            const querySnapshot = await getDocs(q);
            const groups = [];
            querySnapshot.forEach((doc) => {
                groups.push({ id: doc.id, ...doc.data() });
            });
            return groups;
        } catch (error) {
            console.error('Error in getGroupsForUser:', error);
            return [];
        }
    },

    saveGroup: async (groupObj) => {
        try {
            if (!groupObj || !groupObj.id) return;
            await setDoc(doc(db, 'groups', groupObj.id), groupObj, { merge: true });
        } catch (error) {
            console.error('Error in saveGroup:', error);
        }
    },

    deleteGroup: async (groupId) => {
        try {
            await deleteDoc(doc(db, 'groups', groupId));
        } catch (error) {
            console.error('Error in deleteGroup:', error);
        }
    },

    // Expenses
    getExpensesForGroups: async (groupIds) => {
        try {
            if (!groupIds || groupIds.length === 0) return [];
            const chunks = [];
            for (let i = 0; i < groupIds.length; i += 10) {
                chunks.push(groupIds.slice(i, i + 10));
            }

            const allExpenses = [];
            for (const chunk of chunks) {
                const q = query(collection(db, 'expenses'), where('groupId', 'in', chunk));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    allExpenses.push({ id: doc.id, ...doc.data() });
                });
            }

            return allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error in getExpensesForGroups:', error);
            return [];
        }
    },

    saveExpense: async (expenseObj) => {
        try {
            if (!expenseObj || !expenseObj.id) return;
            await setDoc(doc(db, 'expenses', expenseObj.id), expenseObj, { merge: true });
        } catch (error) {
            console.error('Error in saveExpense:', error);
        }
    },

    deleteExpense: async (expenseId) => {
        try {
            await deleteDoc(doc(db, 'expenses', expenseId));
        } catch (error) {
            console.error('Error in deleteExpense:', error);
        }
    },

    // Settlements
    getSettlementsForGroups: async (groupIds) => {
        try {
            if (!groupIds || groupIds.length === 0) return [];
            const chunks = [];
            for (let i = 0; i < groupIds.length; i += 10) {
                chunks.push(groupIds.slice(i, i + 10));
            }

            const allSettlements = [];
            for (const chunk of chunks) {
                const q = query(collection(db, 'settlements'), where('groupId', 'in', chunk));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    allSettlements.push({ id: doc.id, ...doc.data() });
                });
            }
            return allSettlements;
        } catch (error) {
            console.error('Error in getSettlementsForGroups:', error);
            return [];
        }
    },

    saveSettlement: async (settlementObj) => {
        try {
            if (!settlementObj || !settlementObj.id) return;
            await setDoc(doc(db, 'settlements', settlementObj.id), settlementObj, { merge: true });
        } catch (error) {
            console.error('Error in saveSettlement:', error);
        }
    },

    // ═══════════════ Real-Time Subscriptions (onSnapshot) ═══════════════

    subscribeToGroups: (userId, callback) => {
        if (!userId) return () => { };
        const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
        return onSnapshot(q, (snapshot) => {
            const groups = [];
            snapshot.forEach((doc) => { groups.push({ id: doc.id, ...doc.data() }); });
            callback(groups);
        }, (error) => console.error('Groups listener error:', error));
    },

    subscribeToExpenses: (groupIds, callback) => {
        if (!groupIds || groupIds.length === 0) { callback([]); return () => { }; }
        // Firestore 'in' queries limited to 30, chunk if needed
        const unsubscribers = [];
        const chunks = [];
        for (let i = 0; i < groupIds.length; i += 10) {
            chunks.push(groupIds.slice(i, i + 10));
        }

        const resultsMap = {};
        chunks.forEach((chunk, idx) => {
            const q = query(collection(db, 'expenses'), where('groupId', 'in', chunk));
            const unsub = onSnapshot(q, (snapshot) => {
                const expenses = [];
                snapshot.forEach((doc) => { expenses.push({ id: doc.id, ...doc.data() }); });
                resultsMap[idx] = expenses;
                // Merge all chunks and callback
                const all = Object.values(resultsMap).flat().sort((a, b) => new Date(b.date) - new Date(a.date));
                callback(all);
            }, (error) => console.error('Expenses listener error:', error));
            unsubscribers.push(unsub);
        });

        return () => unsubscribers.forEach(u => u());
    },

    subscribeToSettlements: (groupIds, callback) => {
        if (!groupIds || groupIds.length === 0) { callback([]); return () => { }; }
        const unsubscribers = [];
        const chunks = [];
        for (let i = 0; i < groupIds.length; i += 10) {
            chunks.push(groupIds.slice(i, i + 10));
        }

        const resultsMap = {};
        chunks.forEach((chunk, idx) => {
            const q = query(collection(db, 'settlements'), where('groupId', 'in', chunk));
            const unsub = onSnapshot(q, (snapshot) => {
                const settlements = [];
                snapshot.forEach((doc) => { settlements.push({ id: doc.id, ...doc.data() }); });
                resultsMap[idx] = settlements;
                callback(Object.values(resultsMap).flat());
            }, (error) => console.error('Settlements listener error:', error));
            unsubscribers.push(unsub);
        });

        return () => unsubscribers.forEach(u => u());
    },

    subscribeToInvitations: (userId, callback) => {
        if (!userId) return () => { };
        const q = query(
            collection(db, 'invitations'),
            where('invitedUserId', '==', userId),
            where('status', '==', 'pending')
        );
        return onSnapshot(q, (snapshot) => {
            const invitations = [];
            snapshot.forEach((doc) => { invitations.push({ id: doc.id, ...doc.data() }); });
            callback(invitations);
        }, (error) => console.error('Invitations listener error:', error));
    },

    // ═══════════════ Invitation CRUD ═══════════════

    createInvitation: async (invitationObj) => {
        try {
            if (!invitationObj) return;
            const docRef = await addDoc(collection(db, 'invitations'), invitationObj);
            return docRef.id;
        } catch (error) {
            console.error('Error in createInvitation:', error);
            return null;
        }
    },

    updateInvitationStatus: async (invitationId, status) => {
        try {
            if (!invitationId) return;
            await updateDoc(doc(db, 'invitations', invitationId), { status });
        } catch (error) {
            console.error('Error in updateInvitationStatus:', error);
        }
    },

    getInvitationsForUser: async (userId) => {
        try {
            if (!userId) return [];
            const q = query(
                collection(db, 'invitations'),
                where('invitedUserId', '==', userId),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(q);
            const invitations = [];
            snapshot.forEach((doc) => { invitations.push({ id: doc.id, ...doc.data() }); });
            return invitations;
        } catch (error) {
            console.error('Error in getInvitationsForUser:', error);
            return [];
        }
    },

    // ═══════════════ Personal Expenses CRUD ═══════════════

    addPersonalExpense: async (expenseData) => {
        try {
            if (!expenseData) return null;
            const docRef = await addDoc(collection(db, 'personal_expenses'), expenseData);
            return docRef.id;
        } catch (error) {
            console.error('Error in addPersonalExpense:', error);
            return null;
        }
    },

    savePersonalExpense: async (expenseData) => {
        try {
            if (!expenseData || !expenseData.id) return;
            await setDoc(doc(db, 'personal_expenses', expenseData.id), expenseData, { merge: true });
        } catch (error) {
            console.error('Error in savePersonalExpense:', error);
        }
    },

    deletePersonalExpense: async (id) => {
        try {
            if (!id) return;
            await deleteDoc(doc(db, 'personal_expenses', id));
        } catch (error) {
            console.error('Error in deletePersonalExpense:', error);
        }
    },

    subscribeToPersonalExpenses: (userId, callback) => {
        if (!userId) return () => { };
        const q = query(
            collection(db, 'personal_expenses'),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const expenses = [];
            snapshot.forEach((d) => { expenses.push({ id: d.id, ...d.data() }); });
            callback(expenses);
        }, (error) => console.error('Personal expenses listener error:', error));
    },
};
