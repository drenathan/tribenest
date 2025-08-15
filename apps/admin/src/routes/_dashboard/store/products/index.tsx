import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import { useGetProducts, useGetProductStores, type GetProductsFilter } from "@/hooks/queries/useProducts";
import { useAuth } from "@/hooks/useAuth";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  ProductCategory,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type ApiError,
} from "@tribe-nest/frontend-shared";
import { FilterIcon, Link2, XIcon } from "lucide-react";
import EmptyState from "@/components/empty-state";
import Loading from "@/components/loading";
import { useCreateProductStore } from "@/hooks/mutations/useProduct";
import { ExternalStoreProvider } from "@/types/product";
import { toast } from "sonner";
import { debounce } from "lodash";
import { AdminPagination } from "@/components/pagination";
import { ProductItem } from "./-components/product-item";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  archived: z.boolean().default(false),
});
export const Route = createFileRoute("/_dashboard/store/products/")({
  component: RouteComponent,
  validateSearch: routeParams,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const { data: productStores, isLoading } = useGetProductStores(currentProfileAuthorization?.profileId);
  const { mutateAsync: createStore, isPending } = useCreateProductStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const search = useSearch({ from: "/_dashboard/store/products/" });
  const navigate = useNavigate();

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/store/products",
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
  const filter: GetProductsFilter = useMemo(
    () => ({
      query: search.search || "",
      archived: search.archived,
    }),
    [search.search, search.archived],
  );

  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    currentProfileAuthorization?.profileId,
    ProductCategory.Merch,
    search.page,
    filter,
  );

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      archived: false,
      page: 1,
    });
  };

  const hasActiveFilters = search.search || search.archived;
  const isEmptyStores = !isLoading && !productStores?.length && !isProductsLoading && !products?.data?.length;

  const connectStoreSchema = z.object({
    provider: z.nativeEnum(ExternalStoreProvider, { required_error: "Provider is required" }),
    accessToken: z.string().min(1, "Access token is required"),
  });

  type ConnectStoreInput = z.infer<typeof connectStoreSchema>;

  const methods = useForm<ConnectStoreInput>({
    resolver: zodResolver(connectStoreSchema),
    defaultValues: { provider: ExternalStoreProvider.Printful, accessToken: "" },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      methods.reset({ provider: ExternalStoreProvider.Printful, accessToken: "" });
    }
  }, [isDialogOpen, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (!currentProfileAuthorization?.profileId) return;
    try {
      await createStore({ ...data, profileId: currentProfileAuthorization.profileId });
      toast.success("Store connected successfully");
      setIsDialogOpen(false);
    } catch (err) {
      const message = (err as ApiError).response?.data?.message || "Failed to connect store";
      toast.error(message);
    }
  });

  return (
    <div>
      <PageHeader
        title="My Products"
        description="Manage your products"
        action={
          !isEmptyStores && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Connect External Store
            </Button>
          )
        }
      />
      {isLoading && <Loading />}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
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
                      <Label htmlFor="active">Active Products</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="archived" id="archived" />
                      <Label htmlFor="archived">Archived Products</Label>
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
            {search.archived && <Badge variant="secondary">Archived</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>
      {isEmptyStores && (
        <EmptyState
          title="No Products Found"
          className="mt-6"
          description={
            hasActiveFilters
              ? "No music found matching your filters"
              : "Create your first products or connect an external store"
          }
          action={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Link2 className="mr-2 h-4 w-4" />
              Connect External Store
            </Button>
          }
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Connect External Store</DialogTitle>
            <DialogDescription>Link a provider to sync your products.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={methods.watch("provider")}
                onValueChange={(value) => methods.setValue("provider", value as ExternalStoreProvider)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ExternalStoreProvider.Printful}>Printful</SelectItem>
                </SelectContent>
              </Select>
              {methods.formState.errors.provider && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {methods.formState.errors.provider.message}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input id="accessToken" {...methods.register("accessToken")} placeholder="Enter provider access token" />
              {methods.formState.errors.accessToken && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {methods.formState.errors.accessToken.message}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Connecting..." : "Connect Store"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-8 mt-8">
        {products?.data?.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>

      {!!products?.data?.length && (
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
