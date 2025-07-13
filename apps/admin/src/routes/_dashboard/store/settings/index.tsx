import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/store/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/store/settings/"!</div>
}
