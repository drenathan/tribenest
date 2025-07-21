import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/smart-links/links/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/smart-links/links/"!</div>
}
