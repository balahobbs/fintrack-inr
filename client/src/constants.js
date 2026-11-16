export const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transport', 'Utilities', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];
export const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
