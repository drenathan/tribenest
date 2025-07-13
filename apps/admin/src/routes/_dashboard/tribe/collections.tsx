import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/tribe/collections')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/tribe/collections"!</div>
}
