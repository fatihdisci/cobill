/**
 * CoBill — Debt Simplification Algorithm
 * 
 * Uses a greedy approach to minimize the number of transactions
 * needed to settle all debts within a group.
 */

/**
 * Calculate net balances for each member in a group
 * Positive = is owed money (creditor)
 * Negative = owes money (debtor)
 */
export function calculateBalances(expenses, members) {
    const balances = {};

    // Initialize all member balances to 0
    members.forEach(m => {
        balances[m.id] = 0;
    });

    expenses.forEach(expense => {
        const { paidBy, amount, splitAmong, splitType } = expense;

        if (!splitAmong || splitAmong.length === 0) return;

        // Person who paid gets credit
        balances[paidBy] = (balances[paidBy] || 0) + amount;

        if (splitType === 'equal') {
            const share = amount / splitAmong.length;
            splitAmong.forEach(memberId => {
                balances[memberId] = (balances[memberId] || 0) - share;
            });
        } else if (splitType === 'custom') {
            // splitAmong is array of { memberId, amount }
            splitAmong.forEach(split => {
                balances[split.memberId] = (balances[split.memberId] || 0) - split.amount;
            });
        } else if (splitType === 'percentage') {
            splitAmong.forEach(split => {
                const share = (amount * split.percentage) / 100;
                balances[split.memberId] = (balances[split.memberId] || 0) - share;
            });
        }
    });

    return balances;
}

/**
 * Simplify debts using a greedy algorithm
 * Returns minimum number of transactions to settle all debts
 */
export function simplifyDebts(balances) {
    // Filter out zero balances
    const entries = Object.entries(balances)
        .map(([id, amount]) => ({ id, amount: Math.round(amount * 100) / 100 }))
        .filter(e => Math.abs(e.amount) > 0.01);

    const creditors = entries.filter(e => e.amount > 0).sort((a, b) => b.amount - a.amount);
    const debtors = entries.filter(e => e.amount < 0).sort((a, b) => a.amount - b.amount);

    const transactions = [];

    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];
        const settleAmount = Math.min(creditor.amount, Math.abs(debtor.amount));

        if (settleAmount > 0.01) {
            transactions.push({
                from: debtor.id,
                to: creditor.id,
                amount: Math.round(settleAmount * 100) / 100
            });
        }

        creditor.amount -= settleAmount;
        debtor.amount += settleAmount;

        if (Math.abs(creditor.amount) < 0.01) i++;
        if (Math.abs(debtor.amount) < 0.01) j++;
    }

    return transactions;
}

/**
 * Get total number of naive transactions (without simplification)
 */
export function getNaiveTransactionCount(expenses) {
    const pairs = new Set();
    expenses.forEach(expense => {
        const { paidBy, splitAmong } = expense;
        if (!splitAmong) return;
        const members = Array.isArray(splitAmong[0]) || typeof splitAmong[0] === 'string'
            ? splitAmong
            : splitAmong.map(s => s.memberId || s);
        members.forEach(memberId => {
            if (memberId !== paidBy) {
                pairs.add(`${memberId}->${paidBy}`);
            }
        });
    });
    return pairs.size;
}

/**
 * Calculate individual member statistics
 */
export function getMemberStats(memberId, expenses) {
    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach(expense => {
        if (expense.paidBy === memberId) {
            totalPaid += expense.amount;
        }
        const splitMembers = Array.isArray(expense.splitAmong[0]) || typeof expense.splitAmong[0] === 'string'
            ? expense.splitAmong
            : expense.splitAmong.map(s => s.memberId || s);

        if (splitMembers.includes(memberId)) {
            if (expense.splitType === 'equal') {
                totalOwed += expense.amount / splitMembers.length;
            }
        }
    });

    return {
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
    };
}
