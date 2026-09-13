import { parseCliArgs } from './cli/parseArgs.js';
import { loadConfig } from './config/env.js';
import { getWeatherReports } from './services/weatherService.js';
import { formatCityReport, formatCityError } from './format/output.js';
import { CliValidationError } from './errors.js';

try {
  process.loadEnvFile();
} catch (err) {
  if (err.code !== 'ENOENT') {
    console.error(`Не удалось загрузить .env файл: ${err.message}`);
    process.exitCode = 1;
    process.exit();
  }
}

async function main() {
  let cliArgs;
  try {
    cliArgs = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof CliValidationError) {
      console.error(`Ошибка: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`Ошибка конфигурации: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const results = await getWeatherReports(cliArgs.cities, {
    config,
    days: cliArgs.days,
    useCache: !cliArgs.noCache,
  });

  let hasError = false;

  for (const { city, result } of results) {
    if (result.status === 'fulfilled') {
      console.log(formatCityReport(result.value));
    } else {
      hasError = true;
      console.error(formatCityError(city, result.reason));
    }
  }

  process.exitCode = hasError ? 1 : 0;
}

main().catch((err) => {
  console.error(`Непредвиденная ошибка: ${err.message}`);
  process.exitCode = 1;
});
