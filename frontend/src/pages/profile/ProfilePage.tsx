import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const initials =
    user?.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "FT";

  const createdAt = user?.createdAt
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "Disponível após o próximo login";

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Perfil e configurações</h1>
          <p>Consulte seus dados de conta e acesse as principais ações.</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="dashboard-panel profile-panel profile-card-main">
          <div className="profile-identity">
            <span className="profile-avatar">{initials}</span>
            <div>
              <h2>{user?.name || "Usuário FinTrack"}</h2>
              <p>{user?.email || "E-mail não disponível"}</p>
            </div>
          </div>

          <dl className="profile-list">
            <div>
              <dt>Nome</dt>
              <dd>{user?.name || "-"}</dd>
            </div>

            <div>
              <dt>E-mail</dt>
              <dd>{user?.email || "-"}</dd>
            </div>

            <div>
              <dt>Conta criada em</dt>
              <dd>{createdAt}</dd>
            </div>
          </dl>

          <button type="button" className="logout-button" onClick={logout}>
            Sair
          </button>
        </article>

        <aside className="profile-side-stack">
          <article className="dashboard-panel profile-panel">
            <h2>Segurança</h2>
            <p>
              Sua conta usa login protegido por senha. Caso precise trocar o
              acesso, use a recuperação de senha.
            </p>

            <Link className="secondary-button profile-link-button" to="/forgot-password">
              Recuperar senha
            </Link>
          </article>

          <article className="dashboard-panel profile-panel">
            <h2>Atalhos</h2>
            <div className="profile-actions">
              <Link to="/transactions/new">Adicionar gasto ou ganho</Link>
              <Link to="/transactions">Ver extrato</Link>
              <Link to="/budgets">Ver orçamentos</Link>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
