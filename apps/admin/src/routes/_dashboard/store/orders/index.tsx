import { useGetOrders } from "@/hooks/queries/useOrder";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tribe-nest/frontend-shared";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { AdminPagination } from "@/components/pagination";
import { z } from "zod";
import { debounce } from "lodash";
import { FilterIcon, XIcon, CreditCard, CheckCircle, XCircle, Clock, Truck, Package, AlertCircle } from "lucide-react";
import { OrderStatus } from "@tribe-nest/frontend-shared";

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  status: z.string().default(""),
});

export const Route = createFileRoute("/_dashboard/store/orders/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/store/orders/" });

  // Local state for search input
  const [searchQuery, setSearchQuery] = useState(search.search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL search params when filters change
  const updateURLParams = useCallback(
    (updates: Partial<typeof search>) => {
      const newSearch = { ...search, ...updates };
      navigate({
        to: "/store/orders",
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

  const handleStatusChange = (status: string) => {
    updateURLParams({ status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  const filter = useMemo(() => {
    return {
      status: search.status,
      query: search.search,
    };
  }, [search.status, search.search]);

  const { data: orders, isLoading } = useGetOrders(currentProfileAuthorization?.profileId, search.page, filter);

  const clearFilters = () => {
    setSearchQuery("");
    updateURLParams({
      search: "",
      status: "",
      page: 1,
    });
    setIsFilterOpen(false);
  };

  const hasActiveFilters = search.search || search.status;
  const isEmpty = !isLoading && !orders?.data?.length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Paid:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case OrderStatus.PaymentFailed:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case OrderStatus.Processing:
        return <Clock className="w-4 h-4 text-blue-600" />;
      case OrderStatus.Shipped:
        return <Truck className="w-4 h-4 text-blue-600" />;
      case OrderStatus.Delivered:
        return <Package className="w-4 h-4 text-green-600" />;
      case OrderStatus.Cancelled:
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case OrderStatus.InitiatedPayment:
        return <CreditCard className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusText = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    switch (status) {
      case OrderStatus.Paid:
      case OrderStatus.Delivered:
        return <Badge variant="default">{statusText}</Badge>;
      case OrderStatus.PaymentFailed:
      case OrderStatus.Cancelled:
        return <Badge variant="destructive">{statusText}</Badge>;
      case OrderStatus.Processing:
      case OrderStatus.Shipped:
      case OrderStatus.InitiatedPayment:
        return <Badge variant="secondary">{statusText}</Badge>;
      default:
        return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  const orderStatuses = [
    { value: "all", label: "All Statuses" },
    { value: OrderStatus.PaymentFailed, label: "Payment Failed" },
    { value: OrderStatus.Paid, label: "Paid" },
    { value: OrderStatus.Processing, label: "Processing" },
    { value: OrderStatus.Shipped, label: "Shipped" },
    { value: OrderStatus.Delivered, label: "Delivered" },
    { value: OrderStatus.Cancelled, label: "Cancelled" },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage and track customer orders"
        // action={
        //   !isEmpty && (
        //     <Button>
        //       <ShoppingBag className="h-4 w-4 mr-2" />
        //       Export Orders
        //     </Button>
        //   )
        // }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search orders by event title, customer name, or email..."
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
                <DialogTitle>Filter Orders</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <Label>Order Status</Label>
                  <Select value={search.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
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
            {search.status && (
              <Badge variant="secondary">Status: {orderStatuses.find((s) => s.value === search.status)?.label}</Badge>
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
          title="No orders found"
          className="mt-6"
          description={
            hasActiveFilters
              ? "No orders found matching your filters"
              : "Orders will appear here once customers make purchases"
          }
        />
      )}

      {/* Orders Table */}
      {!isLoading && !!orders?.data?.length && (
        <Card className="mt-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-4">Customer</TableHead>
                  <TableHead className="p-4">Items</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="p-4">Total</TableHead>
                  <TableHead className="p-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.data?.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => navigate({ to: "/store/orders/$orderId", params: { orderId: order.id } })}
                  >
                    <TableCell className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-sm text-muted-foreground">{order.customerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="space-y-2">
                        {order.deliveryGroups
                          .flatMap((group) => group.items)
                          .slice(0, 2)
                          .map((item, index) => (
                            <div
                              key={`${item.productId}-${item.productVariantId}-${index}`}
                              className="flex gap-3 items-start"
                            >
                              {item.coverImage && (
                                <img src={item.coverImage} alt={item.title} className="w-8 h-8 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} • ${item.price.toFixed(2)}
                                </div>
                                {item.isGift && (
                                  <div className="text-xs text-primary">Gift for {item.recipientName}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        {order.deliveryGroups.flatMap((group) => group.items).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{order.deliveryGroups.flatMap((group) => group.items).length - 2} more items
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="font-semibold">${order.totalAmount}</span>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm">{formatDate(order.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {orders && (
        <AdminPagination
          currentPage={orders.page}
          totalItems={orders.total}
          pageSize={orders.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
