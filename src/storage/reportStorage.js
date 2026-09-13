import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function sanitizeCityName(cityName) {
  return cityName.trim().replace(/[\\/:*?"<>|]/g, '_');
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getReportPath(cityName, config) {
  const fileName = `${sanitizeCityName(cityName)}-${getTodayDateString()}.json`;
  return path.join(config.reportsDir, fileName);
}

export async function readCachedReport(cityName, config) {
  const filePath = getReportPath(cityName, config);
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveReport(cityName, report, config) {
  await mkdir(config.reportsDir, { recursive: true });
  const filePath = getReportPath(cityName, config);
  await writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
  return filePath;
}
