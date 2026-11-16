import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import TransactionForm from '../components/TransactionForm';
import { ALL_CATEGORIES } from '../constants';
import { errorMessage, formatDate, formatMoney } from '../utils';

export default function Transactions() {
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], total: 0, pages: 1 });
  const [editing, setEditing] = useState(null); // null | 'new' | transaction
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    api.get('/transactions', { params }).then((r) => setResult(r.data)).catch((e) => setError(errorMessage(e)));
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k) => (e) => { setPage(1); setFilters((f) => ({ ...f, [k]: e.target.value })); };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.description || t.category}" (${formatMoney(t.amount)})?`)) return;
    try { await api.delete(`/transactions/${t._id}`); load(); } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <>
      <header className="page-head">
        <h1>Transactions</h1>
        <button className="btn primary" onClick={() => setEditing('new')}>Add transaction</button>
      </header>

      {editing && (
        <TransactionForm
          initial={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <div className="filters">
        <input placeholder="Search descriptions" value={filters.search} onChange={setFilter('search')} />
        <select value={filters.type} onChange={setFilter('type')}>
          <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select value={filters.category} onChange={setFilter('category')}>
          <option value="">All categories</option>
          {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="panel table-wrap">
        {result.items.length === 0 ? <p className="muted">No transactions match these filters.</p> : (
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th className="num">Amount</th><th></th></tr></thead>
            <tbody>
              {result.items.map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.description || <span className="muted">—</span>}</td>
                  <td>{t.category}</td>
                  <td className={`num ${t.type === 'income' ? 'pos' : 'neg'}`}>{t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}</td>
                  <td className="row-actions">
                    <button className="link" onClick={() => setEditing(t)}>Edit</button>
                    <button className="link danger" onClick={() => remove(t)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pager">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
        <span>Page {result.page || page} of {result.pages}</span>
        <button className="btn ghost" disabled={page >= result.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </>
  );
}
