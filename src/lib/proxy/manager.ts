interface Proxy {
  host: string
  port: number
  protocol: 'http' | 'https' | 'socks5'
  username?: string
  password?: string
  lastUsed?: number
  failCount?: number
}

class ProxyManager {
  private proxies: Proxy[]
  private currentIndex: number

  constructor(proxies: Proxy[] = []) {
    this.proxies = proxies
    this.currentIndex = 0
  }

  getNextProxy(): Proxy {
    if (this.proxies.length === 0) {
      throw new Error('No proxies available')
    }
    const proxy = this.proxies[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length
    return proxy
  }

  async healthCheck(proxy: Proxy): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new (require('net').Socket)()
      const timeout = 5000

      socket.setTimeout(timeout)
      
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      
      socket.on('error', () => {
        resolve(false)
      })
      
      socket.connect(proxy.port, proxy.host)
    })
  }

  rotate(): Proxy {
    const healthyProxies = this.proxies.filter(p => (p.failCount ?? 0) < 3)
    if (healthyProxies.length === 0) {
      this.proxies.forEach(p => (p.failCount = 0))
      return this.getNextProxy()
    }
    
    const randomIndex = Math.floor(Math.random() * healthyProxies.length)
    const proxy = healthyProxies[randomIndex]
    proxy.lastUsed = Date.now()
    return proxy
  }

  addProxy(proxy: Proxy): void {
    this.proxies.push(proxy)
  }

  removeProxy(proxy: Proxy): void {
    const index = this.proxies.indexOf(proxy)
    if (index > -1) {
      this.proxies.splice(index, 1)
    }
  }
}

export type { Proxy }
export { ProxyManager }
