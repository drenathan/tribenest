import EmptyState from "@/components/empty-state";
import { useGetSmartLinks, type GetSmartLinksFilter } from "@/hooks/queries/useSmartLinks";
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
  Label,
  RadioGroup,
  RadioGroupItem,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  defaultSmartLinkThemeSettings,
  Editor,
} from "@tribe-nest/frontend-shared";
import { Plus, Filter, X, MoreHorizontal, Edit, Archive, ArchiveRestore, BarChart3 } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback } from "react";
import { CreateSmartLinkDialog } from "./-components/CreateSmartLinkDialog";
import { useArchiveSmartLink, useUnarchiveSmartLink } from "@/hooks/mutations/useSmartLink";
import { formatDistanceToNow } from "date-fns";
import type { SmartLink } from "@tribe-nest/frontend-shared";
import type { SerializedEditorState } from "lexical";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  archived: z.boolean().default(false),
});

export const Route = createFileRoute("/_dashboard/smart-links/links/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const [editorState, setEditorState] = useState<SerializedEditorState>();

  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/smart-links/links/" });

  // Local state for search input and dialog
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/smart-links/links",
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

  const handleArchivedChange = (archived: boolean) => {
    updateURLParams({ archived, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter: GetSmartLinksFilter = useMemo(
    () => ({
      query: search.search,
      archived: search.archived,
    }),
    [search.search, search.archived],
  );

  const { data: smartLinks, isLoading } = useGetSmartLinks(currentProfileAuthorization?.profileId, search.page, filter);

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      archived: false,
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.archived;
  const isEmpty = !isLoading && !smartLinks?.data?.length;

  return (
    <div>
      <PageHeader
        title="Smart Links"
        description="Manage your smart links and track their performance"
        action={
          !isEmpty && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Smart Link
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search smart links..."
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
                <DialogTitle>Filter Smart Links</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <Label>Status</Label>
                  <RadioGroup
                    value={search.archived ? "archived" : "active"}
                    onValueChange={(value) => handleArchivedChange(value === "archived")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active Smart Links</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="archived" id="archived" />
                      <Label htmlFor="archived">Archived Smart Links</Label>
                    </div>
                  </RadioGroup>
                </div>

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
            {search.archived && <Badge variant="secondary">Archived</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No Smart Links Found"
          description={
            hasActiveFilters
              ? "No smart links found matching your filters"
              : "Create your first smart link to get started"
          }
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Smart Link
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
                <TableHead>Path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smartLinks?.data?.map((smartLink) => (
                <SmartLinkTableRow key={smartLink.id} smartLink={smartLink} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {smartLinks && (
        <AdminPagination
          currentPage={smartLinks.page}
          totalItems={smartLinks.total}
          pageSize={smartLinks.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Smart Link Dialog */}
      <CreateSmartLinkDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        content={JSON.stringify({})}
        themeSettings={defaultSmartLinkThemeSettings}
      />

      <Editor onSerializedChange={(value) => setEditorState(value)} />
    </div>
  );
}

// SmartLinkTableRow component
const SmartLinkTableRow = ({ smartLink }: { smartLink: SmartLink }) => {
  const navigate = useNavigate();
  const archiveSmartLink = useArchiveSmartLink();
  const unarchiveSmartLink = useUnarchiveSmartLink();

  const isArchived = !!smartLink.archivedAt;
  const isArchiving = archiveSmartLink.isPending || unarchiveSmartLink.isPending;

  const handleArchive = async () => {
    try {
      if (isArchived) {
        await unarchiveSmartLink.mutateAsync(smartLink.id);
      } else {
        await archiveSmartLink.mutateAsync(smartLink.id);
      }
    } catch (error) {
      console.error("Failed to archive/unarchive smart link:", error);
    }
  };

  const handleEdit = () => {
    navigate({ to: `/smart-links/links/${smartLink.id}/edit` });
  };

  const handleViewStats = () => {
    navigate({ to: `/smart-links/links/${smartLink.id}/stats` });
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{smartLink.title}</div>
          {smartLink.description && <div className="text-sm text-muted-foreground">{smartLink.description}</div>}
        </div>
      </TableCell>
      <TableCell>
        <code className="text-sm bg-muted px-2 py-1 rounded">/{smartLink.path}</code>
      </TableCell>
      <TableCell>
        {isArchived ? <Badge variant="secondary">Archived</Badge> : <Badge variant="default">Active</Badge>}
      </TableCell>
      <TableCell>{formatDistanceToNow(new Date(smartLink.updatedAt), { addSuffix: true })}</TableCell>
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
              <DropdownMenuItem onClick={handleViewStats}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Stats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                {isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
