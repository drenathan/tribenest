import { useGetWebsites } from "@/hooks/queries/useWebsite";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { Badge, Button, Card, CardContent, cn } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import EmptyState from "@/components/empty-state";

export const Route = createFileRoute("/_dashboard/website/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { currentProfileAuthorization } = useAuth();
  const { data: websiteVersions } = useGetWebsites(currentProfileAuthorization?.profile.id);
  const isEmpty = websiteVersions && websiteVersions?.length === 0;

  return (
    <div>
      <PageHeader title="My Website" />
      {isEmpty && (
        <EmptyState
          title="No website versions found"
          description="Select and activate a theme to get started"
          action={<Button onClick={() => navigate({ to: "/website/themes" })}>Select Theme</Button>}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {websiteVersions?.map((version) => (
          <Card key={version.id} className={cn("relative", version.isActive && "md:col-span-2 lg:col-span-3")}>
            {version.isActive && <Badge className="absolute top-2 right-2">Active</Badge>}
            <img
              src={version.themeThumbnail}
              alt={version.themeName}
              className={cn("w-full h-50 object-cover", version.isActive && "h-100")}
            />
            <CardContent className="text-center flex flex-col gap-2">
              <h3 className="text-lg font-bold">Version: {version.version}</h3>
              <Button
                onClick={() => navigate({ to: "/website/home/$versionId/edit", params: { versionId: version.id } })}
                variant="outline"
              >
                Edit Website
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
