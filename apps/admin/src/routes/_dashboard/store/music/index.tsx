import EmptyState from "@/components/empty-state";
import { useGetProducts, type GetProductsFilter } from "@/hooks/queries/useProducts";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tribe-nest/frontend-shared";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { Plus, FilterIcon, XIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProductCategory } from "@/types/product";
import { MusicItem } from "./-components/music-item";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { useState, useMemo, useCallback } from "react";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  archived: z.boolean().default(false),
  futureRelease: z.boolean().default(false),
  releaseType: z.enum(["album", "single", "all"]).default("all"),
});

const CreateMusicDropdown = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Music
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild>
        <Link to="/store/music/create" search={{ type: "album" }}>
          Create Album
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/store/music/create" search={{ type: "single" }}>
          Create Single
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export const Route = createFileRoute("/_dashboard/store/music/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/store/music/" });

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(search.search);
  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/store/music",
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

  const handleArchivedChange = (archived: boolean) => {
    updateURLParams({ archived, page: 1 });
  };

  const handleFutureReleaseChange = (futureRelease: boolean) => {
    updateURLParams({ futureRelease, page: 1 });
  };

  const handleReleaseTypeChange = (releaseType: "album" | "single" | "all") => {
    updateURLParams({ releaseType, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter: GetProductsFilter = useMemo(
    () => ({
      query: debouncedSearchQuery,
      archived: search.archived,
      futureRelease: search.futureRelease,
      releaseType: search.releaseType,
    }),
    [debouncedSearchQuery, search.archived, search.futureRelease, search.releaseType],
  );

  const { data: products, isLoading } = useGetProducts(
    currentProfileAuthorization?.profileId,
    ProductCategory.Music,
    search.page,
    filter,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    updateURLParams({
      search: "",
      archived: false,
      futureRelease: false,
      releaseType: "all",
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.archived || search.futureRelease || search.releaseType !== "all";
  const isEmpty = !isLoading && !products?.data?.length;

  return (
    <div>
      <PageHeader
        title="My Music"
        description="Manage your albums and singles"
        action={!isEmpty && <CreateMusicDropdown />}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search music..."
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
                <DialogTitle>Filter Music</DialogTitle>
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
                      <Label htmlFor="active">Active Music</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="archived" id="archived" />
                      <Label htmlFor="archived">Archived Music</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Release Status Filter */}
                <div className="space-y-3">
                  <Label>Release Status</Label>
                  <RadioGroup
                    value={search.futureRelease ? "future" : "released"}
                    onValueChange={(value) => handleFutureReleaseChange(value === "future")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="released" id="released" />
                      <Label htmlFor="released">Released</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="future" id="future" />
                      <Label htmlFor="future">Future Release</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Release Type Filter */}
                <div className="space-y-3">
                  <Label>Release Type</Label>
                  <Select value={search.releaseType} onValueChange={handleReleaseTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select release type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="album">Albums</SelectItem>
                      <SelectItem value="single">Singles</SelectItem>
                    </SelectContent>
                  </Select>
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
            {search.archived && <Badge variant="secondary">Archived</Badge>}
            {search.futureRelease && <Badge variant="secondary">Future Release</Badge>}
            {search.releaseType !== "all" && (
              <Badge variant="secondary">{search.releaseType === "album" ? "Albums" : "Singles"}</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No Music Found"
          description={
            hasActiveFilters
              ? "No music found matching your filters"
              : "Create your first album or single to get started"
          }
          action={<CreateMusicDropdown />}
        />
      )}

      <div className="space-y-8 mt-8">
        {products?.data?.map((product) => (
          <MusicItem key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {products && (
        <AdminPagination
          currentPage={products.page}
          totalItems={products.total}
          pageSize={products.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
