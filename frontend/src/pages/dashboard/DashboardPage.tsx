import { useEffect, useState } from "react";
import { dashboardService } from "../../api/dashboardService";
import { useAuth } from "../../hooks/useAuth";
import type { DashboardSummary } from "../../types/dashboard";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function DashboardPage() {
  const { user, token } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    dashboardService
      .summary(token)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setSummary(data);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar resumo financeiro"
        );
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Dashboard</h1>
          <p>Bem-vindo, {user?.name}.</p>
        </div>
      </header>

      {isLoading && (
        <section className="dashboard-placeholder">
          <p>Carregando resumo financeiro...</p>
        </section>
      )}

      {error && (
        <section className="dashboard-placeholder">
          <p className="form-error">{error}</p>
        </section>
      )}

      {!isLoading && !error && summary && (
        <>
          <section className="summary-grid">
            <article className="summary-card">
              <span>Receitas</span>
              <strong>{formatCurrency(summary.totalIncome)}</strong>
            </article>

            <article className="summary-card">
              <span>Despesas</span>
              <strong>{formatCurrency(summary.totalExpense)}</strong>
            </article>

            <article className="summary-card highlight">
              <span>Saldo</span>
              <strong>{formatCurrency(summary.balance)}</strong>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <h2>Despesas por categoria</h2>

              {summary.expensesByCategory.length === 0 ? (
                <p>Nenhuma despesa cadastrada ainda.</p>
              ) : (
                <ul className="data-list">
                  {summary.expensesByCategory.map((category) => (
                    <li key={category.categoryId}>
                      <span>{category.categoryName}</span>
                      <strong>{formatCurrency(category.total)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="dashboard-panel">
              <h2>Resumo mensal</h2>

              {summary.monthlySummary.length === 0 ? (
                <p>Nenhum lançamento financeiro cadastrado ainda.</p>
              ) : (
                <ul className="data-list">
                  {summary.monthlySummary.map((month) => (
                    <li key={`${month.year}-${month.month}`}>
                      <span>
                        {month.month}/{month.year}
                      </span>

                      <strong>{formatCurrency(month.balance)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}