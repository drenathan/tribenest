import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/emails/emails/$emailId/report',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/emails/emails/$emailId/report"!</div>
}
