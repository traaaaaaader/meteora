const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Отсутствует обязательная переменная окружения: ${name}`);
  }
  return value;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig() {
  return {
    geocodingBaseUrl: requireEnv('GEOCODING_BASE_URL'),
    forecastBaseUrl: requireEnv('FORECAST_BASE_URL'),
    requestTimeoutMs: toPositiveInt(process.env.REQUEST_TIMEOUT_MS, DEFAULT_REQUEST_TIMEOUT_MS),
    reportsDir: requireEnv('REPORTS_DIR'),
  };
}
