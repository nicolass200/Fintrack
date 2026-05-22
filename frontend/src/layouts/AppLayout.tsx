import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div>
          <span className="app-logo">FinTrack</span>
          <p className="app-user">Olá, {user?.name}</p>
        </div>

        <nav className="app-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/categories">Categorias</NavLink>
          <NavLink to="/transactions">Transações</NavLink>
          <NavLink to="/budgets">Orçamentos</NavLink>
        </nav>

        <button type="button" className="logout-button" onClick={logout}>
          Sair
        </button>
      </aside>

      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}