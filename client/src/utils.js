const currency = import.meta.env.VITE_CURRENCY || 'INR';
const locale = import.meta.env.VITE_LOCALE || 'en-IN';

const money = new Intl.NumberFormat(locale, { style: 'currency', currency });
export const formatMoney = (n) => money.format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const monthLabel = (ym) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString(locale, { month: 'short', timeZone: 'UTC' });

export const thisMonth = () => new Date().toISOString().slice(0, 7);
export const today = () => new Date().toISOString().slice(0, 10);
export const errorMessage = (err) => err.response?.data?.message || 'Could not reach the server. Try again.';
