import { useAuth } from "../../hooks/useAuth";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="app-badge">FinTrack</span>
          <h1>Perfil</h1>
          <p>Consulte seus dados de conta e acesse a saida do sistema.</p>
        </div>
      </header>

      <section className="form-page-grid">
        <article className="dashboard-panel profile-panel">
          <h2>Minha conta</h2>

          <dl className="profile-list">
            <div>
              <dt>Nome</dt>
              <dd>{user?.name}</dd>
            </div>

            <div>
              <dt>E-mail</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>

          <button type="button" className="logout-button" onClick={logout}>
            Sair
          </button>
        </article>
      </section>
    </main>
  );
}
