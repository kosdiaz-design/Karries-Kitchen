import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const PROFILES: { id: string; name: string }[] = [
  { id: 'karrie', name: 'Karrie' },
  { id: 'eric', name: 'Eric' }
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await login(selected, pin);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1 className="brand">Karrie's Kitchen</h1>
        {!selected && (
          <div className="profile-row">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                className="profile-btn"
                onClick={() => setSelected(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
        {selected && (
          <form onSubmit={submit} className="pin-form">
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setSelected(null);
                setPin('');
                setError(null);
              }}
            >
              ← Not {PROFILES.find((p) => p.id === selected)?.name}?
            </button>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={pin}
              placeholder="PIN"
              onChange={(e) => setPin(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={busy || !pin}>
              {busy ? '…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
