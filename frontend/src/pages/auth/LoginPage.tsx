import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <span className="app-badge">FinTrack</span>
          <h1>Entrar na conta</h1>
          <p>Acesse seu controle financeiro pessoal.</p>
        </div>

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

          <label>
            Senha
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={10}
              required
            />
          </label>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Esqueci minha senha</Link>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="auth-footer">
          Ainda não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </section>
    </main>
  );
}
