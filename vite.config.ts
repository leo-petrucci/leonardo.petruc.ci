import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import path from 'path'

const __dirname = path.resolve()

/**
 * Wraps the MDX plugin so it skips `?raw` imports. Without this, the plugin
 * compiles raw-text imports of `.mdx` files too (dev mode), which breaks
 * `src/lib/articles.ts`, where article sources are read as plain strings.
 */
function mdxExceptRaw(options?: Parameters<typeof mdx>[number]) {
  const plugin = mdx(options)
  const originalTransform = plugin.transform
  return {
    ...plugin,
    name: 'vite-plugin-mdx-except-raw',
    transform(this: unknown, code: string, id: string, ...rest: unknown[]) {
      if (id.includes('?raw')) return null
      return (originalTransform as (...args: unknown[]) => unknown).call(
        this,
        code,
        id,
        ...rest,
      )
    },
  }
}

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // Compiles .mdx content to React components; must run before viteReact.
    // remarkFrontmatter strips the `---` metadata block so it does not leak
    // into the rendered article body (articles.ts parses it from raw text).
    mdxExceptRaw({
      remarkPlugins: [remarkGfm, remarkFrontmatter],
      rehypePlugins: [rehypeSlug],
    }),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss() as any,
    tanstackStart(),
    nitro({
      config: {
        preset: 'aws-lambda',
      },
    }),
    viteReact(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
