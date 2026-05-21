import { useAuth } from "../../hooks/useAuth";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Dashboard</h1>
          <p>Bem-vindo, {user?.name}.</p>
        </div>

        <button type="button" className="secondary-button" onClick={logout}>
          Sair
        </button>
      </header>

      <section className="dashboard-placeholder">
        <h2>Resumo financeiro</h2>
        <p>
          A próxima etapa será conectar esta tela ao endpoint
          <strong> /dashboard/summary</strong>.
        </p>
      </section>
    </main>
  );
}