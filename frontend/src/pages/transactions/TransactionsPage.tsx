import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { categoryService } from "../../api/categoryService";
import { transactionService } from "../../api/transactionService";
import { useAuth } from "../../hooks/useAuth";
import type { Category, CategoryType } from "../../types/category";
import type { Transaction, TransactionFilters } from "../../types/transaction";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(new Date(value));
}

function getDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function TransactionsPage() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [filters, setFilters] = useState<TransactionFilters>({
    month: "",
    year: "",
    type: "",
    categoryId: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredCategoriesForForm = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  async function loadTransactions(currentFilters = filters) {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await transactionService.list(token, currentFilters);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar transações"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    if (!token) {
      return;
    }

    try {
      const data = await categoryService.list(token);
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar categorias"
      );
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

     Promise.all([
        transactionService.list(token),
        categoryService.list(token),
      ])
      .then(([transactionsData, categoriesData]) => {
        if (!isMounted) {
          return;
        }

        setTransactions(transactionsData);
        setCategories(categoriesData);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Erro ao carregar transações"
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
    setDescription("");
    setAmount("");
    setType("EXPENSE");
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId("");
    setEditingTransaction(null);
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
        description,
        amount: Number(amount),
        type,
        date,
        categoryId,
      };

      if (editingTransaction) {
        await transactionService.update(token, editingTransaction.id, payload);
      } else {
        await transactionService.create(token, payload);
      }

      resetForm();
      await loadTransactions();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar transação");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setDescription(transaction.description);
    setAmount(String(transaction.amount));
    setType(transaction.type);
    setDate(getDateInputValue(transaction.date));
    setCategoryId(transaction.categoryId);
  }

  async function handleDelete(transactionId: string) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("Deseja excluir esta transação?");

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await transactionService.remove(token, transactionId);
      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir transação");
    }
  }

  async function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadTransactions(filters);
  }

  async function handleClearFilters() {
  const emptyFilters: TransactionFilters = {
    month: "",
    year: "",
    type: "",
    categoryId: "",
  };

  setFilters(emptyFilters);
  await loadTransactions(emptyFilters);
}

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Transações</h1>
          <p>Registre receitas e despesas com data e categoria.</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="dashboard-panel">
          <h2>{editingTransaction ? "Editar transação" : "Nova transação"}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Descrição
              <input
                type="text"
                placeholder="Ex: Mercado"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            <label>
              Valor
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ex: 150.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label>
              Tipo
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value as CategoryType);
                  setCategoryId("");
                }}
                required
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </label>

            <label>
              Data
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label>
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">Selecione uma categoria</option>

                {filteredCategoriesForForm.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editingTransaction
                  ? "Salvar alterações"
                  : "Criar transação"}
            </button>

            {editingTransaction && (
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
          <h2>Filtros</h2>

          <form className="filter-form" onSubmit={handleApplyFilters}>
            <label>
              Mês
              <input
                type="number"
                min="1"
                max="12"
                placeholder="5"
                value={filters.month}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    month: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Ano
              <input
                type="number"
                min="2000"
                placeholder="2026"
                value={filters.year}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    year: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Tipo
              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    type: event.target.value as CategoryType | "",
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </label>

            <label>
              Categoria
              <select
                value={filters.categoryId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Todas</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="filter-actions">
              <button type="submit">Aplicar filtros</button>
              <button
                type="button"
                className="outline-button"
                onClick={handleClearFilters}
              >
                Limpar
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="dashboard-panel page-section">
        <h2>Transações cadastradas</h2>

        {isLoading ? (
          <p>Carregando transações...</p>
        ) : transactions.length === 0 ? (
          <p>Nenhuma transação cadastrada ainda.</p>
        ) : (
          <ul className="data-list">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="list-item-with-actions">
                <div>
                  <strong>{transaction.description}</strong>
                  <span>
                    {transaction.type === "INCOME" ? "Receita" : "Despesa"} •{" "}
                    {transaction.category.name} • {formatDate(transaction.date)}
                  </span>
                </div>

                <div className="transaction-actions">
                  <strong
                    className={
                      transaction.type === "INCOME"
                        ? "income-value"
                        : "expense-value"
                    }
                  >
                    {formatCurrency(transaction.amount)}
                  </strong>

                  <div className="row-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(transaction)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}