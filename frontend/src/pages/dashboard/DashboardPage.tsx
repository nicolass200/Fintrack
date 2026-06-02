import { useEffect, useState } from "react";
import { dashboardService } from "../../api/dashboardService";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import type { DashboardSummary } from "../../types/dashboard";

const dashboardText = {
  pt: {
    title: "Dashboard",
    welcome: "Bem-vindo",
    loading: "Carregando resumo financeiro...",
    loadError: "Erro ao carregar resumo financeiro",
    income: "Receitas",
    expense: "Despesas",
    balance: "Saldo",
    registeredIncome: "Receitas registradas",
    registeredExpense: "Despesas registradas",
    positiveBalance: "Saldo positivo",
    negativeBalance: "Saldo negativo",
    pendingExpense: "Despesas a pagar",
    pendingIncome: "Receitas a receber",
    pendingExpenses: "Despesas pendentes",
    pendingIncomes: "Receitas pendentes",
    expensesByCategory: "Despesas por categoria",
    noExpenses: "Nenhuma despesa cadastrada ainda.",
    latestTransactions: "Últimas movimentações",
    noTransactions: "Nenhum lançamento financeiro cadastrado ainda.",
    monthlyPerformance: "Desempenho mensal",
    monthlySummary: "Resumo mensal",
    gains: "Receitas",
    expenses: "Despesas",
    incomeType: "Receita",
    expenseType: "Despesa",
    received: "Recebido",
    receivable: "A receber",
    paid: "Pago",
    payable: "A pagar",
  },
  en: {
    title: "Dashboard",
    welcome: "Welcome",
    loading: "Loading financial summary...",
    loadError: "Error loading financial summary",
    income: "Income",
    expense: "Expenses",
    balance: "Balance",
    registeredIncome: "Registered inflows",
    registeredExpense: "Registered outflows",
    positiveBalance: "Positive balance",
    negativeBalance: "Negative balance",
    pendingExpense: "Expenses to pay",
    pendingIncome: "Income to receive",
    pendingExpenses: "Pending expenses",
    pendingIncomes: "Pending income",
    expensesByCategory: "Expenses by category",
    noExpenses: "No expenses registered yet.",
    latestTransactions: "Latest transactions",
    noTransactions: "No financial entries registered yet.",
    monthlyPerformance: "Monthly performance",
    monthlySummary: "Monthly summary",
    gains: "Income",
    expenses: "Expenses",
    incomeType: "Income",
    expenseType: "Expense",
    received: "Received",
    receivable: "To receive",
    paid: "Paid",
    payable: "To pay",
  },
};

function getLocale(language: "pt" | "en") {
  return language === "en" ? "en-US" : "pt-BR";
}

