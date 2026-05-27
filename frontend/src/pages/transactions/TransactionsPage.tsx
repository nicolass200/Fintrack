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

const paymentMethodOptions = [
  "Pix",
  "Dinheiro",
  "Cartão de débito",
  "Cartão de crédito",
  "Boleto",
  "Transferência",
  "Outro",
];

type TransactionsPageProps = {
  mode?: "statement" | "form";
};

function getSettlementLabel(transaction: Transaction) {
  if (transaction.type === "INCOME") {
    return transaction.isSettled ? "Recebido" : "Não recebido";
  }

  return transaction.isSettled ? "Pago" : "Não pago";
}

export function TransactionsPage({ mode = "statement" }: TransactionsPageProps) {
  const { token } = useAuth();
  const isFormMode = mode === "form";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [account, setAccount] = useState("");
  const [isSettled, setIsSettled] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [filters, setFilters] = useState<TransactionFilters>({
    month: "",
    year: "",
    type: "",
    categoryId: "",
    isSettled: "",
    paymentMethod: "",
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
    setPaymentMethod("");
    setAccount("");
    setIsSettled(true);
    setEditingTransaction(null);
  }

  function selectTransactionType(nextType: CategoryType) {
    setType(nextType);
    setCategoryId("");
    setNewCategoryName("");
    setPaymentMethod("");
    setAccount("");
    setIsSettled(true);
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
        paymentMethod: type === "EXPENSE" ? paymentMethod || null : null,
        account: type === "INCOME" ? account || null : null,
        isSettled,
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

  async function handleCreateCategory() {
    if (!token || !newCategoryName.trim()) {
      return;
    }

    setIsCreatingCategory(true);
    setError("");

    try {
      const category = await categoryService.create(token, {
        name: newCategoryName.trim(),
        type,
      });
      const data = await categoryService.list(token);

      setCategories(data);
      setCategoryId(category.id);
      setNewCategoryName("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar categoria"
      );
    } finally {
      setIsCreatingCategory(false);
    }
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
    isSettled: "",
    paymentMethod: "",
  };

  setFilters(emptyFilters);
  await loadTransactions(emptyFilters);
}

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>{isFormMode ? "Adicionar" : "Extrato"}</h1>
          <p>
            {isFormMode
              ? "Cadastre um novo gasto ou ganho."
              : "Acompanhe seus gastos, ganhos e pendências financeiras."}
          </p>
        </div>
      </header>

      {isFormMode ? (
      <section className="form-page-grid">
        <article className="dashboard-panel">
          <h2>
            {editingTransaction
              ? "Editar lançamento"
              : type === "EXPENSE"
                ? "Novo gasto"
                : "Novo ganho"}
          </h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="mode-selector" aria-label="Tipo de lançamento">
              <button
                type="button"
                className={type === "EXPENSE" ? "active" : ""}
                onClick={() => selectTransactionType("EXPENSE")}
              >
                Gasto
              </button>

              <button
                type="button"
                className={type === "INCOME" ? "active" : ""}
                onClick={() => selectTransactionType("INCOME")}
              >
                Ganho
              </button>
            </div>

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

            <div className="inline-category-form">
              <label>
                Nova categoria
                <input
                  type="text"
                  placeholder={
                    type === "EXPENSE" ? "Ex: Mercado" : "Ex: Bônus"
                  }
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
              </label>

              <button
                type="button"
                className="outline-button"
                disabled={isCreatingCategory || !newCategoryName.trim()}
                onClick={handleCreateCategory}
              >
                {isCreatingCategory ? "Criando..." : "+ Nova categoria"}
              </button>
            </div>

            {type === "EXPENSE" && (
              <label>
                Forma de pagamento
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="">Não informado</option>

                  {paymentMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {type === "INCOME" && (
              <label>
                Conta onde recebeu
                <input
                  type="text"
                  placeholder="Ex: Nubank"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                />
              </label>
            )}

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isSettled}
                onChange={(event) => setIsSettled(event.target.checked)}
              />
              {type === "EXPENSE" ? "Já paguei" : "Já recebi"}
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
      </section>
      ) : (
      <>
      <section className="content-grid statement-grid">
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
              Movimento
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
                <option value="EXPENSE">Gastos</option>
                <option value="INCOME">Ganhos</option>
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

            <label>
              Status
              <select
                value={filters.isSettled}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    isSettled: event.target.value as "" | "true" | "false",
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="true">Pagos/recebidos</option>
                <option value="false">Pendentes</option>
              </select>
            </label>

            <label>
              Forma de pagamento
              <select
                value={filters.paymentMethod}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
              >
                <option value="">Todas</option>

                {paymentMethodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
        <h2>Movimentações</h2>

        {isLoading ? (
          <p>Carregando extrato...</p>
        ) : transactions.length === 0 ? (
          <p>Nenhuma movimentação encontrada.</p>
        ) : (
          <ul className="data-list">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="list-item-with-actions">
                <div>
                  <strong>{transaction.description}</strong>
                  <span>
                    <span
                      className={
                        transaction.type === "INCOME"
                          ? "type-chip income-chip"
                          : "type-chip expense-chip"
                      }
                    >
                      {transaction.type === "INCOME" ? "Ganho" : "Gasto"}
                    </span>{" "}
                    {transaction.category.name} • {formatDate(transaction.date)}
                    {" | "}
                    <span
                      className={
                        transaction.isSettled
                          ? "status-chip settled"
                          : "status-chip pending"
                      }
                    >
                      {getSettlementLabel(transaction)}
                    </span>
                    {transaction.paymentMethod
                      ? ` | ${transaction.paymentMethod}`
                      : ""}
                    {transaction.account ? ` | ${transaction.account}` : ""}
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
      </>
      )}
    </main>
  );
}
