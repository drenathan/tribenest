import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { IProduct } from "@/types/product";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tribe-nest/frontend-shared";
import { Ellipsis, Edit, Trash } from "lucide-react";
import { ConfirmationModal } from "@/routes/_dashboard/-components/confirmation-modal";
import { useArchiveProduct, useUnarchiveProduct } from "@/hooks/mutations/useProduct";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  product: IProduct;
};

export function ProductItem({ product }: Props) {
  const { currentProfileAuthorization } = useAuth();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const { mutate: archiveProduct } = useArchiveProduct();
  const { mutate: unarchiveProduct } = useUnarchiveProduct();
  const navigate = useNavigate();
  const defaultVariant = useMemo(() => product.variants.find((v) => v.isDefault) || product.variants[0], [product]);

  const coverImage =
    product.media.find((m) => m.type === "image")?.url || defaultVariant?.media.find((m) => m.type === "image")?.url;

  const { priceLabel, variantCount } = useMemo(() => {
    const prices = (product.variants || []).map((v) => v.price).filter((p): p is number => typeof p === "number");
    const min = Math.min(...(prices.length ? prices : [0]));
    const max = Math.max(...(prices.length ? prices : [0]));
    const label = min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
    return { priceLabel: label, variantCount: product.variants?.length || 0 };
  }, [product]);

  const noneActiveVariants = product.variants.filter((v) => v.availabilityStatus !== "active").length;
  const isArchived = Boolean(product.archivedAt);

  const handleArchive = () => {
    const profileId = currentProfileAuthorization?.profile.id;
    if (!profileId) return;

    if (isArchived) {
      unarchiveProduct({ productId: product.id, profileId });
    } else {
      archiveProduct({ productId: product.id, profileId });
    }
  };

  return (
    <div className="w-full border rounded-md p-3 hover:bg-accent/30 transition-colors flex  justify-between">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-sm bg-muted overflow-hidden flex items-center justify-center">
          {coverImage ? (
            <img src={coverImage} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-xs text-muted-foreground">No image</div>
          )}
        </div>

        {/* Title and meta */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{product.title}</p>
            {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{product.category}</span>
            <span>•</span>
            <span>
              {variantCount} variant{variantCount === 1 ? "" : "s"}
            </span>
            {!!noneActiveVariants && (
              <>
                <span>•</span>
                <span>{noneActiveVariants} out of stock</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{priceLabel}</span>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate({ to: `/store/products/${product.id}/edit` })}>
            <Edit className="mr-2 h-4 w-4" /> Edit product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsArchiveModalOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> {isArchived ? "Unarchive" : "Archive"} product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        title={isArchived ? "Unarchive product" : "Archive product"}
        text={
          isArchived
            ? "Are you sure you want to unarchive this product?"
            : "Are you sure you want to archive this product?"
        }
        onConfirm={handleArchive}
        isOpen={isArchiveModalOpen}
        setIsOpen={setIsArchiveModalOpen}
      />
    </div>
  );
}
