import { fetchJson } from './httpClient.js';
import { buildUrl } from './url.js';
import { JsonParseError } from '../errors.js';

export async function getForecast(location, days, config) {
  const url = buildUrl(config.forecastBaseUrl, {
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: String(days),
    timezone: 'auto',
  });

  const data = await fetchJson(url, config.requestTimeoutMs);
  const daily = data?.daily;

  if (
    !daily ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.temperature_2m_min) ||
    !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.precipitation_sum)
  ) {
    throw new JsonParseError('Некорректный формат ответа forecast API: отсутствуют дневные данные');
  }

  return daily.time.map((date, index) => ({
    date,
    tempMin: daily.temperature_2m_min[index],
    tempMax: daily.temperature_2m_max[index],
    precipitation: daily.precipitation_sum[index],
  }));
}
