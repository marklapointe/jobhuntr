import { BrowserContext, Page, Cookie } from 'playwright'

export interface SessionProfile {
  id: string
  cookies: Cookie[]
  localStorage: Record<string, string>
  sessionStorage: Record<string, string>
  userAgent?: string
  viewport?: { width: number; height: number }
}

export class SessionManager {
  private profiles: Map<string, SessionProfile> = new Map()

  async saveSession(context: BrowserContext, profileId: string): Promise<void> {
    const cookies = await context.cookies()
    const localStorage = await this.getLocalStorage(context)
    const sessionStorage = await this.getSessionStorage(context)
    
    this.profiles.set(profileId, {
      id: profileId,
      cookies,
      localStorage,
      sessionStorage,
    })
  }

  async restoreSession(context: BrowserContext, profileId: string): Promise<void> {
    const profile = this.profiles.get(profileId)
    if (!profile) return

    if (profile.cookies.length > 0) {
      await context.addCookies(profile.cookies)
    }

    for (const [key, value] of Object.entries(profile.localStorage)) {
      await context.addInitScript((script) => {
        const [key, value] = script
        window.localStorage.setItem(key, value)
      }, [key, value])
    }
  }

  deleteSession(profileId: string): void {
    this.profiles.delete(profileId)
  }

  getSession(profileId: string): SessionProfile | undefined {
    return this.profiles.get(profileId)
  }

  listSessions(): string[] {
    return Array.from(this.profiles.keys())
  }

  private async getLocalStorage(context: BrowserContext): Promise<Record<string, string>> {
    const page = context.pages()[0]
    if (!page) return {}
    
    return page.evaluate(() => {
      const result: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          result[key] = localStorage.getItem(key) || ''
        }
      }
      return result
    })
  }

  private async getSessionStorage(context: BrowserContext): Promise<Record<string, string>> {
    const page = context.pages()[0]
    if (!page) return {}
    
    return page.evaluate(() => {
      const result: Record<string, string> = {}
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          result[key] = sessionStorage.getItem(key) || ''
        }
      }
      return result
    })
  }
}

export const sessionManager = new SessionManager()
