import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { Button, Card, CardContent, websiteThemes } from "@tribe-nest/frontend-shared";

export const Route = createFileRoute("/_dashboard/website/themes/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <div>
      <PageHeader title="Website Themes" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {websiteThemes?.map((theme) => (
          <Card key={theme.slug} className="relative">
            <img src={theme.thumbnail} alt={theme.name} className="w-full h-50 object-cover" />
            <CardContent className="text-center flex flex-col gap-2">
              <h3 className="text-lg font-bold">{theme.name}</h3>
              <Button
                onClick={() => navigate({ to: "/website/themes/$slug/preview", params: { slug: theme.slug } })}
                variant="outline"
              >
                View Theme
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
