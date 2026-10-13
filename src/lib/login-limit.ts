const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; since: number };

const buckets = new Map<string, Bucket>();

export function registerAttempt(key: string) {
  const now = Date.now();
  if (buckets.size > 1000) {
    for (const [id, bucket] of buckets) {
      if (now - bucket.since > WINDOW_MS) buckets.delete(id);
    }
  }

  const current = buckets.get(key);
  if (!current || now - current.since > WINDOW_MS) {
    buckets.set(key, { count: 1, since: now });
    return false;
  }

  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

export function clearAttempts(key: string) {
  buckets.delete(key);
}
