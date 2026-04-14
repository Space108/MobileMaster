/**
 * MobileMaster — ApiMaster bridge for post-action DB / API checks.
 *
 * Настройте `API_MASTER_BASE_URL` и эндпоинты вашего прошлого ApiMaster.
 */

import axios, { type AxiosRequestConfig } from "axios";

export interface ApiMasterVerifyOptions {
  /** Относительный путь или полный URL проверки (например `/api/qa/verify-order`) */
  path: string;
  /** HTTP-метод (по умолчанию POST — типичные QA-проверки с телом) */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Тело запроса для сверки состояния в БД */
  payload?: unknown;
  /** Дополнительные заголовки (токен, tenant и т.д.) */
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

function defaultBaseUrl(): string {
  return process.env.API_MASTER_BASE_URL ?? "http://127.0.0.1:8080";
}

/**
 * Вызов проверки ApiMaster после действия в мобильном приложении
 * (например, после клика — убедиться, что запись появилась в БД).
 */
export async function verifyWithApiMaster<T = unknown>(
  options: ApiMasterVerifyOptions
): Promise<T> {
  const baseURL = defaultBaseUrl();
  const url = options.path.startsWith("http")
    ? options.path
    : `${baseURL.replace(/\/$/, "")}/${options.path.replace(/^\//, "")}`;

  const method = options.method ?? "POST";
  const res = await axios.request<T>({
    url,
    method,
    data: method === "GET" ? undefined : options.payload ?? {},
    params: method === "GET" ? (options.payload as Record<string, unknown>) : undefined,
    ...options.config,
    headers: {
      "X-MobileMaster-Client": "MobileMaster",
      ...options.headers,
    },
    validateStatus: () => true,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      `ApiMaster verify failed: ${res.status} ${JSON.stringify(res.data)}`
    );
  }

  return res.data as T;
}
