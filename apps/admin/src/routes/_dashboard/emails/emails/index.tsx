import EmptyState from "@/components/empty-state";
import { useGetEmails, type GetEmailsFilter } from "@/hooks/queries/useEmails";
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
import { Plus, Filter, X, MoreHorizontal, Edit, Mail, Copy, Eye, Clock } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback } from "react";
import type { ApiError, IEmail, EmailStatus } from "@tribe-nest/frontend-shared";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  status: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/emails/emails/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/emails/emails/" });

  // Local state for search input and dialogs
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/emails/emails",
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

  const handleStatusFilter = (status?: string) => {
    updateURLParams({ status, page: 1 });
  };

  // Build filter object for API
  const filter: GetEmailsFilter = useMemo(
    () => ({
      query: search.search,
      status: search.status as EmailStatus,
    }),
    [search.search, search.status],
  );

  const { data: emails, isLoading } = useGetEmails(currentProfileAuthorization?.profileId, search.page, filter);

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      status: undefined,
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.status;
  const isEmpty = !isLoading && !emails?.data?.length;

  const handleCreateEmail = () => {
    navigate({ to: "/emails/emails/create" });
  };

  return (
    <div>
      <PageHeader
        title="Emails"
        description="Manage and send emails to your audience"
        action={
          !isEmpty && (
            <Button onClick={handleCreateEmail}>
              <Plus className="mr-2 h-4 w-4" />
              Create Email
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search emails..."
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
                <DialogTitle>Filter Emails</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!search.status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter(undefined)}
                    >
                      All
                    </Button>
                    <Button
                      variant={search.status === "created" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("created")}
                    >
                      Created
                    </Button>
                    <Button
                      variant={search.status === "scheduled" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("scheduled")}
                    >
                      Scheduled
                    </Button>
                    <Button
                      variant={search.status === "processing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("processing")}
                    >
                      Processing
                    </Button>
                    <Button
                      variant={search.status === "processed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusFilter("processed")}
                    >
                      Sent
                    </Button>
                  </div>
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
            {search.status && <Badge variant="secondary">Status: {search.status}</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No Emails Found"
          description={
            hasActiveFilters
              ? "No emails found matching your filters"
              : "Create your first email to start reaching your audience"
          }
          action={
            <Button onClick={handleCreateEmail}>
              <Plus className="mr-2 h-4 w-4" />
              Create Email
            </Button>
          }
        />
      )}

      {!isEmpty && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Send Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails?.data?.map((email) => (
                <EmailTableRow key={email.id} email={email} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {emails && (
        <AdminPagination
          currentPage={emails.page}
          totalItems={emails.total}
          pageSize={emails.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// EmailTableRow component
const EmailTableRow = ({ email }: { email: IEmail }) => {
  const getStatusBadge = (status: EmailStatus) => {
    switch (status) {
      case "created":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "processing":
        return <Badge variant="default">Sending</Badge>;
      case "processed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Sent
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePreview = () => {
    // TODO: Navigate to preview email page when route is implemented
    console.log("Preview email:", email.id);
  };

  const handleEdit = () => {
    // TODO: Navigate to edit email page when route is implemented
    console.log("Edit email:", email.id);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(email.id);
      toast.success("Email ID copied to clipboard");
    } catch {
      toast.error("Failed to copy ID to clipboard");
    }
  };

  const recipient = email.recipientEmail || `Email List ${email.emailListId}`;
  const sendDate = email.sendDate ? new Date(email.sendDate).toLocaleDateString() : "Not scheduled";

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{email.subject}</div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{recipient}</div>
      </TableCell>
      <TableCell>{getStatusBadge(email.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {email.sendDate && <Clock className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm">{sendDate}</span>
        </div>
      </TableCell>
      <TableCell>{formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
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
