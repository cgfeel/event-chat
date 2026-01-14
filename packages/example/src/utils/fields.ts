const isSimpleType = (value: unknown): value is boolean | number | string =>
  ['boolean', 'number', 'string'].includes(typeof value);

export const createKey = (idx: number) => `${idx}:${Date.now()}:${Math.random()}`;
export const isKey = <T extends Record<string, unknown>>(key: unknown, data: T): key is keyof T =>
  isPropertyKey(key) && key in data;

export const isPropertyKey = (value: unknown): value is PropertyKey =>
  ['number', 'string', 'symbol'].includes(typeof value);

export const objectEntries = <T extends object, K = keyof T>(obj: T) =>
  Object.entries(obj) as Array<[K, T[keyof T]]>;

export const objectKeys = <T extends object, K = keyof T>(obj: T) => Object.keys(obj) as K[];

export const safetyParse = (value: string) => {
  try {
    const data: unknown = JSON.parse(value);
    return typeof data === 'object' && data !== null ? data : undefined;
  } catch {
    return undefined;
  }
};

export const safetyPrint = (data: unknown, fallback = '') => {
  try {
    return (
      (isSimpleType(data) ? String(data) : undefined) ?? (data ? JSON.stringify(data) : fallback)
    );
  } catch {
    return fallback;
  }
};
