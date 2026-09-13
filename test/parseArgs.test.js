import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../src/cli/parseArgs.js';
import { CliValidationError } from '../src/errors.js';

test('parseCliArgs разбирает один город с параметрами по умолчанию', () => {
  const result = parseCliArgs(['--city', 'Москва']);
  assert.deepEqual(result, { cities: ['Москва'], days: 3, noCache: false });
});

test('parseCliArgs разбирает несколько городов через запятую', () => {
  const result = parseCliArgs(['--city', 'Москва, Санкт-Петербург, Казань', '--days', '5']);
  assert.deepEqual(result.cities, ['Москва', 'Санкт-Петербург', 'Казань']);
  assert.equal(result.days, 5);
});

test('parseCliArgs распознаёт флаг --no-cache', () => {
  const result = parseCliArgs(['--city', 'Москва', '--no-cache']);
  assert.equal(result.noCache, true);
});

test('parseCliArgs выбрасывает ошибку без --city', () => {
  assert.throws(() => parseCliArgs(['--days', '3']), CliValidationError);
});

test('parseCliArgs выбрасывает ошибку при пустом --city', () => {
  assert.throws(() => parseCliArgs(['--city', '']), CliValidationError);
});

test('parseCliArgs выбрасывает ошибку при --days 0', () => {
  assert.throws(() => parseCliArgs(['--city', 'Москва', '--days', '0']), CliValidationError);
});

test('parseCliArgs выбрасывает ошибку при --days 8', () => {
  assert.throws(() => parseCliArgs(['--city', 'Москва', '--days', '8']), CliValidationError);
});

test('parseCliArgs выбрасывает ошибку при нечисловом --days', () => {
  assert.throws(() => parseCliArgs(['--city', 'Москва', '--days', 'abc']), CliValidationError);
});

test('parseCliArgs выбрасывает ошибку при неизвестном аргументе', () => {
  assert.throws(() => parseCliArgs(['--city', 'Москва', '--unknown', 'x']), CliValidationError);
});
