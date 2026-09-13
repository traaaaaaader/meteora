const fileInput = document.getElementById('fileInput');
const meta = document.getElementById('meta');
const errorBox = document.getElementById('error');
const table = document.getElementById('table');
const tableBody = document.getElementById('tableBody');

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  errorBox.textContent = '';
  table.hidden = true;
  meta.textContent = '';
  tableBody.innerHTML = '';

  try {
    const text = await file.text();
    const report = JSON.parse(text);
    renderReport(report);
  } catch (err) {
    errorBox.textContent = `Не удалось прочитать отчёт: ${err.message}`;
  }
});

function renderReport(report) {
  const metaLines = [
    `Город: ${report.city ?? '—'}`,
    `Страна: ${report.country ?? '—'}`,
    `Координаты: ${report.latitude ?? '—'}, ${report.longitude ?? '—'}`,
    `Сформирован: ${report.generatedAt ?? '—'}`,
  ];

  meta.innerHTML = '';
  for (const line of metaLines) {
    const p = document.createElement('p');
    p.textContent = line;
    meta.appendChild(p);
  }

  const days = Array.isArray(report.days) ? report.days : [];
  for (const day of days) {
    const row = document.createElement('tr');

    const cells = [day.date, day.tempMin, day.tempMax, day.precipitation];
    for (const value of cells) {
      const cell = document.createElement('td');
      cell.textContent = value ?? '—';
      row.appendChild(cell);
    }

    tableBody.appendChild(row);
  }

  table.hidden = days.length === 0;
}
