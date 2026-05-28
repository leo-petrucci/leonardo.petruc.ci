# leonardo.petruc.ci

Personal portfolio and creative playground for [Leonardo Petrucci](https://leonardo.petruc.ci), a software developer at Webflow. Built with TanStack React Start.

## Tech Stack

| Layer | Tech |
|---|---|
| **Framework** | [TanStack React Start](https://tanstack.com/start/latest) (SSR, file-based routing) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) |
| **UI** | [shadcn/ui](https://ui.shadcn.com/) (New York) on [Radix UI](https://www.radix-ui.com/) primitives |
| **Infra** | [SST v3](https://sst.dev/) → AWS Lambda (eu-west-1) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Maps** | [MapLibre GL](https://maplibre.org/) |
| **Language** | TypeScript (strict) |
| **Package Mgr** | [Bun](https://bun.sh/) |

## Features

- **Portfolio** — Work history, GitHub contributions (via GraphQL API), and social links
- **Iridescent Gradient Generator** — Interactive tool at `/iridescent-debugger` for creating procedural SVG gradients with download
- **API routes** — `/api/github`, `/api/users`, `/api/users/$id`

## Getting Started

```bash
# Install dependencies
bun install

# Set GitHub token (required for contributions widget)
export GH_TOKEN=ghp_xxxxxxxxxxxx

# Start dev server at http://localhost:3000
bun dev
```

### Scripts

| Command | Description |
|---|---|
| `bun dev` | Development server |
| `bun build` | Production build |
| `bun start` | Production server |
| `bunx sst deploy --stage prod` | Deploy to AWS |

## Deployment

Deployed via SST to AWS (eu-west-1). A GitHub Actions workflow on `main` branch handles CI/CD. Requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `GH_TOKEN` repository secrets.

## Helpful Links

- [TanStack React Start docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- [SST v3 docs](https://sst.dev/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/installation)