import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { readCachedReport, saveReport } from '../src/storage/reportStorage.js';

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'weather-digest-test-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('saveReport создаёт JSON-файл с именем reports/{город}-{дата}.json', async () => {
  await withTempDir(async (dir) => {
    const config = { reportsDir: dir };
    const report = { city: 'Москва', country: 'Россия', days: [] };

    const filePath = await saveReport('Москва', report, config);
    const today = new Date().toISOString().slice(0, 10);

    assert.equal(path.basename(filePath), `Москва-${today}.json`);

    const files = await readdir(dir);
    assert.deepEqual(files, [`Москва-${today}.json`]);
  });
});

test('saveReport безопасно санитизирует имя города с недопустимыми символами', async () => {
  await withTempDir(async (dir) => {
    const config = { reportsDir: dir };
    const filePath = await saveReport('Санкт-Петербург/Тест', { city: 'x' }, config);

    assert.ok(!path.basename(filePath).includes('/'));
  });
});

test('readCachedReport возвращает null, если отчёта ещё нет', async () => {
  await withTempDir(async (dir) => {
    const config = { reportsDir: dir };
    const result = await readCachedReport('Москва', config);
    assert.equal(result, null);
  });
});

test('readCachedReport читает ранее сохранённый отчёт', async () => {
  await withTempDir(async (dir) => {
    const config = { reportsDir: dir };
    const report = { city: 'Казань', country: 'Россия', days: [{ date: '2026-09-12' }] };

    await saveReport('Казань', report, config);
    const cached = await readCachedReport('Казань', config);

    assert.deepEqual(cached, report);
  });
});

test('readCachedReport возвращает null при повреждённом JSON в кэше', async () => {
  await withTempDir(async (dir) => {
    const config = { reportsDir: dir };
    const today = new Date().toISOString().slice(0, 10);
    await writeFile(path.join(dir, `Москва-${today}.json`), '{ невалидный json', 'utf-8');

    const result = await readCachedReport('Москва', config);
    assert.equal(result, null);
  });
});
