type Params = Record<string, string | number>;

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function interpolate(
  template: string,
  params?: Params,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? `{${key}}` : String(value);
  });
}

export function createTranslator(source: unknown) {
  return function t(path: string, params?: Params): string {
    const value = getByPath(source, path);
    if (typeof value !== "string") return path;
    return interpolate(value, params);
  };
}

export type Translator = ReturnType<typeof createTranslator>;

export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overlay: Record<string, unknown>,
): T {
  const result = { ...base } as Record<string, unknown>;

  for (const [key, value] of Object.entries(overlay)) {
    const existing = result[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      result[key] = deepMerge(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else if (value !== undefined) {
      result[key] = value;
    }
  }

  return result as T;
}
