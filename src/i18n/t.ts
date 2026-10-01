/** Replace {placeholders} in a dictionary string. Client-safe (no dictionaries imported). */
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}

/** Pick the singular or plural template ("{n} change" / "{n} changes"). */
export function plural(n: number, forms: { one: string; other: string }, vars: Record<string, string | number> = {}): string {
  return t(n === 1 ? forms.one : forms.other, { n, ...vars })
}