function formatCurrency(value: number, language: "pt" | "en") {
  return new Intl.NumberFormat(getLocale(language), {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string, language: "pt" | "en") {
  return new Intl.DateTimeFormat(getLocale(language), {
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatMonth(month: number, year: number, language: "pt" | "en") {
  const label = new Intl.DateTimeFormat(getLocale(language), {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return `${label}/${String(year).slice(-2)}`;
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

function getSettlementLabel(
  type: "INCOME" | "EXPENSE",
  isSettled: boolean,
  t: (typeof dashboardText)["pt"]
) {
  if (type === "INCOME") {
    return isSettled ? t.received : t.receivable;
  }

  return isSettled ? t.paid : t.payable;
}

function MonthlyPerformanceChart({
  monthlySummary,
  language,
  t,
}: {
  monthlySummary: DashboardSummary["monthlySummary"];
  language: "pt" | "en";
  t: (typeof dashboardText)["pt"];
}) {
  if (monthlySummary.length === 0) {
    return <p>{t.noTransactions}</p>;
  }

  const maxValue = Math.max(
    ...monthlySummary.map((month) => Math.max(month.income, month.expense)),
    1
  );

  return (
    <div className="monthly-performance">
      <div className="chart-legend">
        <span className="legend-item income-legend">{t.gains}</span>
        <span className="legend-item expense-legend">{t.expenses}</span>
      </div>

      <div className="monthly-bars">
        {monthlySummary.map((month) => (
          <article
            key={`${month.year}-${month.month}`}
            className="monthly-bar-card"
          >
            <span>{formatMonth(month.month, month.year, language)}</span>

            <div className="monthly-bar-line">
              <small>{t.gains}</small>
              <div className="chart-track">
                <div
                  className="chart-fill income-fill"
                  style={{
                    width: `${Math.max(4, (month.income / maxValue) * 100)}%`,
                  }}
                />
              </div>
              <strong>{formatCurrency(month.income, language)}</strong>
            </div>

            <div className="monthly-bar-line">
              <small>{t.expenses}</small>
              <div className="chart-track">
                <div
                  className="chart-fill expense-fill"
                  style={{
                    width: `${Math.max(4, (month.expense / maxValue) * 100)}%`,
                  }}
                />
              </div>
              <strong>{formatCurrency(month.expense, language)}</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, token } = useAuth();
  const { language } = useLanguage();
  const t = dashboardText[language];

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
            : t.loadError
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
  }, [token, t.loadError]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{t.title}</h1>
          <p>
            {t.welcome}, {user?.name}.
          </p>
        </div>
      </header>

      {isLoading && (
        <section className="dashboard-placeholder">
          <p>{t.loading}</p>
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
              <span>{t.income}</span>
              <strong>{formatCurrency(summary.totalIncome, language)}</strong>
              <small>{t.registeredIncome}</small>
            </article>

            <article className="summary-card metric-card expense-card">
              <span>{t.expense}</span>
              <strong>{formatCurrency(summary.totalExpense, language)}</strong>
              <small>{t.registeredExpense}</small>
            </article>

            <article className="summary-card metric-card highlight">
              <span>{t.balance}</span>
              <strong>{formatCurrency(summary.balance, language)}</strong>
              <small className={`balance-status ${getBalanceStatus(summary.balance)}`}>
                {summary.balance >= 0 ? t.positiveBalance : t.negativeBalance}
              </small>
            </article>
          </section>

          <section className="summary-grid pending-grid">
            <article className="summary-card metric-card pending-card">
              <span>{t.pendingExpense}</span>
              <strong>{formatCurrency(summary.pendingExpense, language)}</strong>
              <small>{t.pendingExpenses}</small>
            </article>

            <article className="summary-card metric-card receivable-card">
              <span>{t.pendingIncome}</span>
              <strong>{formatCurrency(summary.pendingIncome, language)}</strong>
              <small>{t.pendingIncomes}</small>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <h2>{t.expensesByCategory}</h2>

              {summary.expensesByCategory.length === 0 ? (
                <p>{t.noExpenses}</p>
              ) : (
                <ul className="data-list">
                  {summary.expensesByCategory.map((category) => {
                    const percent = Math.round(
                      (category.total / Math.max(summary.totalExpense, 1)) * 100
                    );

                    return (
                      <li key={category.categoryId} className="category-row">
                        <div>
                          <span>{category.categoryName}</span>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <strong>{formatCurrency(category.total, language)}</strong>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>

            <article className="dashboard-panel">
              <h2>{t.latestTransactions}</h2>

              {summary.latestTransactions.length === 0 ? (
                <p>{t.noTransactions}</p>
              ) : (
                <ul className="data-list">
                  {summary.latestTransactions.map((transaction) => (
                    <li key={transaction.id} className="list-item-with-actions">
                      <div>
                        <strong>{transaction.description}</strong>
                        <span>
                          {transaction.type === "INCOME"
                            ? t.incomeType
                            : t.expenseType}{" "}
                          | {transaction.category.name} |{" "}
                          {formatDate(transaction.date, language)}
                        </span>
                        <small>
                          {getSettlementLabel(
                            transaction.type,
                            transaction.isSettled,
                            t
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
                        {formatCurrency(transaction.amount, language)}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          <section className="dashboard-panel page-section">
            <h2>{t.monthlyPerformance}</h2>
            <MonthlyPerformanceChart
              monthlySummary={summary.monthlySummary}
              language={language}
              t={t}
            />
          </section>

          <section className="dashboard-panel page-section">
            <h2>{t.monthlySummary}</h2>

            {summary.monthlySummary.length === 0 ? (
              <p>{t.noTransactions}</p>
            ) : (
              <ul className="data-list">
                {summary.monthlySummary.map((month) => (
                  <li key={`${month.year}-${month.month}`} className="month-row">
                    <div>
                      <span>
                        {month.month}/{month.year}
                      </span>
                      <small>
                        {t.income} {formatCurrency(month.income, language)} |{" "}
                        {t.expense} {formatCurrency(month.expense, language)}
                      </small>
                    </div>

                    <strong
                      className={
                        month.balance >= 0 ? "income-value" : "expense-value"
                      }
                    >
                      {formatCurrency(month.balance, language)}
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
