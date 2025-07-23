import EmptyState from "@/components/empty-state";
import { useGetEmailTemplates, type GetEmailTemplatesFilter } from "@/hooks/queries/useEmails";
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
} from "@tribe-nest/frontend-shared";
import { Plus, Filter, X, MoreHorizontal, Edit, Mail } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import type { IEmailTemplate } from "@tribe-nest/frontend-shared";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
});

export const Route = createFileRoute("/_dashboard/emails/templates/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/emails/templates/" });

  // Local state for search input and dialog
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    // TODO: Navigate to create template page when route is implemented
    console.log("Create template clicked");
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
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates?.data?.map((template) => (
                <EmailTemplateTableRow key={template.id} template={template} />
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
    </div>
  );
}

// EmailTemplateTableRow component
const EmailTemplateTableRow = ({ template }: { template: IEmailTemplate }) => {
  const handleEdit = () => {
    // TODO: Navigate to edit template page when route is implemented
    console.log("Edit template:", template.id);
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
      <TableCell>{formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}</TableCell>
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
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePreview}>
                <Mail className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUse}>
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
