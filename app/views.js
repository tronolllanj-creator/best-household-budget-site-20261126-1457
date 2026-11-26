import { CATEGORIES, MONTHS, formatMoney, monthLabel } from './data.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function dashboard(state, totals) {
  const { month, income, budgets, transactions } = state;
  const spent = totals.spent;
  const remaining = totals.remaining;
  const savingsRate = income > 0 ? Math.round((remaining / income) * 100) : 0;
  const monthOptions = MONTHS.map(m => `<option value="${escapeHtml(m.key)}"${m.key === month ? ' selected' : ''}>${escapeHtml(monthLabel(m.key))}</option>`).join('');
  
  // Top categories by spending
  const catSpending = {};
  transactions.filter(t => t.category !== 'Income').forEach(t => {
    catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
  });
  const topCats = Object.entries(catSpending).sort((a,b) => b[1] - a[1]).slice(0, 5);
  
  // Recent 5 transactions
  const recent = [...transactions].filter(t => t.category !== 'Income').sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  
  // Donut slices data
  const donutSlices = Object.entries(catSpending).map(([cat, amt]) => {
    const c = CATEGORIES.find(x => x.name === cat);
    return { label: cat, value: amt, color: c?.color || '#8c8c8c' };
  });
  
  // Bar rows data
  const barRows = CATEGORIES.map(c => ({
    label: c.name,
    budget: budgets[c.name] || 0,
    actual: catSpending[c.name] || 0,
    color: c.color
  }));
  
  return `
    <section class="dashboard" data-view="dashboard">
      <header class="view-header">
        <h1>Dashboard</h1>
        <div class="month-selector">
          <label for="month-select" class="visually-hidden">Select month</label>
          <select id="month-select" aria-label="Select month">${monthOptions}</select>
        </div>
      </header>
      
      <div class="stats-grid">
        <article class="stat-card income">
          <span class="stat-label">Income</span>
          <span class="stat-value positive">${escapeHtml(formatMoney(income))}</span>
        </article>
        <article class="stat-card spent">
          <span class="stat-label">Spent</span>
          <span class="stat-value negative">${escapeHtml(formatMoney(spent))}</span>
        </article>
        <article class="stat-card remaining">
          <span class="stat-label">Remaining</span>
          <span class="stat-value ${remaining >= 0 ? 'positive' : 'negative'}">${escapeHtml(formatMoney(remaining))}</span>
        </article>
        <article class="stat-card savings">
          <span class="stat-label">Savings Rate</span>
          <span class="stat-value">${escapeHtml(savingsRate)}%</span>
        </article>
      </div>
      
      <div class="charts-row">
        <section class="chart-card donut-card">
          <h2>Spending by Category</h2>
          <div class="donut-wrap">
            <canvas id="donut-chart" width="280" height="280" aria-label="Donut chart of spending by category"></canvas>
            <div class="donut-center" id="donut-center">
              <span class="donut-total-label">Total</span>
              <span class="donut-total-value">${escapeHtml(formatMoney(spent))}</span>
            </div>
          </div>
          <ul class="donut-legend" id="donut-legend" aria-label="Category legend">
            ${donutSlices.map(s => `
              <li><span class="legend-swatch" style="background:${escapeHtml(s.color)}"></span><span class="legend-label">${escapeHtml(s.label)}</span><span class="legend-value">${escapeHtml(formatMoney(s.value))}</span></li>
            `).join('')}
          </ul>
        </section>
        
        <section class="chart-card bars-card">
          <h2>Budget vs Actual</h2>
          <canvas id="bars-chart" width="400" height="320" aria-label="Horizontal bar chart comparing budget and actual spending per category"></canvas>
        </section>
      </div>
      
      <div class="bottom-row">
        <section class="card top-categories">
          <h2>Top Categories</h2>
          <ul class="category-list">
            ${topCats.map(([cat, amt]) => {
              const c = CATEGORIES.find(x => x.name === cat);
              const budget = budgets[cat] || 0;
              const pct = budget > 0 ? Math.round((amt / budget) * 100) : 0;
              return `
                <li>
                  <span class="cat-name"><span class="cat-dot" style="background:${escapeHtml(c?.color || '#8c8c8c')}"></span>${escapeHtml(cat)}</span>
                  <span class="cat-amount">${escapeHtml(formatMoney(amt))}</span>
                  <span class="cat-pct">${pct}% of budget</span>
                </li>
              `;
            }).join('')}
          </ul>
        </section>
        
        <section class="card recent-transactions">
          <div class="card-header">
            <h2>Recent Transactions</h2>
            <a href="#/transactions" class="view-all">View all</a>
          </div>
          <table class="txn-table">
            <thead><tr><th>Date</th><th>Payee</th><th>Category</th><th class="num">Amount</th></tr></thead>
            <tbody>
              ${recent.map(t => `
                <tr>
                  <td>${escapeHtml(t.date)}</td>
                  <td>${escapeHtml(t.payee)}</td>
                  <td><span class="cat-badge" style="background:${escapeHtml((CATEGORIES.find(c => c.name === t.category) || {color:'#8c8c8c'}).color + '22')};color:${escapeHtml((CATEGORIES.find(c => c.name === t.category) || {color:'#8c8c8c'}).color)}">${escapeHtml(t.category)}</span></td>
                  <td class="num negative">-${escapeHtml(formatMoney(t.amount))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
      
      <div class="reset-wrap">
        <button type="button" id="reset-btn" class="btn btn-ghost">Reset sample data</button>
      </div>
    </section>
  `;
}

export function transactionsView(state, totals, filter) {
  const { transactions } = state;
  const categories = ['All', ...CATEGORIES.map(c => c.name)];
  const filterOptions = categories.map(c => `<option value="${escapeHtml(c)}"${c === filter ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('');
  
  let filtered = transactions.filter(t => t.category !== 'Income');
  if (filter !== 'All') filtered = filtered.filter(t => t.category === filter);
  filtered.sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  
  let runningTotal = 0;
  const rows = filtered.map(t => {
    runningTotal += t.amount;
    const cat = CATEGORIES.find(c => c.name === t.category);
    return `
      <tr data-id="${escapeHtml(t.id)}">
        <td>${escapeHtml(t.date)}</td>
        <td>${escapeHtml(t.payee)}</td>
        <td><span class="cat-badge" style="background:${escapeHtml((cat?.color || '#8c8c8c') + '22')};color:${escapeHtml(cat?.color || '#8c8c8c')}">${escapeHtml(t.category)}</span></td>
        <td>${escapeHtml(t.note || '')}</td>
        <td class="num negative">-${escapeHtml(formatMoney(t.amount))}</td>
        <td class="num">${escapeHtml(formatMoney(runningTotal))}</td>
        <td class="actions">
          <button type="button" class="btn-icon edit-btn" aria-label="Edit ${escapeHtml(t.payee)}" data-id="${escapeHtml(t.id)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button type="button" class="btn-icon delete-btn" aria-label="Delete ${escapeHtml(t.payee)}" data-id="${escapeHtml(t.id)}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </td>
      </tr>
    `;
  }).join('');
  
  return `
    <section class="transactions-view" data-view="transactions">
      <header class="view-header">
        <h1>Transactions</h1>
        <div class="filter-wrap">
          <label for="category-filter" class="visually-hidden">Filter by category</label>
          <select id="category-filter" aria-label="Filter by category">${filterOptions}</select>
        </div>
      </header>
      <div class="table-wrap">
        <table class="txn-table full">
          <thead>
            <tr>
              <th>Date</th><th>Payee</th><th>Category</th><th>Note</th><th class="num">Amount</th><th class="num">Running Total</th><th></th>
            </tr>
          </thead>
          <tbody id="txn-body">${rows}</tbody>
        </table>
      </div>
      <div class="txn-summary">
        <span>Showing ${escapeHtml(filtered.length)} of ${escapeHtml(transactions.filter(t => t.category !== 'Income').length)} transactions</span>
        <span class="total-badge">Total: ${escapeHtml(formatMoney(totals.spent))}</span>
      </div>
    </section>
  `;
}

export function budgetsView(state, totals) {
  const { budgets } = state;
  const catSpending = {};
  state.transactions.filter(t => t.category !== 'Income').forEach(t => {
    catSpending[t.category] = (catSpending[t.category] || 0) + t.amount;
  });
  
  const rows = CATEGORIES.map(c => {
    const budget = budgets[c.name] || 0;
    const actual = catSpending[c.name] || 0;
    const remaining = budget - actual;
    const pct = budget > 0 ? Math.min(100, Math.round((actual / budget) * 100)) : 0;
    let cls = 'green';
    if (pct >= 100) cls = 'red';
    else if (pct >= 80) cls = 'amber';
    return `
      <tr data-category="${escapeHtml(c.name)}">
        <td>
          <span class="cat-name"><span class="cat-dot" style="background:${escapeHtml(c.color)}"></span>${escapeHtml(c.name)}</span>
        </td>
        <td><input type="number" class="budget-input" value="${escapeHtml(budget)}" step="0.01" min="0" aria-label="Budget for ${escapeHtml(c.name)}"></td>
        <td class="num">${escapeHtml(formatMoney(actual))}</td>
        <td class="num ${remaining >= 0 ? 'positive' : 'negative'}">${escapeHtml(formatMoney(remaining))}</td>
        <td>
          <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(c.name)} budget usage ${pct}%">
            <div class="progress-fill ${cls}" style="width:${pct}%"></div>
          </div>
          <span class="pct-label">${pct}%</span>
        </td>
        <td><button type="button" class="btn-icon save-budget" aria-label="Save budget for ${escapeHtml(c.name)}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button></td>
      </tr>
    `;
  }).join('');
  
  const totalBudget = Object.values(budgets).reduce((a,b) => a + b, 0);
  const totalActual = Object.values(catSpending).reduce((a,b) => a + b, 0);
  const totalRemaining = totalBudget - totalActual;
  
  return `
    <section class="budgets-view" data-view="budgets">
      <header class="view-header">
        <h1>Budgets</h1>
      </header>
      <div class="table-wrap">
        <table class="budget-table">
          <thead>
            <tr><th>Category</th><th>Budget</th><th>Actual</th><th>Remaining</th><th>Progress</th><th></th></tr>
          </thead>
          <tbody id="budget-body">${rows}</tbody>
          <tfoot>
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td class="num"><strong>${escapeHtml(formatMoney(totalBudget))}</strong></td>
              <td class="num"><strong>${escapeHtml(formatMoney(totalActual))}</strong></td>
              <td class="num ${totalRemaining >= 0 ? 'positive' : 'negative'}"><strong>${escapeHtml(formatMoney(totalRemaining))}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  `;
}

export function addView(state, editing) {
  const categories = CATEGORIES.map(c => c.name);
  const catOptions = categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  
  const today = state.month + '-01';
  const dateVal = editing?.date || today;
  const payeeVal = editing?.payee || '';
  const catVal = editing?.category || categories[0];
  const amountVal = editing?.amount || '';
  const noteVal = editing?.note || '';
  
  return `
    <section class="add-view" data-view="add">
      <header class="view-header">
        <h1>${editing ? 'Edit Transaction' : 'Add Transaction'}</h1>
      </header>
      <form id="txn-form" class="txn-form" novalidate>
        <input type="hidden" name="id" value="${escapeHtml(editing?.id || '')}">
        
        <div class="form-row">
          <label for="txn-date">Date</label>
          <input type="date" id="txn-date" name="date" value="${escapeHtml(dateVal)}" required>
        </div>
        
        <div class="form-row">
          <label for="txn-payee">Payee</label>
          <input type="text" id="txn-payee" name="payee" value="${escapeHtml(payeeVal)}" placeholder="e.g. Grocery Store" required maxlength="80">
        </div>
        
        <div class="form-row">
          <label for="txn-category">Category</label>
          <select id="txn-category" name="category" required>${catOptions}</select>
        </div>
        
        <div class="form-row">
          <label for="txn-amount">Amount</label>
          <input type="number" id="txn-amount" name="amount" value="${escapeHtml(amountVal)}" step="0.01" min="0.01" placeholder="0.00" required>
        </div>
        
        <div class="form-row">
          <label for="txn-note">Note (optional)</label>
          <input type="text" id="txn-note" name="note" value="${escapeHtml(noteVal)}" placeholder="Additional details" maxlength="120">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editing ? 'Save Changes' : 'Add Transaction'}</button>
          <a href="#/transactions" class="btn btn-ghost">Cancel</a>
        </div>
      </form>
    </section>
  `;
}
