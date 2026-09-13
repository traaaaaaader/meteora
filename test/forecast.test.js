import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getForecast } from '../src/api/forecast.js';
import { JsonParseError } from '../src/errors.js';

const config = {
  forecastBaseUrl: 'https://api.open-meteo.com/v1/forecast',
  requestTimeoutMs: 5000,
};

const location = { latitude: 55.75, longitude: 37.61 };

test('getForecast возвращает массив дневных прогнозов', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      daily: {
        time: ['2026-09-12', '2026-09-13'],
        temperature_2m_min: [9.6, 8.9],
        temperature_2m_max: [17.1, 16.4],
        precipitation_sum: [0, 1.2],
      },
    }),
  }));

  const days = await getForecast(location, 2, config);
  assert.equal(days.length, 2);
  assert.deepEqual(days[0], { date: '2026-09-12', tempMin: 9.6, tempMax: 17.1, precipitation: 0 });
});

test('getForecast выбрасывает JsonParseError при отсутствии поля daily', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  }));

  await assert.rejects(() => getForecast(location, 2, config), JsonParseError);
});
