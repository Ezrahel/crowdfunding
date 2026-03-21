export interface SocialLoginEvent {
  user_id: string
  provider: 'google' | 'email'
  action: 'sign_in' | 'sign_up'
  success: boolean
  error_code?: string
  error_message?: string
}

export async function trackSocialLogin(event: SocialLoginEvent): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090'

    let token: string | null = null
    try {
      const auth = (await import('@/lib/firebase')).auth
      const user = auth.currentUser
      if (user) {
        token = await user.getIdToken()
      }
    } catch (tokenError) {
      console.warn('Could not get auth token for analytics:', tokenError)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${apiUrl}/api/analytics/social-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ...event,
          ip_address: await getClientIP(),
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (!response.ok) {
        console.warn('Analytics tracking failed:', response.status)
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name !== 'AbortError') {
        console.warn('Analytics tracking error:', fetchError)
      }
    }
  } catch (error) {
    console.warn('Analytics error:', error)
  }
}

async function getClientIP(): Promise<string> {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    })
    const data = await response.json()
    return data.ip || ''
  } catch {
    return ''
  }
}
