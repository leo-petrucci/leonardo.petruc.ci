import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const __dirname = path.resolve();

export default defineConfig({
  server: {
    preset: 'aws-lambda'
  },
  tsr: {
    appDirectory: 'src',
  },
  vite: {
    plugins: [
      tailwindcss() as any,
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
})
