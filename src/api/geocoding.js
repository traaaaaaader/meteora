import { fetchJson } from './httpClient.js';
import { buildUrl } from './url.js';
import { CityNotFoundError } from '../errors.js';

export async function geocodeCity(cityName, config) {
  const url = buildUrl(config.geocodingBaseUrl, {
    name: cityName,
    count: '1',
    language: 'ru',
    format: 'json',
  });

  const data = await fetchJson(url, config.requestTimeoutMs);

  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    throw new CityNotFoundError(`Город "${cityName}" не найден`);
  }

  const [result] = data.results;
  return {
    name: result.name,
    country: result.country ?? 'Неизвестно',
    latitude: result.latitude,
    longitude: result.longitude,
  };
}
