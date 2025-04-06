import { IridescentGradientGenerator } from '@/components/IridescentGenerator'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/iridescent-debugger/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div><IridescentGradientGenerator/></div>
}
