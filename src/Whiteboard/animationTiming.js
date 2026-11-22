/** Keep explanatory movements on screen until the actual algorithm finishes. */
export function animationDuration(type, payload = {}) {
  const count = (max) => Math.min(max, Array.isArray(payload.values) ? payload.values.length : 0);
  const seconds = (fallback, min = 1) => Math.max(min, Number(payload.step_seconds) || fallback);
  if (type === 'animate_transfer') return Math.max(0.4, Number(payload.duration_seconds) || 1.4) + 0.45;
  if (type === 'animate_loop') return count(8) * seconds(2);
  if (type === 'animate_sort') { const n = count(7); return n * (n - 1) / 2 * seconds(1.8, 0.8); }
  if (type === 'animate_stack' || type === 'animate_queue') return Math.min(12, payload.operations?.length || 0) * seconds(2.8);
  if (type === 'animate_search') {
    const values = Array.isArray(payload.values) ? payload.values.slice(0, 10) : [];
    let comparisons = 0;
    if (payload.strategy === 'binary') {
      let low = 0, high = values.length - 1;
      while (low <= high) {
        comparisons++;
        const mid = Math.floor((low + high) / 2);
        if (values[mid] === payload.target) break;
        if (values[mid] < payload.target) low = mid + 1; else high = mid - 1;
      }
    } else {
      const found = values.indexOf(payload.target);
      comparisons = found < 0 ? values.length : found + 1;
    }
    return comparisons * seconds(2.5);
  }
  return 0;
}
