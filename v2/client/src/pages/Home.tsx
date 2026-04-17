import { useAuth } from '../lib/auth';

export function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="home-shell">
      <header className="home-header">
        <h1 className="brand">Karrie's Kitchen</h1>
        <div className="user-chip">
          <span>{user?.name}</span>
          <button className="link-btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="home-main">
        <input
          type="search"
          className="search"
          placeholder="Search recipes…"
          aria-label="Search recipes"
        />
        <p className="placeholder">
          Sprint 0 skeleton. Recipes, browse, and cook flows arrive in Sprint 1.
        </p>
      </main>
    </div>
  );
}
