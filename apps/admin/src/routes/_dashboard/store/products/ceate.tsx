import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/store/products/ceate')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/store/products/ceate"!</div>
}
