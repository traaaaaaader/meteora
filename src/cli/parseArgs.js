import { parseArgs } from 'node:util';
import { CliValidationError } from '../errors.js';

const MIN_DAYS = 1;
const MAX_DAYS = 7;
const DEFAULT_DAYS = 3;

export function parseCliArgs(argv) {
  let values;
  try {
    ({ values } = parseArgs({
      args: argv,
      options: {
        city: { type: 'string' },
        days: { type: 'string' },
        'no-cache': { type: 'boolean', default: false },
      },
      strict: true,
      allowPositionals: false,
    }));
  } catch (err) {
    throw new CliValidationError(`Некорректные аргументы командной строки: ${err.message}`);
  }

  if (values.city === undefined || values.city.trim() === '') {
    throw new CliValidationError(
      'Параметр --city обязателен и не может быть пустым. Пример: --city "Москва"',
    );
  }

  const cities = values.city
    .split(',')
    .map((city) => city.trim())
    .filter((city) => city.length > 0);

  if (cities.length === 0) {
    throw new CliValidationError('Параметр --city должен содержать хотя бы одно название города');
  }

  let days = DEFAULT_DAYS;
  if (values.days !== undefined) {
    const trimmed = values.days.trim();
    if (!/^\d+$/.test(trimmed)) {
      throw new CliValidationError(
        `Параметр --days должен быть целым числом от ${MIN_DAYS} до ${MAX_DAYS}, получено: "${values.days}"`,
      );
    }
    days = Number(trimmed);
    if (days < MIN_DAYS || days > MAX_DAYS) {
      throw new CliValidationError(
        `Параметр --days должен быть в диапазоне ${MIN_DAYS}-${MAX_DAYS}, получено: ${days}`,
      );
    }
  }

  return {
    cities,
    days,
    noCache: values['no-cache'] === true,
  };
}
