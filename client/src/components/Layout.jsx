import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">FinTrack</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/budgets">Budgets</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span className="who">{user.name}</span>
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
