const isSimpleType = (value: unknown): value is boolean | number | string =>
  ['boolean', 'number', 'string'].includes(typeof value);

export const createKey = (idx: number) => `${idx}:${Date.now()}:${Math.random()}`;
export const safetyPrint = (data: unknown, fallback = '') => {
  try {
    return (
      (isSimpleType(data) ? String(data) : undefined) ?? (data ? JSON.stringify(data) : fallback)
    );
  } catch {
    return fallback;
  }
};
