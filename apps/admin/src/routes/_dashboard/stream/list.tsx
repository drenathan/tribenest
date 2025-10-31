import { createFileRoute } from "@tanstack/react-router";
import { useGetStreamTemplates } from "@/hooks/queries/useStreams";
import { useAuth } from "@/hooks/useAuth";
import z from "zod";
import { AdminPagination } from "@/components/pagination";
import PageHeader from "../-components/layout/page-header";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tribe-nest/frontend-shared";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { CreateStreamTemplateDialog } from "./-components/CreateStreamTemplateDialog";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Wrench, TriangleAlert } from "lucide-react";
import httpClient from "@/services/httpClient";
import { toast } from "sonner";

const routeParams = z.object({
  page: z.coerce.number().default(1),
});

export const Route = createFileRoute("/_dashboard/stream/list")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: templates, isLoading } = useGetStreamTemplates(currentProfileAuthorization?.profileId, search.page);

  const isEmpty = !isLoading && !templates?.data?.length;

  const handleCreateTemplate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (templateId: string) => {
    navigate({
      to: "/stream/$templateId/studio",
      params: { templateId },
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete template:", templateId);
  };

  const handleCleanupBroadcasts = async () => {
    if (!currentProfileAuthorization?.profileId) return;

    try {
      await httpClient.post(
        "/streams/broadcasts/cleanup",
        {},
        { params: { profileId: currentProfileAuthorization?.profileId } },
      );
      toast.success("Broadcasts cleaned up successfully");
    } catch {
      toast.error("Failed to cleanup broadcasts");
    }
  };

  return (
    <div>
      <PageHeader
        title="Stream Templates"
        description="Manage your stream templates"
        action={
          <div className="flex gap-2">
            <Button onClick={handleCreateTemplate}>New Template</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Wrench />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCleanupBroadcasts} className="text-red-600">
                  <TriangleAlert className="mr-2 h-4 w-4" />
                  Cleanup Broadcasts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {isLoading && <Loading />}

      {isEmpty && (
        <EmptyState
          title="No stream templates found"
          description={"Create a stream template to get started"}
          action={<Button onClick={handleCreateTemplate}>New Template</Button>}
        />
      )}

      {templates && !isEmpty && (
        <>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.data.map((template) => (
                  <TableRow
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleEditTemplate(template.id)}
                  >
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            currentPage={templates.page}
            totalItems={templates.total}
            pageSize={templates.pageSize}
            onPageChange={(page) => navigate({ search: { page } })}
          />
        </>
      )}

      <CreateStreamTemplateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
