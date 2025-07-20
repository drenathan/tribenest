import { useGetProfileMemberships } from "@/hooks/queries/useMembership";
import { useMembershipTiers } from "@/hooks/queries/useMembershipTiers";
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
  RadioGroup,
  RadioGroupItem,
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
import { FilterIcon, XIcon, Users, Calendar, Mail, MapPin } from "lucide-react";
import type { IMembership } from "@/types/membership";

type MembershipFilter = {
  membershipTierId?: string;
  query?: string;
  active?: string;
};

const routeParams = z.object({
  page: z.number().default(1),
  search: z.string().default(""),
  membershipTierId: z.string().default(""),
  active: z.string().default("true"),
});

export const Route = createFileRoute("/_dashboard/tribe/members/")({
  validateSearch: routeParams,
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_dashboard/tribe/members/" });

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
        to: "/tribe/members",
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

  const handleMembershipTierChange = (tierId: string) => {
    updateURLParams({ membershipTierId: tierId, page: 1 });
  };

  const handleActiveChange = (active: string) => {
    updateURLParams({ active, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURLParams({ page });
  };

  // Build filter object for API
  const filter: MembershipFilter = useMemo(
    () => ({
      query: debouncedSearchQuery,
      membershipTierId: search.membershipTierId,
      active: search.active,
    }),
    [debouncedSearchQuery, search.membershipTierId, search.active],
  );

  const { data: memberships, isLoading } = useGetProfileMemberships(
    currentProfileAuthorization?.profileId,
    search.page,
    filter,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    updateURLParams({
      search: "",
      membershipTierId: "",
      active: "",
      page: 1,
    });
    setIsFilterOpen(false);
  };

  const hasActiveFilters = search.search || search.membershipTierId || search.active;
  const isEmpty = !isLoading && !memberships?.data?.length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage your tribe members and their subscriptions"
        action={
          !isEmpty && (
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Export Members
            </Button>
          )
        }
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Search members by name or email..."
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
                <DialogTitle>Filter Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
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

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label>Status</Label>
                  <RadioGroup value={search.active} onValueChange={handleActiveChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="all-status" />
                      <Label htmlFor="all-status">All Members</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="active" />
                      <Label htmlFor="active">Active Members</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="inactive" />
                      <Label htmlFor="inactive">Inactive Members</Label>
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
            {search.membershipTierId && (
              <Badge variant="secondary">
                Tier: {membershipTiers?.find((t) => t.id === search.membershipTierId)?.name}
              </Badge>
            )}
            {search.active === "true" && <Badge variant="secondary">Active Only</Badge>}
            {search.active === "false" && <Badge variant="secondary">Inactive Only</Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No members found"
          className="mt-6"
          description={
            hasActiveFilters
              ? "No members found matching your filters"
              : "Members will appear here once they join your tribe"
          }
        />
      )}

      {/* Members Table */}
      {!isLoading && memberships?.data && memberships.data.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="p-4">Member</TableHead>
                  <TableHead className="p-4">Tier</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="p-4">Subscription</TableHead>
                  <TableHead className="p-4">FirstJoined</TableHead>
                  <TableHead className="p-4">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.data.map((membership: IMembership) => (
                  <TableRow key={membership.id}>
                    <TableCell className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{membership.fullName}</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {membership.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <Badge variant="outline">{membership.membershipTierName}</Badge>
                    </TableCell>
                    <TableCell className="p-4">{getStatusBadge(membership.status)}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {membership.subscriptionAmount ? `$${membership.subscriptionAmount?.toFixed(2)}` : "Free"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(membership.startDate)} -{" "}
                          {membership.endDate ? formatDate(membership.endDate) : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {membership.firstMembership?.startDate
                          ? formatDate(new Date(membership.firstMembership.startDate))
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {membership.country && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {membership.country}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {memberships && (
        <AdminPagination
          currentPage={memberships.page}
          totalItems={memberships.total}
          pageSize={memberships.pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
