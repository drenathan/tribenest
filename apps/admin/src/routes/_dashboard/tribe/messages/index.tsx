import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/tribe/messages/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/tribe/messages/"!</div>
}
