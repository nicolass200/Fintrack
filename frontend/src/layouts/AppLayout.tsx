import { NavLink, Outlet } from "react-router-dom";
import {
  CirclePlus,
  Home,
  ReceiptText,
  UserCircle,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navigationItems = [
  { to: "/dashboard", label: "Início", Icon: Home, end: false },
  { to: "/transactions", label: "Extrato", Icon: ReceiptText, end: true },
  { to: "/transactions/new", label: "Adicionar", Icon: CirclePlus, end: false },
  { to: "/budgets", label: "Orçamentos", Icon: WalletCards, end: false },
  { to: "/profile", label: "Perfil", Icon: UserCircle, end: false },
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
              <item.Icon aria-hidden="true" size={18} strokeWidth={2.2} />
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

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={item.to === "/transactions/new" ? "bottom-nav-add" : ""}
            aria-label={item.label}
          >
            <span>
              <item.Icon aria-hidden="true" size={22} strokeWidth={2.3} />
            </span>
            <small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
