// Minimal analytics dispatcher wrapper (no PII)
export type EventPayload = Record<string, string | number | boolean | null | undefined>;

export function track(eventName: string, payload: EventPayload = {}) {
  try {
    // Ensure no PII fields are sent (basic guard)
    const scrubbed: EventPayload = {};
    for (const [k, v] of Object.entries(payload)) {
      if (/name|email|phone|address|eircode/i.test(k)) continue;
      scrubbed[k] = v;
    }
    // Replace with real analytics integration later
    if (typeof window !== 'undefined') {
      (window as any).__events = (window as any).__events || [];
      (window as any).__events.push({ event: eventName, ...scrubbed, ts: Date.now() });
    }
  } catch {
    // no-op
  }
}
