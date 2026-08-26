import { createFileRoute } from '@tanstack/react-router'

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'
const GH_TOKEN = process.env.GH_TOKEN // Ensure this is set in your environment

export const Route = createFileRoute('/api/github')({
  server: {
    handlers: {
      GET: async () => {
        const username = 'leo-petrucci'
        const query = `
          query ($username: String!) {
            user(login: $username) {
              avatarUrl
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                }
              }
            }
          }
        `

        try {
          const response = await fetch(GITHUB_GRAPHQL_API, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${GH_TOKEN}`,
            },
            body: JSON.stringify({ query, variables: { username } }),
          })

          if (!response.ok) {
            throw new Error(`GitHub API returned status ${response.status}`)
          }

          const data = await response.json()
          if (data.errors) {
            throw new Error(data.errors.map((err: any) => err.message).join(', '))
          }

          const totalContributions =
            data.data.user.contributionsCollection.contributionCalendar
              .totalContributions
          const avatarUrl = data.data.user.avatarUrl

          return Response.json({ totalContributions, avatarUrl })
        } catch (err) {
          console.error('Error fetching GitHub data:', err)
          const error = err as Error
          return Response.json({ error: error.message }, { status: 500 })
        }
      },
    },
  },
})
