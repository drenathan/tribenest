import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useEvents } from "@/hooks/queries/useEvents";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  RadioGroup,
  RadioGroupItem,
  Badge,
} from "@tribe-nest/frontend-shared";
import EventItem from "./-components/event-item";
import { useState, useMemo, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { z } from "zod";
import { debounce } from "lodash";
import { AdminPagination } from "@/components/pagination";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  upcoming: z.string().default(""),
  archived: z.boolean().default(false),
});

export const Route = createFileRoute("/_dashboard/events/list/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/events/list/" });

  // Local state for search input and dialog
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/events/list",
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

  const handleUpcomingChange = (upcoming: string) => {
    updateURLParams({ upcoming, page: 1 });
  };

  const handleArchivedChange = (archived: boolean) => {
    updateURLParams({ archived, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter = useMemo(
    () => ({
      query: search.search,
      upcoming: search.upcoming,
      archived: search.archived,
    }),
    [search.search, search.upcoming, search.archived],
  );

  const { data: events, isLoading } = useEvents(currentProfileAuthorization?.profileId, filter, search.page);

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      upcoming: "",
      archived: false,
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.upcoming || search.archived;
  const isEmpty = !isLoading && !events?.data?.length;

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage your events and their details"
        action={
          !isEmpty && (
            <Button>
              <Link to="/events/list/create">Create New</Link>
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by title or city..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
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
                <DialogTitle>Filter Events</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Upcoming Filter */}
                <div className="space-y-3">
                  <Label>Event Timing</Label>
                  <RadioGroup
                    value={search.upcoming || "all"}
                    onValueChange={(value) => handleUpcomingChange(value === "all" ? "" : value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upcoming" id="upcoming" />
                      <Label htmlFor="upcoming">Upcoming Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="past" id="past" />
                      <Label htmlFor="past">Past Events</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label>Status</Label>
                  <RadioGroup
                    value={search.archived ? "archived" : "active"}
                    onValueChange={(value) => handleArchivedChange(value === "archived")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="archived" id="archived" />
                      <Label htmlFor="archived">Archived Events</Label>
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
            {search.upcoming === "upcoming" && <Badge variant="secondary">Upcoming Events</Badge>}
            {search.upcoming === "past" && <Badge variant="secondary">Past Events</Badge>}
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
          title="No events found"
          description={hasActiveFilters ? "No events match your search criteria" : "Create an event to get started"}
          action={
            <Button>
              <Link to="/events/list/create">Create New</Link>
            </Button>
          }
        />
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events?.data?.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {events && (
        <AdminPagination
          currentPage={events.page}
          totalItems={events.total}
          pageSize={events.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
