import { test } from 'node:test';
import assert from 'node:assert/strict';
import { geocodeCity } from '../src/api/geocoding.js';
import { CityNotFoundError } from '../src/errors.js';

const config = {
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1/search',
  requestTimeoutMs: 5000,
};

test('geocodeCity возвращает координаты города при успешном ответе', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      results: [{ name: 'Москва', country: 'Россия', latitude: 55.75, longitude: 37.61 }],
    }),
  }));

  const location = await geocodeCity('Москва', config);
  assert.equal(location.name, 'Москва');
  assert.equal(location.country, 'Россия');
  assert.equal(location.latitude, 55.75);
  assert.equal(location.longitude, 37.61);
});

test('geocodeCity выбрасывает CityNotFoundError при пустом результате', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ results: [] }),
  }));

  await assert.rejects(() => geocodeCity('НесуществующийГород', config), CityNotFoundError);
});

test('geocodeCity выбрасывает CityNotFoundError, если поле results отсутствует', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({}),
  }));

  await assert.rejects(() => geocodeCity('НесуществующийГород', config), CityNotFoundError);
});
