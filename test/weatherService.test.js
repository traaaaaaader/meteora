import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { getWeatherReport } from '../src/services/weatherService.js';

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'weather-digest-test-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function buildDaily(days) {
  const time = [];
  const tempMin = [];
  const tempMax = [];
  const precipitation = [];
  for (let i = 0; i < days; i += 1) {
    time.push(`2026-09-${String(12 + i).padStart(2, '0')}`);
    tempMin.push(10 + i);
    tempMax.push(20 + i);
    precipitation.push(0);
  }
  return {
    time,
    temperature_2m_min: tempMin,
    temperature_2m_max: tempMax,
    precipitation_sum: precipitation,
  };
}

function mockFetch(t, { onForecastRequest } = {}) {
  let callCount = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    callCount += 1;
    const parsed = new URL(url);
    if (parsed.pathname.includes('search')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [{ name: 'Москва', country: 'Россия', latitude: 55.75, longitude: 37.61 }],
        }),
      };
    }

    const requestedDays = Number(parsed.searchParams.get('forecast_days'));
    onForecastRequest?.(requestedDays);
    return {
      ok: true,
      status: 200,
      json: async () => ({ daily: buildDaily(requestedDays) }),
    };
  });
  return () => callCount;
}

const config = {
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastBaseUrl: 'https://api.open-meteo.com/v1/forecast',
  requestTimeoutMs: 5000,
};

test('getWeatherReport делает новый запрос, если в кэше меньше дней, чем запрошено', async (t) => {
  await withTempDir(async (dir) => {
    const cfg = { ...config, reportsDir: dir };
    const getCallCount = mockFetch(t);

    const first = await getWeatherReport('Москва', { config: cfg, days: 3, useCache: true });
    assert.equal(first.fromCache, false);
    assert.equal(first.days.length, 3);
    assert.equal(getCallCount(), 2);

    const second = await getWeatherReport('Москва', { config: cfg, days: 5, useCache: true });
    assert.equal(second.fromCache, false);
    assert.equal(second.days.length, 5);
    assert.equal(getCallCount(), 4);
  });
});

test('getWeatherReport берёт отчёт из кэша, если в нём достаточно дней', async (t) => {
  await withTempDir(async (dir) => {
    const cfg = { ...config, reportsDir: dir };
    const getCallCount = mockFetch(t);

    await getWeatherReport('Москва', { config: cfg, days: 5, useCache: true });
    assert.equal(getCallCount(), 2);

    const cached = await getWeatherReport('Москва', { config: cfg, days: 2, useCache: true });
    assert.equal(cached.fromCache, true);
    assert.equal(cached.days.length, 2);
    assert.equal(getCallCount(), 2);
  });
});
