import { CATEGORIES, SAMPLE_TRANSACTIONS, MONTHS, formatMoney, monthLabel } from './data.js';
import { dashboard, transactionsView, budgetsView, addView } from './views.js';
import { drawDonut, drawBars } from './charts.js';

const STORAGE_KEY = 'homeledger-v1';
const STATUS = document.getElementById('status');

let state = { month: '2026-11', income: 5400, budgets: {}, transactions: [] };
let idCounter = 1;

function announce(msg) { if (STATUS) STATUS.textContent = msg; }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { month: parsed.month || '2026-11', income: parsed.income ?? 5400,
        budgets: parsed.budgets || {}, transactions: parsed.transactions || [] };
      const maxId = state.transactions.reduce((m, t) => {
        const n = parseInt(t.id?.replace('t', '') || '0', 10);
        return n > m ? n : m;
      }, 0);
      idCounter = maxId + 1;
      return;
    }
  } catch (e) { console.warn('load failed', e); }
  seedSample();
}

function seedSample() {
  state = { month: '2026-11', income: 5400, budgets: {}, transactions: [] };
  CATEGORIES.forEach(c => state.budgets[c.name] = c.budget);
  SAMPLE_TRANSACTIONS.forEach(t => state.transactions.push({ ...t, id: `t${idCounter++}` }));
  save();
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('save failed', e); }
}

function computeTotals(month) {
  const byCat = {};
  let spent = 0;
  state.transactions.forEach(t => {
    if (t.date.startsWith(month)) {
      spent += t.amount;
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    }
  });
  const remaining = state.income - spent;
  const savingsRate = state.income > 0 ? (remaining / state.income) * 100 : 0;
  const rows = CATEGORIES.map(c => ({
    category: c.name,
    label: c.name,
    budget: state.budgets[c.name] ?? c.budget,
    actual: byCat[c.name] || 0,
    color: c.color
  }));
  return { spent, remaining, savingsRate, byCat, rows };
}

function render() {
  const hash = location.hash.slice(1) || '/'
  const [path, query] = hash.split('?');
  const params = new URLSearchParams(query);
  const totals = computeTotals(state.month);
  const root = document.getElementById('app');
  let html = '';

  if (path === '/transactions') {
    html = transactionsView(state, totals, params.get('filter') || 'All');
    announce('Transactions view');
  } else if (path === '/budgets') {
    html = budgetsView(state, totals);
    announce('Budgets view');
  } else if (path === '/add') {
    const editId = params.get('id');
    const editing = editId ? state.transactions.find(t => t.id === editId) : null;
    html = addView(state, editing);
    announce(editing ? 'Edit transaction' : 'Add transaction');
  } else {
    html = dashboard(state, totals);
    announce('Dashboard view');
  }

  root.innerHTML = html;
  attachListeners(path, params);
  drawCharts(totals);
}

function attachListeners(path, params) {
  const root = document.getElementById('app');

  root.querySelectorAll('[data-nav]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); location.hash = a.dataset.nav; });
  });

  const monthSel = root.querySelector('#month-select');
  if (monthSel) {
    monthSel.value = state.month;
    monthSel.addEventListener('change', e => { state.month = e.target.value; save(); render(); });
  }

  const incomeInput = root.querySelector('#income-input');
  if (incomeInput) {
    incomeInput.addEventListener('change', e => { state.income = parseFloat(e.target.value) || 0; save(); render(); });
  }

  const resetBtn = root.querySelector('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => { seedSample(); render(); });
  }

  if (path === '/transactions') {
    const filter = root.querySelector('#cat-filter');
    if (filter) {
      filter.value = params.get('filter') || '';
      filter.addEventListener('change', e => {
        const v = e.target.value;
        location.hash = v ? `/transactions?filter=${encodeURIComponent(v)}` : '/transactions';
      });
    }
    root.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.transactions = state.transactions.filter(t => t.id !== btn.dataset.del);
        save(); render();
      });
    });
    root.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => location.hash = `/add?id=${btn.dataset.edit}`);
    });
  }

  if (path === '/budgets') {
    root.querySelectorAll('[data-budget-save]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.budgetSave;
        const input = root.querySelector(`[data-budget-input="${cat}"]`);
        if (input) {
          const val = parseFloat(input.value);
          if (!isNaN(val) && val >= 0) {
            state.budgets[cat] = val;
            save(); render();
          }
        }
      });
    });
  }

  if (path === '/add') {
    const form = root.querySelector('#tx-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const payee = fd.get('payee').trim();
        const amount = parseFloat(fd.get('amount'));
        if (!payee || isNaN(amount) || amount <= 0) return;
        const tx = {
          id: form.dataset.editing ? form.dataset.editing : `t${idCounter++}`,
          date: fd.get('date'),
          payee,
          category: fd.get('category'),
          amount,
          note: fd.get('note').trim()
        };
        if (form.dataset.editing) {
          state.transactions = state.transactions.map(t => t.id === tx.id ? tx : t);
        } else {
          state.transactions.unshift(tx);
        }
        save();
        location.hash = '/transactions';
      });
      const cancel = root.querySelector('#cancel-btn');
      if (cancel) cancel.addEventListener('click', () => location.hash = '/transactions');
    }
  }
}

function drawCharts(totals) {
  const donut = document.getElementById('donut-chart');
  if (donut) {
    const slices = totals.rows.filter(r => r.actual > 0).map(r => ({
      label: r.category, value: r.actual, color: r.color
    }));
    drawDonut(donut, slices, totals.spent);
  }
  const bars = document.getElementById('bars-chart');
  if (bars) {
    drawBars(bars, totals.rows);
  }
}

function stageShot() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return;

  state = { month: '2026-11', income: 5400, budgets: {}, transactions: [] };
  CATEGORIES.forEach(c => state.budgets[c.name] = c.budget);
  SAMPLE_TRANSACTIONS.forEach(t => state.transactions.push({ ...t, id: `t${idCounter++}` }));

  if (shot === 'phone') {
    document.documentElement.style.setProperty('--viewport-width', '390px');
    document.body.style.width = '390px';
  }

  const hashMap = { dashboard: '/', transactions: '/transactions', budgets: '/budgets', phone: '/' };
  location.hash = hashMap[shot] || '/';

  const totals = computeTotals(state.month);
  const root = document.getElementById('app');
  let html = '';
  if (shot === 'transactions') html = transactionsView(state, totals, 'All');
  else if (shot === 'budgets') html = budgetsView(state, totals);
  else html = dashboard(state, totals);
  root.innerHTML = html;
  attachListeners(location.hash.slice(1), new URLSearchParams());
  drawCharts(totals);

  requestAnimationFrame(() => {
    drawCharts(computeTotals(state.month));
    window.__shotReady = true;
  });
}

window.onerror = (msg, src, lineno, colno, err) => {
  window.__shotError = `${msg} at ${src}:${lineno}:${colno}`;
  return false;
};

loadState();
stageShot();
window.addEventListener('hashchange', render);
render();