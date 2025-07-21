import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/smart-links/links/$smartLinkId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/smart-links/templates/$smartLinkId/edit"!</div>
}
