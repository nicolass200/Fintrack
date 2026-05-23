import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { budgetService } from "../../api/budgetService";
import { useAuth } from "../../hooks/useAuth";
import type { Budget, BudgetAlert } from "../../types/budget";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
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

function getStatusLabel(status: string) {
  if (status === "EXCEEDED") {
    return "Limite ultrapassado";
  }

  if (status === "NEAR_LIMIT") {
    return "Próximo do limite";
  }

  if (status === "NO_BUDGET") {
    return "Sem orçamento";
  }

  return "Dentro do limite";
}

export function BudgetsPage() {
  const { token } = useAuth();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alert, setAlert] = useState<BudgetAlert | null>(null);

  const [month, setMonth] = useState(String(getCurrentMonth()));
  const [year, setYear] = useState(String(getCurrentYear()));
  const [limitAmount, setLimitAmount] = useState("");

  const [alertMonth, setAlertMonth] = useState(String(getCurrentMonth()));
  const [alertYear, setAlertYear] = useState(String(getCurrentYear()));

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
        err instanceof Error ? err.message : "Erro ao carregar orçamentos"
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
          err instanceof Error ? err.message : "Erro ao carregar orçamentos"
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

  function resetForm() {
    setMonth(String(getCurrentMonth()));
    setYear(String(getCurrentYear()));
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
      const payload = {
        month: Number(month),
        year: Number(year),
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
      setError(err instanceof Error ? err.message : "Erro ao salvar orçamento");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setMonth(String(budget.month));
    setYear(String(budget.year));
    setLimitAmount(String(budget.limitAmount));
  }

  async function handleDelete(budgetId: string) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("Deseja excluir este orçamento?");

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await budgetService.remove(token, budgetId);
      await loadBudgets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir orçamento");
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
      const data = await budgetService.alerts(
        token,
        Number(alertMonth),
        Number(alertYear)
      );

      setAlert(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao consultar alerta");
    } finally {
      setIsAlertLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Orçamentos</h1>
          <p>Controle o limite mensal e acompanhe alertas de gastos.</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="dashboard-panel">
          <h2>{editingBudget ? "Editar orçamento" : "Novo orçamento"}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Mês
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                required
              />
            </label>

            <label>
              Ano
              <input
                type="number"
                min="2000"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
              />
            </label>

            <label>
              Limite mensal
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex: 1000.00"
                value={limitAmount}
                onChange={(event) => setLimitAmount(event.target.value)}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editingBudget
                  ? "Salvar alterações"
                  : "Criar orçamento"}
            </button>

            {editingBudget && (
              <button
                type="button"
                className="outline-button"
                onClick={resetForm}
              >
                Cancelar edição
              </button>
            )}
          </form>
        </article>

        <article className="dashboard-panel">
          <h2>Consultar alerta</h2>

          <form className="filter-form" onSubmit={handleSearchAlert}>
            <label>
              Mês
              <input
                type="number"
                min="1"
                max="12"
                value={alertMonth}
                onChange={(event) => setAlertMonth(event.target.value)}
                required
              />
            </label>

            <label>
              Ano
              <input
                type="number"
                min="2000"
                value={alertYear}
                onChange={(event) => setAlertYear(event.target.value)}
                required
              />
            </label>

            <div className="filter-actions">
              <button type="submit" disabled={isAlertLoading}>
                {isAlertLoading ? "Consultando..." : "Consultar alerta"}
              </button>
            </div>
          </form>

          {alert && (
            <div className={`alert-card alert-${alert.status.toLowerCase()}`}>
              <span>{getStatusLabel(alert.status)}</span>
              <strong>{alert.percentageUsed}% usado</strong>

              <p>{alert.message}</p>

              <ul className="alert-values">
                <li>
                  <span>Limite</span>
                  <strong>{formatCurrency(alert.limitAmount)}</strong>
                </li>

                <li>
                  <span>Gasto</span>
                  <strong>{formatCurrency(alert.spentAmount)}</strong>
                </li>

                <li>
                  <span>Restante</span>
                  <strong>{formatCurrency(alert.remainingAmount)}</strong>
                </li>
              </ul>
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-panel page-section">
        <h2>Orçamentos cadastrados</h2>

        {isLoading ? (
          <p>Carregando orçamentos...</p>
        ) : budgets.length === 0 ? (
          <p>Nenhum orçamento cadastrado ainda.</p>
        ) : (
          <ul className="data-list">
            {budgets.map((budget) => (
              <li key={budget.id} className="list-item-with-actions">
                <div>
                  <strong>
                    {budget.month}/{budget.year}
                  </strong>
                  <span>Limite: {formatCurrency(budget.limitAmount)}</span>
                </div>

                <div className="row-actions">
                  <button type="button" onClick={() => handleEdit(budget)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(budget.id)}
                  >
                    Excluir
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