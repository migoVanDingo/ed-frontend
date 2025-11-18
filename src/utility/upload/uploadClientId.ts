// makeClientId.ts
export const makeClientId = () =>
  crypto.randomUUID?.() || `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
