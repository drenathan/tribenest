import EmptyState from "@/components/empty-state";
import { useGetProducts } from "@/hooks/queries/useProducts";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@tribe-nest/frontend-shared";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "../../-components/layout/page-header";
import Loading from "@/components/loading";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ProductCategory } from "@/types/product";
import { MusicItem } from "./-components/music-item";

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
  component: RouteComponent,
});

function RouteComponent() {
  const { currentProfileAuthorization } = useAuth();
  const { data: products, isLoading } = useGetProducts(currentProfileAuthorization?.profileId, ProductCategory.Music);
  const isEmpty = !isLoading && !products?.data?.length;

  return (
    <div>
      <PageHeader
        title="My Music"
        description="Manage your albums and singles"
        action={!isEmpty && <CreateMusicDropdown />}
      />
      {isLoading && <Loading />}
      {isEmpty && (
        <EmptyState
          title="No Music Found"
          description="Create your first album or single to get started"
          action={<CreateMusicDropdown />}
        />
      )}

      <div className="space-y-8 mt-8">
        {products?.data?.map((product) => <MusicItem key={product.id} product={product} />)}
      </div>
    </div>
  );
}
