import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { EXPENSE_CATEGORIES } from '../constants';
import { errorMessage, formatMoney, thisMonth } from '../utils';

export default function Budgets() {
  const [month, setMonth] = useState(thisMonth());
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: EXPENSE_CATEGORIES[0], limit: '' });
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/budgets', { params: { month } }).then((r) => setBudgets(r.data)).catch((e) => setError(errorMessage(e)));
  }, [month]);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/budgets', { ...form, limit: Number(form.limit), month });
      setForm((f) => ({ ...f, limit: '' }));
      load();
    } catch (err) { setError(errorMessage(err)); }
  };

  const remove = async (id) => {
    try { await api.delete(`/budgets/${id}`); load(); } catch (err) { setError(errorMessage(err)); }
  };

  return (
    <>
      <header className="page-head">
        <h1>Budgets</h1>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
      </header>

      <form className="panel form-inline" onSubmit={save}>
        <label>Category
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Monthly limit
          <input type="number" min="1" step="0.01" required value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} />
        </label>
        <button className="btn primary">Save budget</button>
      </form>
      {error && <p className="error">{error}</p>}

      {budgets.length === 0 ? (
        <p className="panel empty">No budgets for this month. Set a limit above to start tracking a category.</p>
      ) : (
        <div className="budget-list">
          {budgets.map((b) => {
            const pct = Math.min((b.spent / b.limit) * 100, 100);
            const over = b.spent > b.limit;
            return (
              <article className="panel budget" key={b._id}>
                <div className="budget-top">
                  <strong>{b.category}</strong>
                  <button className="link danger" onClick={() => remove(b._id)}>Remove</button>
                </div>
                <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                  <div className={over ? 'fill over' : pct > 80 ? 'fill warn' : 'fill'} style={{ width: `${pct}%` }} />
                </div>
                <p className="budget-meta">
                  {formatMoney(b.spent)} of {formatMoney(b.limit)}
                  {over ? <span className="neg"> · {formatMoney(b.spent - b.limit)} over</span> : <span className="muted"> · {formatMoney(b.limit - b.spent)} left</span>}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
