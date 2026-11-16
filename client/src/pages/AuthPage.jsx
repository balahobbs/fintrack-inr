import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (isRegister ? register(form) : login({ email: form.email, password: form.password }));
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-intro">
        <h1>FinTrack</h1>
        <p>Log what comes in and goes out, set monthly limits, and see where your money actually goes.</p>
      </div>
      <form className="panel auth-form" onSubmit={submit}>
        <h2>{isRegister ? 'Create your account' : 'Sign in'}</h2>
        {isRegister && (
          <label>Name <input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
        )}
        <label>Email <input type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label>Password
          <input type="password" required minLength={8} value={form.password} onChange={set('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={busy}>{isRegister ? 'Create account' : 'Sign in'}</button>
        <p className="swap">
          {isRegister ? <>Already have an account? <Link to="/login">Sign in</Link></> : <>New to FinTrack? <Link to="/register">Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
