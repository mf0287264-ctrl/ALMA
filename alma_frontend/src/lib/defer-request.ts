/** Let React's development cleanup cancel a duplicate request before it starts. */
export function deferRequest(task: () => void | Promise<unknown>): () => void {
  let cancelled = false;
  void Promise.resolve().then(() => { if (!cancelled) return task(); });
  return () => { cancelled = true; };
}
