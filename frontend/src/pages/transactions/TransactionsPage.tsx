import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { categoryService } from "../../api/categoryService";
import { transactionService } from "../../api/transactionService";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import type { Category, CategoryType } from "../../types/category";
import type { Transaction, TransactionFilters } from "../../types/transaction";

const transactionText = {
  pt: {
    addTitle: "Adicionar",
    statementTitle: "Extrato",
    addSubtitle: "Cadastre uma nova despesa ou receita.",
    statementSubtitle: "Acompanhe suas despesas, receitas e pendências financeiras.",
    editEntry: "Editar lançamento",
    newExpense: "Nova despesa",
    newIncome: "Nova receita",
    entryType: "Tipo de lançamento",
    expense: "Despesa",
    income: "Receita",
    description: "Descrição",
    descriptionPlaceholder: "Ex: Mercado",
    amount: "Valor",
    amountPlaceholder: "Ex: 150.00",
    date: "Data",
    category: "Categoria",
    selectCategory: "Selecione uma categoria",
    newCategory: "Nova categoria",
    newExpenseCategoryPlaceholder: "Ex: Mercado",
    newIncomeCategoryPlaceholder: "Ex: Bônus",
    creating: "Criando...",
    addCategory: "+ Nova categoria",
    paymentMethod: "Forma de pagamento",
    notInformed: "Não informado",
    account: "Conta onde recebeu",
    accountPlaceholder: "Ex: Nubank",
    paidQuestion: "Já paguei",
    receivedQuestion: "Já recebi",
    saving: "Salvando...",
    saveChanges: "Salvar alterações",
    createTransaction: "Criar transação",
    cancelEdit: "Cancelar edição",
    filters: "Filtros",
    startDate: "Data inicial",
    endDate: "Data final",
    movement: "Movimento",
    all: "Todos",
    allFemale: "Todas",
    expenses: "Despesas",
    incomes: "Receitas",
    status: "Status",
    receivedFilter: "Recebidos",
    paidFilter: "Pagos",
    pending: "Pendentes",
    applyFilters: "Aplicar filtros",
    clear: "Limpar",
    transactions: "Movimentações",
    loadingStatement: "Carregando extrato...",
    noTransactions: "Nenhuma movimentação encontrada.",
    delete: "Excluir",
    deleteConfirm: "Deseja excluir esta transação?",
    paid: "Pago",
    unpaid: "Não pago",
    received: "Recebido",
    notReceived: "Não recebido",
    loadTransactionsError: "Erro ao carregar transações",
    loadCategoriesError: "Erro ao carregar categorias",
    saveTransactionError: "Erro ao salvar transação",
    createCategoryError: "Erro ao criar categoria",
    deleteTransactionError: "Erro ao excluir transação",
    dateRangeError: "A data final deve ser maior ou igual à data inicial.",
  },
  en: {
    addTitle: "Add",
    statementTitle: "Statement",
    addSubtitle: "Register a new expense or income.",
    statementSubtitle: "Track your expenses, income and financial pending items.",
    editEntry: "Edit entry",
    newExpense: "New expense",
    newIncome: "New income",
    entryType: "Entry type",
    expense: "Expense",
    income: "Income",
    description: "Description",
    descriptionPlaceholder: "Ex: Groceries",
    amount: "Amount",
    amountPlaceholder: "Ex: 150.00",
    date: "Date",
    category: "Category",
    selectCategory: "Select a category",
    newCategory: "New category",
    newExpenseCategoryPlaceholder: "Ex: Groceries",
    newIncomeCategoryPlaceholder: "Ex: Bonus",
    creating: "Creating...",
    addCategory: "+ New category",
    paymentMethod: "Payment method",
    notInformed: "Not informed",
    account: "Receiving account",
    accountPlaceholder: "Ex: Nubank",
    paidQuestion: "Already paid",
    receivedQuestion: "Already received",
    saving: "Saving...",
    saveChanges: "Save changes",
    createTransaction: "Create transaction",
    cancelEdit: "Cancel edit",
    filters: "Filters",
    startDate: "Start date",
    endDate: "End date",
    movement: "Movement",
    all: "All",
    allFemale: "All",
    expenses: "Expenses",
    incomes: "Income",
    status: "Status",
    receivedFilter: "Received",
    paidFilter: "Paid",
    pending: "Pending",
    applyFilters: "Apply filters",
    clear: "Clear",
    transactions: "Transactions",
    loadingStatement: "Loading statement...",
    noTransactions: "No transactions found.",
    delete: "Delete",
    deleteConfirm: "Do you want to delete this transaction?",
    paid: "Paid",
    unpaid: "Unpaid",
    received: "Received",
    notReceived: "Not received",
    loadTransactionsError: "Error loading transactions",
    loadCategoriesError: "Error loading categories",
    saveTransactionError: "Error saving transaction",
    createCategoryError: "Error creating category",
    deleteTransactionError: "Error deleting transaction",
    dateRangeError: "The end date must be greater than or equal to the start date.",
  },
};

