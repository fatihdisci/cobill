import { db } from '../config/firebase';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, where
} from 'firebase/firestore';

export const dbService = {
    // Users
    getUser: async (userId) => {
        if (!userId) return null;
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null; // For ghosts or missing users
    },

    // Get strictly by email (for searching existing app users)
    getUserByEmail: async (email) => {
        if (!email) return null;
        const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
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
        if (!userObj || !userObj.id) return;
        await setDoc(doc(db, 'users', userObj.id), userObj, { merge: true });
    },

    // Groups
    getGroupsForUser: async (userId) => {
        if (!userId) return [];
        // Requires a query where members array contains userId
        const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
        const querySnapshot = await getDocs(q);
        const groups = [];
        querySnapshot.forEach((doc) => {
            groups.push({ id: doc.id, ...doc.data() });
        });
        return groups;
    },

    saveGroup: async (groupObj) => {
        if (!groupObj || !groupObj.id) return;
        await setDoc(doc(db, 'groups', groupObj.id), groupObj, { merge: true });
    },

    deleteGroup: async (groupId) => {
        await deleteDoc(doc(db, 'groups', groupId));
    },

    // Expenses
    getExpensesForGroups: async (groupIds) => {
        if (!groupIds || groupIds.length === 0) return [];
        // Due to limits, "in" queries max out at 10. We chunk if necessary, but keep it simple for now
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

        // Sort descending by date
        return allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    saveExpense: async (expenseObj) => {
        if (!expenseObj || !expenseObj.id) return;
        await setDoc(doc(db, 'expenses', expenseObj.id), expenseObj, { merge: true });
    },

    deleteExpense: async (expenseId) => {
        await deleteDoc(doc(db, 'expenses', expenseId));
    },

    // Settlements
    getSettlementsForGroups: async (groupIds) => {
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
    },

    saveSettlement: async (settlementObj) => {
        if (!settlementObj || !settlementObj.id) return;
        await setDoc(doc(db, 'settlements', settlementObj.id), settlementObj, { merge: true });
    }
};
