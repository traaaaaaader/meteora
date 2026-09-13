import {
  HttpClientError,
  HttpServerError,
  JsonParseError,
  NetworkError,
  TimeoutError,
} from '../errors.js';

export async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, { method: 'GET', signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new TimeoutError(`Превышено время ожидания ответа сервера (${timeoutMs} мс)`);
    }
    throw new NetworkError(`Не удалось выполнить запрос: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const status = response.status;
    if (status >= 400 && status < 500) {
      throw new HttpClientError(`Ошибка запроса к API (HTTP ${status})`, status);
    }
    if (status >= 500) {
      throw new HttpServerError(`Сервер временно недоступен (HTTP ${status})`, status);
    }
    throw new HttpServerError(`Неожиданный статус ответа сервера (HTTP ${status})`, status);
  }

  try {
    return await response.json();
  } catch {
    throw new JsonParseError('Сервер вернул некорректный JSON');
  }
}
