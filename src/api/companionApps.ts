import instance from '@/config/axios'

export interface CompanionApps {
  ios: string
  android: string
}

export function parseCompanionApps(raw?: string): CompanionApps {
  const value = raw ? JSON.parse(raw) : {}
  const storeUrl = (input: unknown, hostname: string): string => {
    if (typeof input !== 'string' || !input.trim()) return ''
    try {
      const url = new URL(input.trim())
      return url.protocol === 'https:' && url.hostname === hostname && !url.username && !url.password
        ? url.href
        : ''
    } catch {
      return ''
    }
  }
  return {
    ios: storeUrl(value?.ios, 'apps.apple.com'),
    android: storeUrl(value?.android, 'play.google.com'),
  }
}

export async function getCompanionApps(): Promise<CompanionApps> {
  const config: Record<string, string> = await instance.get('/public/config', {
    params: { keys: 'wristo_companion_apps' },
  })
  return parseCompanionApps(config.wristo_companion_apps)
}
