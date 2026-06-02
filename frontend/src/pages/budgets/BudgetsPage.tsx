import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { budgetService } from "../../api/budgetService";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import type { Budget, BudgetAlert, BudgetAlertStatus } from "../../types/budget";

const budgetText = {
  pt: {
    title: "Orçamentos",
    subtitle: "Controle o limite mensal e acompanhe alertas de gastos.",
    editBudget: "Editar orçamento",
    newBudget: "Novo orçamento",
    budgetPeriod: "Mês do orçamento",
    monthlyLimit: "Limite mensal",
    monthlyLimitPlaceholder: "Ex: 1000.00",
    saving: "Salvando...",
    saveChanges: "Salvar alterações",
    createBudget: "Criar orçamento",
    cancelEdit: "Cancelar edição",
    alertTitle: "Consultar alerta",
    checking: "Consultando...",
    checkAlert: "Consultar alerta",
    used: "usado",
    limit: "Limite",
    spent: "Despesas",
    remaining: "Restante",
    registeredBudgets: "Orçamentos cadastrados",
    loadingBudgets: "Carregando orçamentos...",
    noBudgets: "Nenhum orçamento cadastrado ainda.",
    edit: "Editar",
    delete: "Excluir",
    deleteConfirm: "Deseja excluir este orçamento?",
    loadError: "Erro ao carregar orçamentos",
    saveError: "Erro ao salvar orçamento",
    deleteError: "Erro ao excluir orçamento",
    alertError: "Erro ao consultar alerta",
    status: {
      OK: "Dentro do limite",
      NEAR_LIMIT: "Próximo do limite",
      EXCEEDED: "Limite ultrapassado",
      NO_BUDGET: "Sem orçamento",
    },
    alertMessage: {
      OK: "Seu orçamento está dentro do limite definido.",
      NEAR_LIMIT: "Atenção: você está próximo do limite mensal.",
      EXCEEDED: "Seu gasto ultrapassou o limite definido.",
      NO_BUDGET: "Nenhum orçamento foi cadastrado para este período.",
    },
  },
  en: {
    title: "Budgets",
    subtitle: "Control monthly limits and track spending alerts.",
    editBudget: "Edit budget",
    newBudget: "New budget",
    budgetPeriod: "Budget month",
    monthlyLimit: "Monthly limit",
    monthlyLimitPlaceholder: "Ex: 1000.00",
    saving: "Saving...",
    saveChanges: "Save changes",
    createBudget: "Create budget",
    cancelEdit: "Cancel edit",
    alertTitle: "Check alert",
    checking: "Checking...",
    checkAlert: "Check alert",
    used: "used",
    limit: "Limit",
    spent: "Spent",
    remaining: "Remaining",
    registeredBudgets: "Registered budgets",
    loadingBudgets: "Loading budgets...",
    noBudgets: "No budgets registered yet.",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Do you want to delete this budget?",
    loadError: "Error loading budgets",
    saveError: "Error saving budget",
    deleteError: "Error deleting budget",
    alertError: "Error checking alert",
    status: {
      OK: "Within limit",
      NEAR_LIMIT: "Near limit",
      EXCEEDED: "Limit exceeded",
      NO_BUDGET: "No budget",
    },
    alertMessage: {
      OK: "Your budget is within the defined limit.",
      NEAR_LIMIT: "Heads up: you are close to the monthly limit.",
      EXCEEDED: "Your spending exceeded the defined limit.",
      NO_BUDGET: "No budget was registered for this period.",
    },
  },
};

function getLocale(language: "pt" | "en") {
  return language === "en" ? "en-US" : "pt-BR";
}

