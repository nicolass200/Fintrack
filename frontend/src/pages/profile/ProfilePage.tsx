import { Link } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import type { Language } from "../../contexts/languageContext";

const profileText = {
  pt: {
    title: "Perfil e configurações",
    subtitle: "Consulte seus dados de conta e acesse as principais ações.",
    fallbackUser: "Usuário FinTrack",
    missingEmail: "E-mail não disponível",
    name: "Nome",
    email: "E-mail",
    createdAt: "Conta criada em",
    createdFallback: "Disponível após o próximo login",
    editNameTitle: "Editar perfil",
    editNameDescription: "Atualize o nome exibido no sistema.",
    namePlaceholder: "Seu nome",
    savingProfile: "Salvando...",
    saveProfile: "Salvar nome",
    profileSaved: "Perfil atualizado com sucesso.",
    profileSaveError: "Erro ao atualizar perfil",
    signOut: "Sair",
    securityTitle: "Segurança",
    securityDescription:
      "Sua conta usa login protegido por senha. Caso precise trocar o acesso, use a recuperação de senha.",
    recoverPassword: "Recuperar senha",
    shortcutsTitle: "Atalhos",
    addTransaction: "Adicionar gasto ou ganho",
    viewStatement: "Ver extrato",
    viewBudgets: "Ver orçamentos",
    languageTitle: "Idioma",
    languageDescription: "Escolha o idioma da interface neste dispositivo.",
    languageLabel: "Idioma do site",
    portuguese: "Português",
    english: "Inglês",
  },
  en: {
    title: "Profile and settings",
    subtitle: "Review your account details and access key actions.",
    fallbackUser: "FinTrack user",
    missingEmail: "Email unavailable",
    name: "Name",
    email: "Email",
    createdAt: "Account created on",
    createdFallback: "Available after the next login",
    editNameTitle: "Edit profile",
    editNameDescription: "Update the name shown in the system.",
    namePlaceholder: "Your name",
    savingProfile: "Saving...",
    saveProfile: "Save name",
    profileSaved: "Profile updated successfully.",
    profileSaveError: "Error updating profile",
    signOut: "Sign out",
    securityTitle: "Security",
    securityDescription:
      "Your account uses password-protected login. If you need to change access, use password recovery.",
    recoverPassword: "Recover password",
    shortcutsTitle: "Shortcuts",
    addTransaction: "Add expense or income",
    viewStatement: "View statement",
    viewBudgets: "View budgets",
    languageTitle: "Language",
    languageDescription: "Choose the interface language on this device.",
    languageLabel: "Site language",
    portuguese: "Portuguese",
    english: "English",
  },
};

export function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = profileText[language];
  const [name, setName] = useState(user?.name ?? "");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setIsSavingProfile(true);

    try {
      await updateProfile({ name });
      setProfileMessage(t.profileSaved);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : t.profileSaveError
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  const initials =
    user?.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "FT";

  const createdAt = user?.createdAt
    ? new Intl.DateTimeFormat(language === "en" ? "en-US" : "pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : t.createdFallback;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>

      <section className="profile-grid">
        <article className="dashboard-panel profile-panel profile-card-main">
          <div className="profile-identity">
            <span className="profile-avatar">{initials}</span>
            <div>
              <h2>{user?.name || t.fallbackUser}</h2>
              <p>{user?.email || t.missingEmail}</p>
            </div>
          </div>

          <dl className="profile-list">
            <div>
              <dt>{t.name}</dt>
              <dd>{user?.name || "-"}</dd>
            </div>

            <div>
              <dt>{t.email}</dt>
              <dd>{user?.email || "-"}</dd>
            </div>

            <div>
              <dt>{t.createdAt}</dt>
              <dd>{createdAt}</dd>
            </div>
          </dl>

          <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
            <div>
              <h3>{t.editNameTitle}</h3>
              <p>{t.editNameDescription}</p>
            </div>

            <label>
              {t.name}
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                minLength={2}
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            {profileMessage && <p className="form-success">{profileMessage}</p>}
            {profileError && <p className="form-error">{profileError}</p>}

            <button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? t.savingProfile : t.saveProfile}
            </button>
          </form>

          <button type="button" className="logout-button" onClick={logout}>
            {t.signOut}
          </button>
        </article>

        <aside className="profile-side-stack">
          <article className="dashboard-panel profile-panel">
            <h2>{t.languageTitle}</h2>
            <p>{t.languageDescription}</p>

            <label className="profile-language-control">
              {t.languageLabel}
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as Language)
                }
              >
                <option value="pt">{t.portuguese}</option>
                <option value="en">{t.english}</option>
              </select>
            </label>
          </article>

          <article className="dashboard-panel profile-panel">
            <h2>{t.securityTitle}</h2>
            <p>{t.securityDescription}</p>

            <Link className="secondary-button profile-link-button" to="/forgot-password">
              {t.recoverPassword}
            </Link>
          </article>

          <article className="dashboard-panel profile-panel">
            <h2>{t.shortcutsTitle}</h2>
            <div className="profile-actions">
              <Link to="/transactions/new">{t.addTransaction}</Link>
              <Link to="/transactions">{t.viewStatement}</Link>
              <Link to="/budgets">{t.viewBudgets}</Link>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
