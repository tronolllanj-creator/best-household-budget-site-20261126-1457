// app/data.js
export const CATEGORIES = [
  { name: 'Housing', budget: 1600, color: '#2f6f4f' },
  { name: 'Groceries', budget: 650, color: '#d98e2b' },
  { name: 'Transport', budget: 320, color: '#3f7fb8' },
  { name: 'Utilities', budget: 260, color: '#7a5fb0' },
  { name: 'Dining Out', budget: 200, color: '#c65b4e' },
  { name: 'Entertainment', budget: 150, color: '#4fae8d' },
  { name: 'Health', budget: 180, color: '#b07a3f' },
  { name: 'Clothing', budget: 120, color: '#8a6d9b' },
  { name: 'Savings', budget: 800, color: '#2e7d6b' },
  { name: 'Misc', budget: 120, color: '#8c8c8c' }
];

export const SAMPLE_TRANSACTIONS = [
  { id: 't1', date: '2026-11-01', payee: 'Landlord', category: 'Housing', amount: 1600, note: 'Nov rent' },
  { id: 't2', date: '2026-11-03', payee: 'SuperMart', category: 'Groceries', amount: 200, note: 'Week 1' },
  { id: 't3', date: '2026-11-07', payee: 'SuperMart', category: 'Groceries', amount: 200, note: 'Week 2' },
  { id: 't4', date: '2026-11-12', payee: 'Farmers Market', category: 'Groceries', amount: 185, note: 'Fresh produce' },
  { id: 't5', date: '2026-11-05', payee: 'City Transit', category: 'Transport', amount: 150, note: 'Monthly pass' },
  { id: 't6', date: '2026-11-18', payee: 'GasStation', category: 'Transport', amount: 140, note: 'Fill up' },
  { id: 't7', date: '2026-11-09', payee: 'PowerCo', category: 'Utilities', amount: 120, note: 'Oct usage' },
  { id: 't8', date: '2026-11-20', payee: 'NetProvider', category: 'Utilities', amount: 125, note: 'Nov' },
  { id: 't9', date: '2026-11-10', payee: 'Bistro', category: 'Dining Out', amount: 100, note: 'Family' },
  { id: 't10', date: '2026-11-22', payee: 'PizzaPlace', category: 'Dining Out', amount: 85, note: 'Friday' },
  { id: 't11', date: '2026-11-14', payee: 'Cinema', category: 'Entertainment', amount: 70, note: 'Tickets' },
  { id: 't12', date: '2026-11-25', payee: 'StreamCo', category: 'Entertainment', amount: 50, note: 'Sub' },
  { id: 't13', date: '2026-11-16', payee: 'Pharmacy', category: 'Health', amount: 50, note: 'Meds' },
  { id: 't14', date: '2026-11-28', payee: 'Clinic', category: 'Health', amount: 45, note: 'Visit' },
  { id: 't15', date: '2026-11-19', payee: 'KidsStore', category: 'Clothing', amount: 60, note: 'School' },
  { id: 't16', date: '2026-11-27', payee: 'CoatShop', category: 'Clothing', amount: 50, note: 'Coat' },
  { id: 't17', date: '2026-11-21', payee: 'Bank', category: 'Savings', amount: 800, note: 'Auto transfer' },
  { id: 't18', date: '2026-11-23', payee: 'Various', category: 'Misc', amount: 30, note: 'Household' },
  { id: 't19', date: '2026-11-30', payee: 'Various', category: 'Misc', amount: 30, note: 'Small items' },
  { id: 't20', date: '2026-10-15', payee: 'SuperMart', category: 'Groceries', amount: 120, note: 'Oct stock' },
  { id: 't21', date: '2026-10-20', payee: 'GasStation', category: 'Transport', amount: 40, note: 'Oct fill' },
  { id: 't22', date: '2026-10-25', payee: 'PowerCo', category: 'Utilities', amount: 80, note: 'Oct bill' }
];

export const MONTHS = [
  { key: '2026-10', label: 'October 2026' },
  { key: '2026-11', label: 'November 2026' }
];

export function formatMoney(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function monthLabel(key) {
  const m = MONTHS.find(x => x.key === key);
  return m ? m.label : key;
}
