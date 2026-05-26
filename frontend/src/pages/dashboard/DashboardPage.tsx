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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(value));
}

function getBalanceStatus(balance: number) {
  if (balance > 0) {
    return "positivo";
  }

  if (balance < 0) {
    return "negativo";
  }

  return "neutro";
}

function getSettlementLabel(type: "INCOME" | "EXPENSE", isSettled: boolean) {
  if (type === "INCOME") {
    return isSettled ? "Recebido" : "A receber";
  }

  return isSettled ? "Pago" : "A pagar";
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
            <article className="summary-card metric-card income-card">
              <span>Receitas</span>
              <strong>{formatCurrency(summary.totalIncome)}</strong>
              <small>Entradas registradas</small>
            </article>

            <article className="summary-card metric-card expense-card">
              <span>Despesas</span>
              <strong>{formatCurrency(summary.totalExpense)}</strong>
              <small>Saidas registradas</small>
            </article>

            <article className="summary-card metric-card highlight">
              <span>Saldo</span>
              <strong>{formatCurrency(summary.balance)}</strong>
              <small className={`balance-status ${getBalanceStatus(summary.balance)}`}>
                {summary.balance >= 0 ? "Fluxo positivo" : "Fluxo negativo"}
              </small>
            </article>
          </section>

          <section className="summary-grid pending-grid">
            <article className="summary-card metric-card pending-card">
              <span>A pagar</span>
              <strong>{formatCurrency(summary.pendingExpense)}</strong>
              <small>Despesas pendentes</small>
            </article>

            <article className="summary-card metric-card receivable-card">
              <span>A receber</span>
              <strong>{formatCurrency(summary.pendingIncome)}</strong>
              <small>Receitas pendentes</small>
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
                    <li key={category.categoryId} className="category-row">
                      <div>
                        <span>{category.categoryName}</span>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                (category.total /
                                  Math.max(summary.totalExpense, 1)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <strong>{formatCurrency(category.total)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="dashboard-panel">
              <h2>Ultimas movimentacoes</h2>

              {summary.latestTransactions.length === 0 ? (
                <p>Nenhum lancamento financeiro cadastrado ainda.</p>
              ) : (
                <ul className="data-list">
                  {summary.latestTransactions.map((transaction) => (
                    <li key={transaction.id} className="list-item-with-actions">
                      <div>
                        <strong>{transaction.description}</strong>
                        <span>
                          {transaction.type === "INCOME" ? "Ganho" : "Gasto"} |{" "}
                          {transaction.category.name} | {formatDate(transaction.date)}
                        </span>
                        <small>
                          {getSettlementLabel(
                            transaction.type,
                            transaction.isSettled
                          )}
                          {transaction.paymentMethod
                            ? ` | ${transaction.paymentMethod}`
                            : ""}
                          {transaction.account ? ` | ${transaction.account}` : ""}
                        </small>
                      </div>

                      <strong
                        className={
                          transaction.type === "INCOME"
                            ? "income-value"
                            : "expense-value"
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          <section className="dashboard-panel page-section">
            <h2>Resumo mensal</h2>

            {summary.monthlySummary.length === 0 ? (
              <p>Nenhum lancamento financeiro cadastrado ainda.</p>
            ) : (
              <ul className="data-list">
                {summary.monthlySummary.map((month) => (
                  <li key={`${month.year}-${month.month}`} className="month-row">
                    <div>
                      <span>
                        {month.month}/{month.year}
                      </span>
                      <small>
                        Receitas {formatCurrency(month.income)} | Despesas{" "}
                        {formatCurrency(month.expense)}
                      </small>
                    </div>

                    <strong
                      className={
                        month.balance >= 0 ? "income-value" : "expense-value"
                      }
                    >
                      {formatCurrency(month.balance)}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