const paymentMethodOptions = [
  { value: "Pix", label: { pt: "Pix", en: "Pix" } },
  { value: "Dinheiro", label: { pt: "Dinheiro", en: "Cash" } },
  {
    value: "Cartão de débito",
    label: { pt: "Cartão de débito", en: "Debit card" },
  },
  {
    value: "Cartão de crédito",
    label: { pt: "Cartão de crédito", en: "Credit card" },
  },
  { value: "Boleto", label: { pt: "Boleto", en: "Bank slip" } },
  { value: "Transferência", label: { pt: "Transferência", en: "Transfer" } },
  { value: "Outro", label: { pt: "Outro", en: "Other" } },
];

function getLocale(language: "pt" | "en") {
  return language === "en" ? "en-US" : "pt-BR";
}

function formatCurrency(value: number | string, language: "pt" | "en") {
  return new Intl.NumberFormat(getLocale(language), {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string, language: "pt" | "en") {
  return new Intl.DateTimeFormat(getLocale(language), {
    timeZone: "UTC",
  }).format(new Date(value));
}

type TransactionsPageProps = {
  mode?: "statement" | "form";
};

type SettlementStatusFilter = "" | "received" | "paid" | "pending";

type TransactionFilterState = TransactionFilters & {
  settlementStatus: SettlementStatusFilter;
};

function getSettlementLabel(
  transaction: Transaction,
  t: (typeof transactionText)["pt"]
) {
  if (transaction.type === "INCOME") {
    return transaction.isSettled ? t.received : t.notReceived;
  }

  return transaction.isSettled ? t.paid : t.unpaid;
}

function getRequestFilters(filters: TransactionFilterState): TransactionFilters {
  const {
    settlementStatus,
    ...requestFilters
  } = filters;

  if (settlementStatus === "received") {
    return {
      ...requestFilters,
      type: "INCOME",
      isSettled: "true",
    };
  }

  if (settlementStatus === "paid") {
    return {
      ...requestFilters,
      type: "EXPENSE",
      isSettled: "true",
    };
  }

  if (settlementStatus === "pending") {
    return {
      ...requestFilters,
      isSettled: "false",
    };
  }

  return {
    ...requestFilters,
    isSettled: "",
  };
}

export function TransactionsPage({ mode = "statement" }: TransactionsPageProps) {
  const { token } = useAuth();
  const { language } = useLanguage();
  const t = transactionText[language];
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

  const [filters, setFilters] = useState<TransactionFilterState>({
    startDate: "",
    endDate: "",
    type: "",
    categoryId: "",
    settlementStatus: "",
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
      const data = await transactionService.list(
        token,
        getRequestFilters(currentFilters)
      );
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.loadTransactionsError
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
        err instanceof Error ? err.message : t.loadCategoriesError
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
          err instanceof Error ? err.message : t.loadTransactionsError
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
  }, [token, t.loadTransactionsError]);

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
      setError(err instanceof Error ? err.message : t.saveTransactionError);
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
        err instanceof Error ? err.message : t.createCategoryError
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleDelete(transactionId: string) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(t.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await transactionService.remove(token, transactionId);
      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.deleteTransactionError);
    }
  }

  async function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setError(t.dateRangeError);
      return;
    }

    await loadTransactions(filters);
  }

  async function handleClearFilters() {
  const emptyFilters: TransactionFilterState = {
    startDate: "",
    endDate: "",
    type: "",
    categoryId: "",
    settlementStatus: "",
    paymentMethod: "",
  };

  setFilters(emptyFilters);
  await loadTransactions(emptyFilters);
}

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{isFormMode ? t.addTitle : t.statementTitle}</h1>
          <p>
            {isFormMode
              ? t.addSubtitle
              : t.statementSubtitle}
          </p>
        </div>
      </header>

      {isFormMode ? (
      <section className="form-page-grid">
        <article className="dashboard-panel">
          <h2>
            {editingTransaction
              ? t.editEntry
              : type === "EXPENSE"
                ? t.newExpense
                : t.newIncome}
          </h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="mode-selector" aria-label={t.entryType}>
              <button
                type="button"
                className={type === "EXPENSE" ? "active" : ""}
                onClick={() => selectTransactionType("EXPENSE")}
              >
                {t.expense}
              </button>

              <button
                type="button"
                className={type === "INCOME" ? "active" : ""}
                onClick={() => selectTransactionType("INCOME")}
              >
                {t.income}
              </button>
            </div>

            <label>
              {t.description}
              <input
                type="text"
                placeholder={t.descriptionPlaceholder}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            <label>
              {t.amount}
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder={t.amountPlaceholder}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label>
              {t.date}
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label>
              {t.category}
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">{t.selectCategory}</option>

                {filteredCategoriesForForm.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-category-form">
              <label>
                {t.newCategory}
                <input
                  type="text"
                  placeholder={
                    type === "EXPENSE"
                      ? t.newExpenseCategoryPlaceholder
                      : t.newIncomeCategoryPlaceholder
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
                {isCreatingCategory ? t.creating : t.addCategory}
              </button>
            </div>

            {type === "EXPENSE" && (
              <label>
                {t.paymentMethod}
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                >
                  <option value="">{t.notInformed}</option>

                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label[language]}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {type === "INCOME" && (
              <label>
                {t.account}
                <input
                  type="text"
                  placeholder={t.accountPlaceholder}
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
              {type === "EXPENSE" ? t.paidQuestion : t.receivedQuestion}
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t.saving
                : editingTransaction
                  ? t.saveChanges
                  : t.createTransaction}
            </button>

            {editingTransaction && (
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
      </section>
      ) : (
      <>
      <section className="content-grid statement-grid">
        <article className="dashboard-panel">
          <h2>{t.filters}</h2>

          <form className="filter-form" onSubmit={handleApplyFilters}>
            <label>
              {t.startDate}
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              {t.endDate}
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              {t.movement}
              <select
                value={filters.type}
                onChange={(event) => {
                  const nextType = event.target.value as CategoryType | "";

                  setFilters((current) => ({
                    ...current,
                    type: nextType,
                    settlementStatus:
                      (nextType === "INCOME" &&
                        current.settlementStatus === "paid") ||
                      (nextType === "EXPENSE" &&
                        current.settlementStatus === "received")
                        ? ""
                        : current.settlementStatus,
                  }));
                }}
              >
                <option value="">{t.all}</option>
                <option value="EXPENSE">{t.expenses}</option>
                <option value="INCOME">{t.incomes}</option>
              </select>
            </label>

            <label>
              {t.category}
              <select
                value={filters.categoryId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">{t.allFemale}</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.status}
              <select
                value={filters.settlementStatus}
                onChange={(event) => {
                  const settlementStatus = event.target
                    .value as SettlementStatusFilter;

                  setFilters((current) => ({
                    ...current,
                    settlementStatus,
                    type:
                      settlementStatus === "received"
                        ? "INCOME"
                        : settlementStatus === "paid"
                          ? "EXPENSE"
                          : current.type,
                  }));
                }}
              >
                <option value="">{t.all}</option>
                <option value="received">{t.receivedFilter}</option>
                <option value="paid">{t.paidFilter}</option>
                <option value="pending">{t.pending}</option>
              </select>
            </label>

            <label>
              {t.paymentMethod}
              <select
                value={filters.paymentMethod}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    paymentMethod: event.target.value,
                  }))
                }
              >
                <option value="">{t.allFemale}</option>

                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[language]}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="filter-actions">
              <button type="submit">{t.applyFilters}</button>
              <button
                type="button"
                className="outline-button"
                onClick={handleClearFilters}
              >
                {t.clear}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="dashboard-panel page-section">
        <h2>{t.transactions}</h2>

        {isLoading ? (
          <p>{t.loadingStatement}</p>
        ) : transactions.length === 0 ? (
          <p>{t.noTransactions}</p>
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
                      {transaction.type === "INCOME" ? t.income : t.expense}
                    </span>{" "}
                    {transaction.category.name} •{" "}
                    {formatDate(transaction.date, language)}
                    {" | "}
                    <span
                      className={
                        transaction.isSettled
                          ? "status-chip settled"
                          : "status-chip pending"
                      }
                    >
                      {getSettlementLabel(transaction, t)}
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
                    {formatCurrency(transaction.amount, language)}
                  </strong>

                  <div className="row-actions">
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      {t.delete}
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
