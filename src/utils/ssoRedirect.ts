let isRedirectingToSso = false

export function clearLocalAuthState() {
  localStorage.removeItem('wristo-user')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}

export function getSsoRedirectUri() {
  const configuredRedirectUri = import.meta.env.VITE_WRISTO_SSO_REDIRECT_URI
  if (configuredRedirectUri) {
    return configuredRedirectUri
  }
  return new URL('/auth/callback', window.location.origin).toString()
}

function getSsoLoginBaseUrl() {
  const configuredLoginUrl = import.meta.env.VITE_WRISTO_SSO_LOGIN_URL
  if (configuredLoginUrl && !configuredLoginUrl.startsWith('/')) {
    return configuredLoginUrl
  }
  if (window.location.hostname.endsWith('wristo.io')) {
    return 'https://sso.wristo.io/login'
  }
  return configuredLoginUrl || '/login'
}

function getSsoSignupBaseUrl() {
  const configuredSignupUrl = import.meta.env.VITE_WRISTO_SSO_SIGNUP_URL
  if (configuredSignupUrl && !configuredSignupUrl.startsWith('/')) {
    return configuredSignupUrl
  }
  if (window.location.hostname.endsWith('wristo.io')) {
    return 'https://sso.wristo.io/register'
  }
  return configuredSignupUrl || '/register'
}

export function buildSsoLoginUrl(client: string, options: Record<string, string> = {}) {
  const loginUrl = new URL(getSsoLoginBaseUrl(), window.location.origin)
  loginUrl.searchParams.set('client', client)
  loginUrl.searchParams.set('redirect_uri', getSsoRedirectUri())
  Object.entries(options).forEach(([key, value]) => {
    loginUrl.searchParams.set(key, value)
  })
  return loginUrl.toString()
}

export function buildSsoSignupUrl(client: string, options: Record<string, string> = {}) {
  const signupUrl = new URL(getSsoSignupBaseUrl(), window.location.origin)
  signupUrl.searchParams.set('client', client)
  signupUrl.searchParams.set('redirect_uri', getSsoRedirectUri())
  Object.entries(options).forEach(([key, value]) => {
    signupUrl.searchParams.set(key, value)
  })
  return signupUrl.toString()
}

export function redirectToSsoLogin(client: string, delay = 0) {
  if (isRedirectingToSso) {
    return
  }
  isRedirectingToSso = true

  try {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    sessionStorage.setItem('wristo:sso:return-path', currentPath || '/')
  } catch (e) {
    console.warn('Failed to save SSO return path:', e)
  }

  clearLocalAuthState()

  window.setTimeout(() => {
    window.location.href = buildSsoLoginUrl(client)
  }, delay)
}
