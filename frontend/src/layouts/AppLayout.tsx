import { NavLink, Outlet } from "react-router-dom";
import {
  CirclePlus,
  Home,
  ReceiptText,
  UserCircle,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

const navigationItems = [
  {
    to: "/dashboard",
    label: { pt: "Início", en: "Home" },
    Icon: Home,
    end: false,
  },
  {
    to: "/transactions",
    label: { pt: "Extrato", en: "Statement" },
    Icon: ReceiptText,
    end: true,
  },
  {
    to: "/transactions/new",
    label: { pt: "Adicionar", en: "Add" },
    Icon: CirclePlus,
    end: false,
  },
  {
    to: "/budgets",
    label: { pt: "Orçamentos", en: "Budgets" },
    Icon: WalletCards,
    end: false,
  },
  {
    to: "/profile",
    label: { pt: "Perfil", en: "Profile" },
    Icon: UserCircle,
    end: false,
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const greeting = language === "en" ? "Hello" : "Olá";
  const logoutLabel = language === "en" ? "Sign out" : "Sair";

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div>
          <span className="app-logo">FinTrack</span>
          <p className="app-user">
            {greeting}, {user?.name}
          </p>
        </div>

        <nav className="app-nav">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <item.Icon aria-hidden="true" size={18} strokeWidth={2.2} />
              {item.label[language]}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={logout}>
          {logoutLabel}
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
            aria-label={item.label[language]}
          >
            <span>
              <item.Icon aria-hidden="true" size={22} strokeWidth={2.3} />
            </span>
            <small>{item.label[language]}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
