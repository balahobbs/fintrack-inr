import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { errorMessage, formatDate, formatMoney, monthLabel, thisMonth } from '../utils';

const COLORS = ['#1F5C58', '#3F7CAC', '#C23B57', '#E0A030', '#7A5C99', '#2F8F5B', '#8C9A9F', '#B5651D', '#4A6670'];

export default function Dashboard() {
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([api.get('/analytics/summary', { params: { month } }), api.get('/transactions', { params: { limit: 5 } })])
      .then(([s, t]) => { setData(s.data); setRecent(t.data.items); })
      .catch((e) => setError(errorMessage(e)));
  }, [month]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="center-note">Loading dashboard…</p>;

  const empty = data.income === 0 && data.expense === 0;

  return (
    <>
      <header className="page-head">
        <h1>Dashboard</h1>
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
      </header>

      <section className="hero">
        <div>
          <span className="hero-label">Balance this month</span>
          <div className={`hero-amount ${data.balance < 0 ? 'neg' : ''}`}>{formatMoney(data.balance)}</div>
        </div>
        <dl className="hero-side">
          <div><dt>Income</dt><dd className="pos">{formatMoney(data.income)}</dd></div>
          <div><dt>Spent</dt><dd className="neg">{formatMoney(data.expense)}</dd></div>
          <div><dt>Savings rate</dt><dd>{data.savingsRate}%</dd></div>
        </dl>
      </section>

      {empty && <p className="panel empty">Nothing recorded for this month yet. Add your first transaction from the Transactions page.</p>}

      <div className="grid-2">
        <section className="panel">
          <h2>Income vs spending, last 6 months</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthly.map((m) => ({ ...m, name: monthLabel(m.month) }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D5DDE0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={56} />
              <Tooltip formatter={(v) => formatMoney(v)} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#2F8F5B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expense" name="Spending" fill="#C23B57" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <h2>Spending by category</h2>
          {data.byCategory.length === 0 ? (
            <p className="muted">No spending recorded this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.byCategory} dataKey="total" nameKey="category" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {data.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className="panel">
        <h2>Latest transactions</h2>
        {recent.length === 0 ? <p className="muted">No transactions yet.</p> : (
          <ul className="recent">
            {recent.map((t) => (
              <li key={t._id}>
                <div><strong>{t.description || t.category}</strong><span className="muted"> {t.category} · {formatDate(t.date)}</span></div>
                <span className={t.type === 'income' ? 'pos' : 'neg'}>{t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
