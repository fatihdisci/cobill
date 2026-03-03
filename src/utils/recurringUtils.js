// src/utils/recurringUtils.js

// Gets today's date in local time as "YYYY-MM-DD"
export function getLocalTodayString() {
    const d = new Date();
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
}

// Safely add one month to a date string (YYYY-MM-DD)
// Handles JS overflow where Jan 31 + 1 month = Mar 3. Instead clamps to Feb 28/29.
export function addOneMonthSafely(dateString) {
    if (!dateString) return null;

    // Split explicitly to avoid UTC mismatch returning the prior day
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    if (!yearStr || !monthStr || !dayStr) return null;

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-based
    const day = parseInt(dayStr, 10);

    const date = new Date(year, month, day);
    const currentMonth = date.getMonth();

    // Add 1 month
    date.setMonth(currentMonth + 1);

    const expectedMonth = (currentMonth + 1) % 12;

    if (date.getMonth() !== expectedMonth) {
        // Overflow detected (e.g., Jan 31 -> Mar 3). Clamp it to the last day of the intended month.
        // Setting day to 0 goes to the last day of the previous month.
        date.setDate(0);
    }

    // Format back to YYYY-MM-DD safely
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');

    return `${newY}-${newM}-${newD}`;
}

// Returns a filtered array of expenses that are due today or overdue
export function getPendingRecurringExpenses(expenses) {
    if (!expenses || expenses.length === 0) return [];

    const todayStr = getLocalTodayString();

    return expenses.filter(expense => {
        if (expense.isRecurring !== true || !expense.nextRecurringDate) return false;

        // Lexicographical comparison works perfectly for YYYY-MM-DD
        return todayStr >= expense.nextRecurringDate;
    });
}
