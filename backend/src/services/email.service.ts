import { Resend } from "resend";
import { AppError } from "../utils/AppError";

function getEnv(name: string) {
  return process.env[name]?.trim();
}

function getAppUrl() {
  return getEnv("APP_URL") || "http://localhost:5173";
}

function getEmailFrom() {
  return getEnv("EMAIL_FROM");
}

function getResendApiKey() {
  return getEnv("RESEND_API_KEY");
}

export function isEmailDeliveryConfigured() {
  return Boolean(getResendApiKey() && getEmailFrom());
}

export class EmailService {
  private client: Resend | null = null;

  private getClient() {
    if (this.client) {
      return this.client;
    }

    const apiKey = getResendApiKey();

    if (!apiKey) {
      throw new AppError("RESEND_API_KEY not configured", 500);
    }

    this.client = new Resend(apiKey);
    return this.client;
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const from = getEmailFrom();

    if (!from) {
      throw new AppError("EMAIL_FROM not configured", 500);
    }

    const resetLink = `${getAppUrl().replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;

    const result = await this.getClient().emails.send({
      from,
      to: email,
      subject: "Redefina sua senha no FinTrack",
      text: [
        "Recebemos um pedido para redefinir sua senha no FinTrack.",
        "",
        `Codigo de recuperacao: ${token}`,
        `Link para redefinir: ${resetLink}`,
        "",
        "Esse codigo expira em 15 minutos.",
        "Se voce nao solicitou essa redefinicao, ignore este email.",
      ].join("\n"),
      html: `
        <div style="background:#f4f8f5;padding:32px 16px;font-family:Arial,sans-serif;color:#0b1611;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dbe7df;border-radius:16px;overflow:hidden;">
            <div style="padding:8px 24px;background:linear-gradient(90deg,#5ff2a2,#61d8f7);"></div>
            <div style="padding:32px 24px;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#08784d;">FinTrack</p>
              <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">Redefina sua senha</h1>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#44524a;">
                Recebemos um pedido para redefinir a senha da sua conta.
              </p>
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#44524a;">Codigo de recuperacao</p>
              <div style="margin:0 0 24px;padding:14px 16px;border-radius:12px;background:#f3f8f5;border:1px solid #dbe7df;font-size:24px;font-weight:700;letter-spacing:0.18em;color:#0b1611;">
                ${token}
              </div>
              <a href="${resetLink}" style="display:inline-block;padding:14px 22px;border-radius:12px;background:linear-gradient(135deg,#5ff2a2,#61d8f7);color:#06120d;font-size:15px;font-weight:700;text-decoration:none;">
                Redefinir senha
              </a>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#66736b;">
                Esse codigo expira em 15 minutos. Se voce nao solicitou essa redefinicao, ignore este email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (result.error) {
      throw new AppError(result.error.message, result.error.statusCode || 502);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[RESEND] password reset email sent: ${result.data?.id ?? "no-id"}`
      );
    }

    return { resetLink };
  }
}
