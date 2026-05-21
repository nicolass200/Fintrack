import { API_BASE_URL } from "./apiConfig";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = "Erro na requisição";

    try {
      const errorData = await response.json();

      errorMessage =
        errorData.message ||
        errorData.error ||
        errorData.errors?.[0]?.message ||
        errorMessage;
    } catch {
      errorMessage = "Erro ao processar resposta da API";
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}