const normalizeEnvValue = (value: unknown) => String(value || '').trim()

export const getPaddleClientToken = () => normalizeEnvValue(import.meta.env.VITE_WRISTO_PADDLE_CLIENT_TOKEN)

export const getPaddleEnvironment = () => normalizeEnvValue(import.meta.env.VITE_WRISTO_PADDLE_ENVIRONMENT)

export const initializePaddle = (paddle: any, eventCallback: (data: any) => void | Promise<void>) => {
  const token = getPaddleClientToken()
  if (!token) {
    throw new Error('Paddle client token is missing')
  }

  const environment = getPaddleEnvironment()
  if (environment && paddle?.Environment?.set) {
    paddle.Environment.set(environment)
  }

  paddle.Initialize({
    token,
    eventCallback,
  })
}
