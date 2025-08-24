import EmptyState from "@/components/empty-state";
import { useWebsitesMessages } from "@/hooks/queries/useWebsite";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tribe-nest/frontend-shared";
import { Eye } from "lucide-react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { IWebsiteMessage } from "@/types/website";

const routeParams = z.object({
  page: z.number().default(1),
});

export const Route = createFileRoute("/_dashboard/website/messages/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/website/messages/" });

  const handlePageChange = (page: number) => {
    navigate({
      to: "/website/messages",
      search: (prev) => ({ ...prev, page }),
    });
  };

  // Build filter object for API
  const filter = useMemo(
    () => ({
      page: search.page,
    }),
    [search.page],
  );

  const { data: messages, isLoading } = useWebsitesMessages(currentProfileAuthorization?.profileId, filter);

  const isEmpty = !isLoading && !messages?.data?.length;

  return (
    <div>
      <PageHeader title="Messages" description="View and manage messages from your website visitors" />

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState title="No Messages Found" description="Messages from your website visitors will appear here" />
      )}

      {!isEmpty && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages?.data?.map((message) => (
                <MessageTableRow key={message.id} message={message} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {messages && (
        <AdminPagination
          currentPage={messages.page}
          totalItems={messages.total}
          pageSize={messages.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// MessageTableRow component
const MessageTableRow = ({ message }: { message: IWebsiteMessage }) => {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const messagePreview = message.message.length > 50 ? `${message.message.substring(0, 50)}...` : message.message;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{message.name}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">{message.email}</div>
        </TableCell>
        <TableCell>
          <div className="max-w-xs">
            <p className="text-sm text-muted-foreground">{messagePreview}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Message Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{message.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{message.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    </>
  );
};
