const API_ROOT = '/booktracker/api';

export async function api(path, method = 'GET', body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_ROOT}${path}`, opts);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
