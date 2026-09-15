/**
 * Cliente mínimo para Paddle Billing (server-side).
 * Sandbox: https://sandbox-api.paddle.com
 * Live:    https://api.paddle.com
 */

const PADDLE_API_BASE =
  process.env.PADDLE_ENV === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

function getApiKey() {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("Falta PADDLE_API_KEY en las variables de entorno");
  return key;
}

export async function paddleFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
      ...(init.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (json as { error?: { detail?: string } })?.error?.detail ||
      `Paddle API error ${res.status}`;
    throw new Error(msg);
  }

  return json as T;
}

export type CreateTransactionInput = {
  productId: string;
  amountUsd: number; // dólares (ej. 5.5)
  description: string;
  customData: Record<string, string>;
};

/**
 * Crea una transaction con precio dinámico (non-catalog)
 * y devuelve el transaction id para abrir el checkout overlay.
 */
export async function createPaddleTransaction(input: CreateTransactionInput) {
  // Paddle espera el importe en la unidad menor como string ("550" = $5.50)
  const amountCents = String(Math.round(input.amountUsd * 100));

  const body = {
    items: [
      {
        quantity: 1,
        price: {
          description: input.description,
          name: input.description.slice(0, 50),
          unit_price: {
            amount: amountCents,
            currency_code: "USD",
          },
          product_id: input.productId,
        },
      },
    ],
    collection_mode: "automatic",
    currency_code: "USD",
    custom_data: input.customData,
  };

  const result = await paddleFetch<{ data: { id: string } }>("/transactions", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return result.data;
}
