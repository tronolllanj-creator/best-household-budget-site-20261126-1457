import { formatMoney } from './data.js';

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

export function drawDonut(canvas, slices) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  ctx.clearRect(0, 0, width, height);

  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0 || slices.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No spending data', width / 2, height / 2);
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 * 0.75;
  const thickness = radius * 0.45;
  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    const angle = (slice.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = slice.color;
    ctx.stroke();
    startAngle += angle;
  });

  ctx.fillStyle = '#1f2a24';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // center total is shown by the .donut-center overlay in views.js
  ctx.font = '12px system-ui';
  ctx.fillStyle = '#6b7280';
  // center label is shown by the .donut-center overlay in views.js
}

export function drawBars(canvas, rows) {
  canvas.style.height = (24 + rows.length * 34) + 'px';
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  ctx.clearRect(0, 0, width, height);

  if (!rows.length) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No budget data', width / 2, height / 2);
    return;
  }

  const paddingLeft = 110;
  const paddingRight = 90;
  const paddingTop = 16;
  const rowHeight = 34;
  const barHeight = 18;
  const availableWidth = width - paddingLeft - paddingRight;

  const maxVal = Math.max(1, ...rows.flatMap(r => [r.actual, r.budget]));

  rows.forEach((row, i) => {
    const y = paddingTop + i * rowHeight + (rowHeight - barHeight) / 2;
    const barY = y;
    const actualWidth = (row.actual / maxVal) * availableWidth;
    const budgetX = paddingLeft + (row.budget / maxVal) * availableWidth;

    // category label
    ctx.fillStyle = '#1f2a24';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(row.label, paddingLeft - 8, barY + barHeight / 2);

    // actual bar
    ctx.fillStyle = row.color;
    ctx.fillRect(paddingLeft, barY, actualWidth, barHeight);

    // budget marker line in muted grey
    ctx.strokeStyle = '#1f2a24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(budgetX, barY - 3);
    ctx.lineTo(budgetX, barY + barHeight + 3);
    ctx.stroke();

    // actual value label
    ctx.fillStyle = '#1f2a24';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatMoney(row.actual), paddingLeft + actualWidth + 6, barY + barHeight / 2);

    // budget value label
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(formatMoney(row.budget), budgetX, barY - 8);
  });
}
