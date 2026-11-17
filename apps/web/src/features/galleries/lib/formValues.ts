// react-hook-form `setValueAs` helpers: optional inputs become null when empty
export const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)

export const toNumberOrNull = (v: unknown) =>
  v === '' || v === null || v === undefined ? null : Number(v)
