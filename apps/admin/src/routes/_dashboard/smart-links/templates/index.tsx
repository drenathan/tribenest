import { createFileRoute } from "@tanstack/react-router";
import { smartLinkTemplates, Button, Card, CardContent } from "@tribe-nest/frontend-shared";
import PageHeader from "../../-components/layout/page-header";

export const Route = createFileRoute("/_dashboard/smart-links/templates/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader title="Smart Link Templates" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {smartLinkTemplates?.map((template) => (
          <Card key={template.slug} className="relative">
            <img src={template.thumbnail} alt={template.title} className="w-full h-50 object-cover" />
            <CardContent className="text-center flex flex-col gap-2">
              <h3 className="text-lg font-bold">{template.title}</h3>
              <Button
                onClick={() =>
                  navigate({ to: "/smart-links/templates/$slug/preview", params: { slug: template.slug } })
                }
                variant="outline"
              >
                View Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
