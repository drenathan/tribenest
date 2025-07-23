import EmptyState from "@/components/empty-state";
import { useGetEmailTemplates, type GetEmailTemplatesFilter } from "@/hooks/queries/useEmails";
import { useCreateEmailTemplate, useUpdateEmailTemplate } from "@/hooks/mutations/useEmails";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Label,
} from "@tribe-nest/frontend-shared";
import { Plus, Filter, X, MoreHorizontal, Edit, Mail } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ApiError, IEmailTemplate } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
});

export const Route = createFileRoute("/_dashboard/emails/templates/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

// Template Dialog Component
const TemplateDialog = ({
  open,
  onOpenChange,
  template,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: IEmailTemplate;
  profileId: string;
}) => {
  const navigate = useNavigate();
  const createEmailTemplate = useCreateEmailTemplate();
  const updateEmailTemplate = useUpdateEmailTemplate();
  const isEditing = !!template;

  const [title, setTitle] = useState(template?.title || "");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (open && template) {
      setTitle(template.title);
    }
  }, [open, template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setTitleError("Template title is required");
      return;
    }
    setTitleError("");

    try {
      if (isEditing && template) {
        await updateEmailTemplate.mutateAsync({
          title: title.trim(),
          profileId,
          emailTemplateId: template.id,
          content: typeof template.content === "string" ? template.content : JSON.stringify(template.content),
        });
        toast.success("Template updated successfully");
        onOpenChange(false);
      } else {
        const newTemplate = await createEmailTemplate.mutateAsync({
          title: title.trim(),
          profileId,
          content: "{}", // Empty content for new templates
        });
        toast.success("Template created successfully");
        onOpenChange(false);
        navigate({
          to: "/emails/templates/$templateId/edit",
          params: { templateId: newTemplate.id },
        });
      }
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || (isEditing ? "Failed to update template" : "Failed to create template"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Template Title</Label>
            <Input
              id="title"
              placeholder="Enter template title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              className={titleError ? "border-red-500" : ""}
            />
            {titleError && <p className="text-sm text-red-500">{titleError}</p>}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createEmailTemplate.isPending || updateEmailTemplate.isPending}
            >
              {isEditing ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/emails/templates/" });

  // Local state for search input and dialogs
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IEmailTemplate | undefined>();

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/emails/templates",
        search: (prev) => ({ ...prev, ...newSearch }),
      });
    },
    [search, navigate],
  );

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        updateURLParams({ search: value, page: 1 });
      }, 500),
    [updateURLParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter: GetEmailTemplatesFilter = useMemo(
    () => ({
      query: search.search,
    }),
    [search.search],
  );

  const { data: emailTemplates, isLoading } = useGetEmailTemplates(
    currentProfileAuthorization?.profileId,
    search.page,
    filter,
  );

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      page: 1,
    });
  };

  const hasActiveFilters = search.search;
  const isEmpty = !isLoading && !emailTemplates?.data?.length;

  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: IEmailTemplate) => {
    setEditingTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Email Templates"
        description="Create and manage reusable email templates"
        action={
          !isEmpty && (
            <Button onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search email templates..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Email Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {search.search && <Badge variant="secondary">Search: "{search.search}"</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No Email Templates Found"
          className="mt-10"
          description={
            hasActiveFilters
              ? "No email templates found matching your filters"
              : "Create your first email template to get started"
          }
          action={
            <Button onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          }
        />
      )}

      {!isEmpty && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates?.data?.map((template) => (
                <EmailTemplateTableRow key={template.id} template={template} onEdit={handleEditTemplate} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {emailTemplates && (
        <AdminPagination
          currentPage={emailTemplates.page}
          totalItems={emailTemplates.total}
          pageSize={emailTemplates.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Template Dialog */}
      {currentProfileAuthorization?.profileId && (
        <TemplateDialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          template={editingTemplate}
          profileId={currentProfileAuthorization.profileId}
        />
      )}
    </div>
  );
}

// EmailTemplateTableRow component
const EmailTemplateTableRow = ({
  template,
  onEdit,
}: {
  template: IEmailTemplate;
  onEdit: (template: IEmailTemplate) => void;
}) => {
  const navigate = useNavigate();
  const handleEdit = () => {
    onEdit(template);
  };

  const handleEditContent = () => {
    navigate({
      to: "/emails/templates/$templateId/edit",
      params: { templateId: template.id },
    });
  };

  const handlePreview = () => {
    // TODO: Navigate to preview template page when route is implemented
    console.log("Preview template:", template.id);
  };

  const handleUse = () => {
    // TODO: Navigate to compose email with template when route is implemented
    console.log("Use template:", template.id);
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{template.title}</div>
        </div>
      </TableCell>
      <TableCell>{formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditContent}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePreview}>
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUse}>
                <Plus className="h-4 w-4 mr-2" />
                Create Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
