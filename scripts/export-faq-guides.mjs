import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const apiBase = trimTrailingSlash(process.env.BLOG_EXPORT_API_BASE_URL || 'https://api.wristo.io/api')
const rootDir = process.cwd()
const outputPath = path.join(rootDir, 'src/content/faq-guides.generated.ts')
const jsonOutputPath = path.join(rootDir, 'src/content/faq-guides.generated.json')

async function main() {
  const page = await postJson('/public/blog/page?populate=translations', {
    pageNum: 1,
    pageSize: Number(process.env.BLOG_EXPORT_PAGE_SIZE || 500),
    orderBy: 'id:desc',
  })
  const posts = asList(page?.list)
  const detailedPosts = []

  for (const post of posts) {
    if (!post?.id) continue
    const detail = await getJson(`/public/blog/detail/${encodeURIComponent(String(post.id))}?populate=*`)
    detailedPosts.push(detail)
  }

  const tocTree = await postJson('/public/blog/toc/tree?populate=translations', { parentId: -1 })
  const exportedAt = new Date().toISOString()
  const missingContent = detailedPosts
    .flatMap((post) => {
      const translations = Array.isArray(post.translations) ? post.translations : []
      return translations
        .filter((translation) => translation?.slug && !translation?.contentHtml)
        .map((translation) => `${post.id}:${translation.lang}/${translation.slug}`)
    })

  if (missingContent.length > 0) {
    throw new Error(`Missing contentHtml for ${missingContent.length} translations: ${missingContent.join(', ')}`)
  }

  const source = [
    "import type { BlogPostTocItemVO, BlogPostVO } from '@/types'",
    '',
    `export const faqGuidesExportedAt = ${JSON.stringify(exportedAt)}`,
    `export const faqGuidePosts = ${JSON.stringify(detailedPosts, null, 2)} as unknown as BlogPostVO[]`,
    `export const faqGuideTocTree = ${JSON.stringify(tocTree, null, 2)} as unknown as BlogPostTocItemVO[]`,
    '',
  ].join('\n')

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, source)
  await writeFile(
    jsonOutputPath,
    JSON.stringify({ exportedAt, posts: detailedPosts, tocTree }, null, 2),
  )
  console.log(`[faq-guides] Exported ${detailedPosts.length} posts to ${outputPath}`)
}

async function getJson(endpoint) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    headers: { Accept: 'application/json' },
  })
  return unwrap(await readResponse(response, endpoint))
}

async function postJson(endpoint, body) {
  const response = await fetch(`${apiBase}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return unwrap(await readResponse(response, endpoint))
}

async function readResponse(response, endpoint) {
  const text = await response.text()
  if (!response.ok) throw new Error(`${endpoint} returned HTTP ${response.status}: ${text}`)
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${endpoint} returned non-JSON response: ${text.slice(0, 200)}`)
  }
}

function unwrap(payload) {
  if (payload?.code !== undefined && payload.code !== 0) {
    throw new Error(payload.msg || `API returned code ${payload.code}`)
  }
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload
}

function asList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.items)) return value.items
  return []
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
