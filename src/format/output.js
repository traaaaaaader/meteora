function padRight(value, width) {
  return String(value).padEnd(width, ' ');
}

export function formatCityReport(report) {
  const lines = [];

  lines.push(`\n=== ${report.city}, ${report.country} ===`);
  lines.push(`Координаты: ${report.latitude}, ${report.longitude}`);
  if (report.fromCache) {
    lines.push('(данные загружены из кэша)');
  }
  lines.push('');
  lines.push(
    `${padRight('Дата', 12)}${padRight('Мин, °C', 10)}${padRight('Макс, °C', 10)}Осадки, мм`,
  );
  lines.push('-'.repeat(44));

  for (const day of report.days) {
    lines.push(
      `${padRight(day.date, 12)}${padRight(day.tempMin, 10)}${padRight(day.tempMax, 10)}${day.precipitation}`,
    );
  }

  return lines.join('\n');
}

export function formatCityError(cityName, error) {
  return `\n=== ${cityName} ===\nОшибка: ${error.message}`;
}
