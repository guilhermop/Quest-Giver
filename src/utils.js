// ── utils.js ──────────────────────────────────────────────

/**
 * Format a YYYY-MM-DD date string for display.
 * Returns { text, overdue }.
 */
export function formatDueDate(dateStr) {
  if (!dateStr) return { text: '', overdue: false };

  // Parse as local date (avoid timezone offset issues)
  const [y, m, d] = dateStr.split('-').map(Number);
  const due   = new Date(y, m - 1, d);
  const today = startOfDay(new Date());
  const diff  = Math.round((due - today) / 86400000); // days

  if (diff < 0)  return { text: `Overdue · ${fmtDate(due)}`, overdue: true };
  if (diff === 0) return { text: 'Due today', overdue: false };
  if (diff === 1) return { text: 'Due tomorrow', overdue: false };
  if (diff <= 6)  return { text: `In ${diff} days`, overdue: false };
  return { text: fmtDate(due), overdue: false };
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function fmtDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function priorityLabel(priority) {
  return { low: 'Low', medium: 'Med', high: 'High' }[priority] ?? priority;
}

export function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}