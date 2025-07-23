import EmptyState from "@/components/empty-state";
import { useGetEmailLists, type GetEmailListsFilter } from "@/hooks/queries/useEmails";
import { useCreateEmailList, useUpdateEmailList } from "@/hooks/mutations/useEmails";
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
  Checkbox,
} from "@tribe-nest/frontend-shared";
import { Plus, Filter, X, MoreHorizontal, Edit, Users, Mail, Star, Copy } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback, useEffect } from "react";
import type { ApiError, IEmailList } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
});

export const Route = createFileRoute("/_dashboard/emails/lists/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

// Email List Dialog Component
const EmailListDialog = ({
  open,
  onOpenChange,
  list,
  profileId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: IEmailList;
  profileId: string;
}) => {
  const createEmailList = useCreateEmailList();
  const updateEmailList = useUpdateEmailList();
  const isEditing = !!list;

  const [title, setTitle] = useState(list?.title || "");
  const [isDefault, setIsDefault] = useState(list?.isDefault || false);
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (open && list) {
      setTitle(list.title);
      setIsDefault(list.isDefault);
    }
  }, [open, list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      setTitleError("List title is required");
      return;
    }
    setTitleError("");

    try {
      if (isEditing && list) {
        await updateEmailList.mutateAsync({
          title: title.trim(),
          profileId,
          emailListId: list.id,
          isDefault,
        });
        toast.success("List updated successfully");
        onOpenChange(false);
      } else {
        await createEmailList.mutateAsync({
          title: title.trim(),
          profileId,
          isDefault,
        });
        toast.success("List created successfully");
        onOpenChange(false);
      }
    } catch (error) {
      const message = (error as ApiError)?.response?.data?.message;
      toast.error(message || (isEditing ? "Failed to update list" : "Failed to create list"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit List" : "Create List"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">List Title</Label>
            <Input
              id="title"
              placeholder="Enter list title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              className={titleError ? "border-red-500" : ""}
            />
            {titleError && <p className="text-sm text-red-500">{titleError}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as default list
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createEmailList.isPending || updateEmailList.isPending}>
              {isEditing ? "Update List" : "Create List"}
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
  const search = useSearch({ from: "/_dashboard/emails/lists/" });

  // Local state for search input and dialogs
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<IEmailList | undefined>();

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/emails/lists",
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
  const filter: GetEmailListsFilter = useMemo(
    () => ({
      query: search.search,
    }),
    [search.search],
  );

  const { data: emailLists, isLoading } = useGetEmailLists(currentProfileAuthorization?.profileId, search.page, filter);

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      page: 1,
    });
  };

  const hasActiveFilters = search.search;
  const isEmpty = !isLoading && !emailLists?.data?.length;

  const handleCreateList = () => {
    setEditingList(undefined);
    setIsListDialogOpen(true);
  };

  const handleEditList = (list: IEmailList) => {
    setEditingList(list);
    setIsListDialogOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Email Lists"
        description="Manage your email subscriber lists and audiences"
        action={
          !isEmpty && (
            <Button onClick={handleCreateList}>
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search email lists..."
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
                <DialogTitle>Filter Email Lists</DialogTitle>
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
          title="No Email Lists Found"
          description={
            hasActiveFilters
              ? "No email lists found matching your filters"
              : "Create your first email list to start building your audience"
          }
          action={
            <Button onClick={handleCreateList}>
              <Plus className="mr-2 h-4 w-4" />
              Create List
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
                <TableHead>Subscribers</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailLists?.data?.map((list) => (
                <EmailListTableRow key={list.id} list={list} onEdit={handleEditList} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {emailLists && (
        <AdminPagination
          currentPage={emailLists.page}
          totalItems={emailLists.total}
          pageSize={emailLists.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Email List Dialog */}
      {currentProfileAuthorization?.profileId && (
        <EmailListDialog
          open={isListDialogOpen}
          onOpenChange={setIsListDialogOpen}
          list={editingList}
          profileId={currentProfileAuthorization.profileId}
        />
      )}
    </div>
  );
}

// EmailListTableRow component
const EmailListTableRow = ({ list, onEdit }: { list: IEmailList; onEdit: (list: IEmailList) => void }) => {
  const handleEdit = () => {
    onEdit(list);
  };

  const handleViewSubscribers = () => {
    // TODO: Navigate to subscribers page when route is implemented
    console.log("View subscribers:", list.id);
  };

  const handleSendEmail = () => {
    // TODO: Navigate to compose email with this list when route is implemented
    console.log("Send email to list:", list.id);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(list.id);
      toast.success("List ID copied to clipboard");
    } catch {
      toast.error("Failed to copy ID to clipboard");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="font-medium">{list.title}</div>
          {list.isDefault && (
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Default
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{list.subscriberCount.toLocaleString()}</span>
        </div>
      </TableCell>
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
                Edit List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewSubscribers}>
                <Users className="h-4 w-4 mr-2" />
                View Subscribers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
