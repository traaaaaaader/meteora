import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchJson } from '../src/api/httpClient.js';
import {
  HttpClientError,
  HttpServerError,
  JsonParseError,
  NetworkError,
  TimeoutError,
} from '../src/errors.js';

function fakeResponse({ ok, status, jsonImpl }) {
  return {
    ok,
    status,
    json: jsonImpl ?? (async () => ({})),
  };
}

test('fetchJson возвращает разобранный JSON при успешном ответе', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    fakeResponse({ ok: true, status: 200, jsonImpl: async () => ({ hello: 'world' }) }),
  );

  const result = await fetchJson('https://example.test/api', 5000);
  assert.deepEqual(result, { hello: 'world' });
});

test('fetchJson выбрасывает HttpClientError при HTTP 4xx', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => fakeResponse({ ok: false, status: 404 }));

  await assert.rejects(() => fetchJson('https://example.test/api', 5000), HttpClientError);
});

test('fetchJson выбрасывает HttpServerError при HTTP 5xx', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => fakeResponse({ ok: false, status: 503 }));

  await assert.rejects(() => fetchJson('https://example.test/api', 5000), HttpServerError);
});

test('fetchJson выбрасывает JsonParseError при некорректном JSON', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    fakeResponse({
      ok: true,
      status: 200,
      jsonImpl: async () => {
        throw new SyntaxError('Unexpected token');
      },
    }),
  );

  await assert.rejects(() => fetchJson('https://example.test/api', 5000), JsonParseError);
});

test('fetchJson выбрасывает TimeoutError при истечении таймаута', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  });

  await assert.rejects(() => fetchJson('https://example.test/api', 5000), TimeoutError);
});

test('fetchJson выбрасывает NetworkError при отсутствии сети', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('getaddrinfo ENOTFOUND');
  });

  await assert.rejects(() => fetchJson('https://example.test/api', 5000), NetworkError);
});
