import { LivePostPreview } from '@/components/posts/LivePostPreview'
import type { PayloadPost } from '@/components/posts/PostContent'
import { notFound } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

type PostsResponse = {
  docs: PayloadPost[]
}

const payloadURL =
  import.meta.env.VITE_PAYLOAD_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '')

export const Route = createFileRoute('/posts/$slug')({
  loader: async ({ params }) => {
    if (!payloadURL) {
      throw notFound()
    }

    const query = new URLSearchParams({
      limit: '1',
      'where[slug][equals]': params.slug,
    })
    const response = await fetch(`${payloadURL}/api/posts?${query}`, {
      headers: {
        accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to load post')
    }

    const { docs } = (await response.json()) as PostsResponse
    const post = docs[0]

    if (!post || post._status !== 'published') {
      throw notFound()
    }

    return post
  },
  component: PostPage,
})

function PostPage() {
  const post = Route.useLoaderData()

  return <LivePostPreview post={post} />
}