function formatCurrency(value: number | string, language: "pt" | "en") {
  return new Intl.NumberFormat(getLocale(language), {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function formatMonthValue(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getCurrentMonthValue() {
  return formatMonthValue(getCurrentMonth(), getCurrentYear());
}

function parseMonthValue(value: string) {
  const [year, month] = value.split("-").map(Number);

  return {
    month,
    year,
  };
}

function formatBudgetPeriod(month: number, year: number, language: "pt" | "en") {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getStatusLabel(
  status: BudgetAlertStatus,
  t: (typeof budgetText)["pt"]
) {
  return t.status[status];
}

export function BudgetsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const t = budgetText[language];

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alert, setAlert] = useState<BudgetAlert | null>(null);

  const [budgetPeriod, setBudgetPeriod] = useState(getCurrentMonthValue());
  const [limitAmount, setLimitAmount] = useState("");

  const [alertPeriod, setAlertPeriod] = useState(getCurrentMonthValue());

  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadBudgets() {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await budgetService.list(token);
      setBudgets(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.loadError
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    budgetService
      .list(token)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setBudgets(data);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : t.loadError
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

  function resetForm() {
    setBudgetPeriod(getCurrentMonthValue());
    setLimitAmount("");
    setEditingBudget(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { month, year } = parseMonthValue(budgetPeriod);
      const payload = {
        month,
        year,
        limitAmount: Number(limitAmount),
      };

      if (editingBudget) {
        await budgetService.update(token, editingBudget.id, payload);
      } else {
        await budgetService.create(token, payload);
      }

      resetForm();
      await loadBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setBudgetPeriod(formatMonthValue(budget.month, budget.year));
    setLimitAmount(String(budget.limitAmount));
  }

  async function handleDelete(budgetId: string) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(t.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await budgetService.remove(token, budgetId);
      await loadBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.deleteError);
    }
  }

  async function handleSearchAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsAlertLoading(true);
    setError("");

    try {
      const { month, year } = parseMonthValue(alertPeriod);
      const data = await budgetService.alerts(
        token,
        month,
        year
      );

      setAlert(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.alertError);
    } finally {
      setIsAlertLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="dashboard-panel">
          <h2>{editingBudget ? t.editBudget : t.newBudget}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              {t.budgetPeriod}
              <input
                type="month"
                value={budgetPeriod}
                onChange={(event) => setBudgetPeriod(event.target.value)}
                required
              />
            </label>

            <label>
              {t.monthlyLimit}
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder={t.monthlyLimitPlaceholder}
                value={limitAmount}
                onChange={(event) => setLimitAmount(event.target.value)}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.saving
                : editingBudget
                  ? t.saveChanges
                  : t.createBudget}
            </button>

            {editingBudget && (
              <button
                type="button"
                className="outline-button"
                onClick={resetForm}
              >
                {t.cancelEdit}
              </button>
            )}
          </form>
        </article>

        <article className="dashboard-panel">
          <h2>{t.alertTitle}</h2>

          <form className="filter-form" onSubmit={handleSearchAlert}>
            <label>
              {t.budgetPeriod}
              <input
                type="month"
                value={alertPeriod}
                onChange={(event) => setAlertPeriod(event.target.value)}
                required
              />
            </label>

            <div className="filter-actions">
              <button type="submit" disabled={isAlertLoading}>
                {isAlertLoading ? t.checking : t.checkAlert}
              </button>
            </div>
          </form>

          {alert && (
            <div className={`alert-card alert-${alert.status.toLowerCase()}`}>
              <span>{getStatusLabel(alert.status, t)}</span>
              <strong>{alert.percentageUsed}% {t.used}</strong>

              <p>{t.alertMessage[alert.status]}</p>

              <ul className="alert-values">
                <li>
                  <span>{t.limit}</span>
                  <strong>{formatCurrency(alert.limitAmount, language)}</strong>
                </li>

                <li>
                  <span>{t.spent}</span>
                  <strong>{formatCurrency(alert.spentAmount, language)}</strong>
                </li>

                <li>
                  <span>{t.remaining}</span>
                  <strong>{formatCurrency(alert.remainingAmount, language)}</strong>
                </li>
              </ul>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-panel page-section">
        <h2>{t.registeredBudgets}</h2>

        {isLoading ? (
          <p>{t.loadingBudgets}</p>
        ) : budgets.length === 0 ? (
          <p>{t.noBudgets}</p>
        ) : (
          <ul className="data-list">
            {budgets.map((budget) => (
              <li key={budget.id} className="list-item-with-actions">
                <div>
                  <strong>
                    {formatBudgetPeriod(budget.month, budget.year, language)}
                  </strong>
                  <span>
                    {t.limit}: {formatCurrency(budget.limitAmount, language)}
                  </span>
                </div>

                <div className="row-actions">
                  <button type="button" onClick={() => handleEdit(budget)}>
                    {t.edit}
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(budget.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
