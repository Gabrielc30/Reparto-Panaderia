import { getCache, setCache } from './db'

export async function fetchWithCache<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const data = await fetcher()
    await setCache(cacheKey, data)
    return data
  } catch (err) {
    const cached = await getCache<T>(cacheKey)
    if (cached !== undefined) return cached
    throw err
  }
}
