import { useState } from 'react';
import api from '../api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { errorMessage, today } from '../utils';

export default function TransactionForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, date: initial.date.slice(0, 10) }
      : { type: 'expense', amount: '', category: 'Food', description: '', date: today() }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setType = (type) =>
    setForm((f) => ({ ...f, type, category: (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { ...form, amount: Number(form.amount) };
      if (initial) await api.put(`/transactions/${initial._id}`, body);
      else await api.post('/transactions', body);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel form-grid" onSubmit={submit}>
      <div className="segmented" role="group" aria-label="Transaction type">
        {['expense', 'income'].map((t) => (
          <button type="button" key={t} className={form.type === t ? `on ${t}` : ''} onClick={() => setType(t)}>
            {t === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>
      <label>Amount
        <input type="number" step="0.01" min="0.01" required value={form.amount} onChange={set('amount')} />
      </label>
      <label>Category
        <select value={form.category} onChange={set('category')}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>Date
        <input type="date" required value={form.date} onChange={set('date')} />
      </label>
      <label className="wide">Description
        <input type="text" maxLength={200} value={form.description} onChange={set('description')} placeholder="Optional" />
      </label>
      {error && <p className="error wide">{error}</p>}
      <div className="actions wide">
        <button className="btn primary" disabled={saving}>{initial ? 'Save changes' : 'Add transaction'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
