import { geolocation } from '@vercel/functions'

export default function middleware(request: Request) {
  const detectedCountry = geolocation(request).country
  const countryCode = detectedCountry?.toUpperCase() || null

  return Response.json(
    {
      countryCode,
      mainlandChina: countryCode === 'CN',
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  )
}

export const config = {
  matcher: '/_wristo/visitor-region',
}
