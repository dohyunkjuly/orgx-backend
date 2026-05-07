/**
 * Parse a short duration string into milliseconds.
 * Supports "15s", "5m", "2h", "30d". Defaults to 15 minutes if invalid.
 */
export const parseDurationToMs = (s: string): number => {
  const m = /^(\d+)\s*(s|m|h|d)$/.exec(s.trim())
  if (!m) return 15 * 60 * 1000
  const n = Number(m[1])
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2] as 's' | 'm' | 'h' | 'd']
  return n * mult
}

/**
 * Parse a short duration string into seconds.
 * Useful for things like JWT `expiresIn` which accepts a number of seconds.
 */
export const parseDurationToSeconds = (s: string): number => {
  return Math.floor(parseDurationToMs(s) / 1000)
}