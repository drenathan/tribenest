import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/tribe/members')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/tribe/members"!</div>
}
