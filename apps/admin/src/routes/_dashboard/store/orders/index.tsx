import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/store/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/store/orders/"!</div>
}
