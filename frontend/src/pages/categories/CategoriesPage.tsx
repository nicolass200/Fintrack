import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { categoryService } from "../../api/categoryService";
import { useAuth } from "../../hooks/useAuth";
import type { Category, CategoryType } from "../../types/category";

export function CategoriesPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await categoryService.list(token);
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar categorias"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    categoryService
      .list(token)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setCategories(data);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Erro ao carregar categorias"
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
    setName("");
    setType("EXPENSE");
    setEditingCategory(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (editingCategory) {
        await categoryService.update(token, editingCategory.id, {
          name,
          type,
        });
      } else {
        await categoryService.create(token, {
          name,
          type,
        });
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
  }

  async function handleDelete(categoryId: string) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("Deseja excluir esta categoria?");

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      await categoryService.remove(token, categoryId);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir categoria");
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Categorias</h1>
          <p>Gerencie categorias de receitas e despesas.</p>
        </div>
      </header>

      <section className="content-grid">
        <article className="dashboard-panel">
          <h2>{editingCategory ? "Editar categoria" : "Nova categoria"}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Nome
              <input
                type="text"
                placeholder="Ex: Alimentação"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label>
              Tipo
              <select
                value={type}
                onChange={(event) => setType(event.target.value as CategoryType)}
                required
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
              </select>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : editingCategory
                  ? "Salvar alterações"
                  : "Criar categoria"}
            </button>

            {editingCategory && (
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
          <h2>Categorias cadastradas</h2>

          {isLoading ? (
            <p>Carregando categorias...</p>
          ) : categories.length === 0 ? (
            <p>Nenhuma categoria cadastrada ainda.</p>
          ) : (
            <ul className="data-list">
              {categories.map((category) => (
                <li key={category.id} className="list-item-with-actions">
                  <div>
                    <strong>{category.name}</strong>
                    <span>
                      {category.type === "INCOME" ? "Receita" : "Despesa"}
                    </span>
                  </div>

                  <div className="row-actions">
                    <button type="button" onClick={() => handleEdit(category)}>
                      Editar
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(category.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}