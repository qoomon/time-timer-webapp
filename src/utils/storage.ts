const KEY = (k: string) => `time-timer/${k}`

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(KEY(key))
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(KEY(key), JSON.stringify(value))
  },
}
