import { useGetPosts, type GetPostsFilter } from "@/hooks/queries/usePosts";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import PageHeader from "../../-components/layout/page-header";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from "@tribe-nest/frontend-shared";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { PostItem } from "./-components/post-item";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { FilterIcon, XIcon } from "lucide-react";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  type: z.string().default(""),
  membershipTierId: z.string().default(""),
  archived: z.boolean().default(false),
});

export const Route = createFileRoute("/_dashboard/tribe/posts/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/tribe/posts/" });

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: membershipTiers } = useMembershipTiers(currentProfileAuthorization?.profileId);

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(search.search);
  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/tribe/posts",
        search: (prev) => ({ ...prev, ...newSearch }),
      });
    },
    [search, navigate],
  );

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchQuery(value);
        updateURLParams({ search: value, page: 1 });
      }, 500),
    [updateURLParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  };

  const handlePostTypeChange = (type: string) => {
    updateURLParams({ type, page: 1 });
  };

  const handleMembershipTierChange = (tierId: string) => {
    updateURLParams({ membershipTierId: tierId, page: 1 });
  };

  const handleArchivedChange = (archived: boolean) => {
    updateURLParams({ archived, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter: GetPostsFilter = useMemo(
    () => ({
      query: debouncedSearchQuery,
      type: search.type,
      membershipTierId: search.membershipTierId,
      archived: search.archived,
    }),
    [debouncedSearchQuery, search.type, search.membershipTierId, search.archived],
  );

  const { data: posts, isLoading } = useGetPosts(currentProfileAuthorization?.profileId, search.page, filter);

  const postTypes = [
    { value: "image", label: "Image" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "poll", label: "Poll" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    updateURLParams({
      search: "",
      type: "",
      membershipTierId: "",
      archived: false,
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.type || search.membershipTierId || search.archived;
  const isEmpty = !isLoading && !posts?.data?.length;

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Manage your posts and access"
        action={
          !isEmpty && (
            <Button>
              <Link to="/tribe/posts/create">Create New</Link>
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4 mr-2" />
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
                <DialogTitle>Filter Posts</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Post Type Filter */}
                <div className="space-y-3">
                  <Label>Post Type</Label>
                  <RadioGroup value={search.type} onValueChange={handlePostTypeChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="all-types" />
                      <Label htmlFor="all-types">All Types</Label>
                    </div>
                    {postTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label htmlFor={type.value}>{type.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Membership Tier Filter */}
                <div className="space-y-3">
                  <Label>Membership Tier</Label>
                  <Select value={search.membershipTierId} onValueChange={handleMembershipTierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      {membershipTiers?.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          {tier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Archived Filter */}
                <div className="space-y-3">
                  <Label>Status</Label>
                  <RadioGroup
                    value={search.archived ? "archived" : "active"}
                    onValueChange={(value) => handleArchivedChange(value === "archived")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active Posts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="archived" id="archived" />
                      <Label htmlFor="archived">Archived Posts</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    <XIcon className="h-4 w-4 mr-2" />
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
            {search.type && (
              <Badge variant="secondary">Type: {postTypes.find((t) => t.value === search.type)?.label}</Badge>
            )}
            {search.membershipTierId && (
              <Badge variant="secondary">
                Tier: {membershipTiers?.find((t) => t.id === search.membershipTierId)?.name}
              </Badge>
            )}
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
          title="No posts found"
          className="mt-6"
          description={
            hasActiveFilters ? "No posts found matching your filters" : "Create your first post to get started"
          }
          action={
            <Button>
              <Link to="/tribe/posts/create">Create New</Link>
            </Button>
          }
        />
      )}

      <div className="flex flex-col items-center mt-8 gap-8">
        {posts?.data?.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {posts && (
        <AdminPagination
          currentPage={posts.page}
          totalItems={posts.total}
          pageSize={posts.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
