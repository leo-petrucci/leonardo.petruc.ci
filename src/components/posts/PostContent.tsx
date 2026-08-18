import type {
  DefaultNodeTypes,
  SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'

type CalloutFields = {
  blockName?: string | null
  body: string
  title: string
  tone: 'info' | 'success' | 'warning'
}

type ProjectCardFields = {
  blockName?: string | null
  description: string
  title: string
  url: string
}

type PostNodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CalloutFields | ProjectCardFields>

export type PayloadPost = {
  id: number | string
  title: string
  slug: string
  excerpt?: null | string
  content?: null | SerializedEditorState
  _status?: 'draft' | 'published'
}

const toneClasses = {
  info: 'border-blue-200 bg-blue-50 text-blue-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
}

const converters: JSXConvertersFunction<PostNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }) => {
      const fields = node.fields as CalloutFields

      return (
        <aside className={`my-6 rounded-xl border p-5 ${toneClasses[fields.tone]}`}>
          <h2 className="font-medium">{fields.title}</h2>
          <p className="mt-2 text-sm leading-6">{fields.body}</p>
        </aside>
      )
    },
    projectCard: ({ node }) => {
      const fields = node.fields as ProjectCardFields

      return (
        <a
          className="my-6 block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
          href={fields.url}
          rel="noreferrer"
          target="_blank"
        >
          <h2 className="font-medium">{fields.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {fields.description}
          </p>
        </a>
      )
    },
  },
})

export function PostContent({ post }: { post: PayloadPost }) {
  return (
    <article className="px-4 pt-[110px]">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-medium tracking-tight">{post.title}</h1>
        {post.excerpt ? (
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </header>
      {post.content ? (
        <RichText
          className="mt-10 max-w-2xl space-y-4 leading-7 [&_a]:underline [&_h1]:mt-10 [&_h1]:text-3xl [&_h2]:mt-8 [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:text-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          converters={converters}
          data={post.content}
        />
      ) : null}
    </article>
  )
}
