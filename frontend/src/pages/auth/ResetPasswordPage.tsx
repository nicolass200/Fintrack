import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { token?: string } | null;
  const initialToken =
    new URLSearchParams(location.search).get("token") || state?.token || "";

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        token,
        password,
      });
      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao redefinir a senha"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="app-badge">FinTrack</span>
          <h1>Nova senha</h1>
          <p>Insira o código de recuperação e defina sua nova senha.</p>
        </div>

        {!message ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Código de recuperação
              <input
                type="text"
                placeholder="Cole o código recebido"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="one-time-code"
                required
              />
            </label>

            <label>
              Nova senha
              <input
                type="password"
                placeholder="No minimo 10 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                required
              />
            </label>

            <label>
              Confirmar nova senha
              <input
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={10}
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Redefinindo..." : "Alterar senha"}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            <p className="form-success">{message}</p>
            <p>Sua senha foi redefinida com sucesso. Agora você pode entrar no sistema.</p>
            <button type="button" onClick={() => navigate("/login")}>
              Entrar no sistema
            </button>
          </div>
        )}

        <p className="auth-footer">
          Lembrou a senha? <Link to="/login">Voltar para o login</Link>
        </p>
      </section>
    </main>
  );
}
