import { useLivePreview } from '@payloadcms/live-preview-react'

import { PostContent, type PayloadPost } from './PostContent'

const payloadURL =
  import.meta.env.VITE_PAYLOAD_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '')

export function LivePostPreview({ post }: { post: PayloadPost }) {
  const { data } = useLivePreview<PayloadPost>({
    initialData: post,
    serverURL: payloadURL,
  })

  return <PostContent post={data} />
}
