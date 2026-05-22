export function BudgetsPage() {
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Orçamentos</h1>
          <p>Controle o limite mensal e acompanhe alertas de gastos.</p>
        </div>
      </header>

      <section className="dashboard-placeholder">
        <h2>Orçamentos e alertas</h2>
        <p>
          A próxima etapa será conectar esta tela aos endpoints
          <strong> /budgets</strong> e <strong>/budgets/alerts</strong>.
        </p>
      </section>
    </main>
  );
}