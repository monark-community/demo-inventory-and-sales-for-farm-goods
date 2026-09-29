// Math.random, not crypto.randomUUID: the latter throws on plain-http LAN dev (phones).
export function randomHex(length: number): string {
  let out = ""
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 16).toString(16)
  return out
}

export function randomHash(): string {
  return `0x${randomHex(64)}`
}

export function randomAddress(): `0x${string}` {
  return `0x${randomHex(40)}`
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomHex(6)}`
}

export function isTxHash(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value.trim())
}
