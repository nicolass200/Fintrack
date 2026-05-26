import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navigationItems = [
  { to: "/dashboard", label: "Inicio", icon: "In", end: false },
  { to: "/transactions", label: "Extrato", icon: "Ex", end: true },
  { to: "/transactions/new", label: "Adicionar", icon: "+", end: false },
  { to: "/budgets", label: "Orcamentos", icon: "$", end: false },
  { to: "/profile", label: "Perfil", icon: "Eu", end: false },
];

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
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={logout}>
          Sair
        </button>
      </aside>

      <div className="app-content">
        <Outlet />
      </div>

      <nav className="bottom-nav" aria-label="Navegacao principal">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={item.to === "/transactions/new" ? "bottom-nav-add" : ""}
            aria-label={item.label}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
