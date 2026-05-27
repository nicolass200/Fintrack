import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao solicitar recuperação de senha"
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
          <h1>Recuperar senha</h1>
          <p>Digite seu e-mail para receber um código de redefinição.</p>
        </div>

        {!message ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              E-mail
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            <p className="form-success">{message}</p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/reset-password")}
            >
              Ir para redefinir senha
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
