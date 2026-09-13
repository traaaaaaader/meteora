import { geocodeCity } from '../api/geocoding.js';
import { getForecast } from '../api/forecast.js';
import { readCachedReport, saveReport } from '../storage/reportStorage.js';

export async function getWeatherReport(cityName, options) {
  const { config, days, useCache } = options;

  if (useCache) {
    const cached = await readCachedReport(cityName, config);
    if (cached && Array.isArray(cached.days) && cached.days.length >= days) {
      return { ...cached, days: cached.days.slice(0, days), fromCache: true };
    }
  }

  const location = await geocodeCity(cityName, config);
  const forecastDays = await getForecast(location, days, config);

  const report = {
    city: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    generatedAt: new Date().toISOString(),
    days: forecastDays,
  };

  await saveReport(cityName, report, config);

  return { ...report, fromCache: false };
}

export async function getWeatherReports(cityNames, options) {
  const settled = await Promise.allSettled(
    cityNames.map((cityName) => getWeatherReport(cityName, options)),
  );

  return settled.map((result, index) => ({
    city: cityNames[index],
    result,
  }));
}
