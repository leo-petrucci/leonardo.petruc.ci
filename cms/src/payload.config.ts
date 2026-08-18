import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Posts } from './collections/Posts'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      openByDefault: true,
      url: ({ data }) =>
        typeof data?.slug === 'string'
          ? `${frontendURL}/posts/${data.slug}`
          : undefined,
      collections: [Posts.slug],
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
      ],
    },
  },
  collections: [Users, Posts],
  cors: [frontendURL],
  csrf: [frontendURL],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db',
    },
    wal: true,
    busyTimeout: 5_000,
  }),
})
