import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@tribe-nest/frontend-shared";
import { useAuth } from "@/hooks/useAuth";
import { useGetProducts } from "@/hooks/queries/useProducts";
import { ProductCategory, type IProduct } from "@/types/product";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";

interface SelectEditorProductProps {
  category: ProductCategory;
  onProductSelect: (product: IProduct) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SelectEditorProduct({
  category,
  onProductSelect,
  title = "Select Product",
  description = "Choose a product to add to your website",
  isOpen,
  setIsOpen,
}: SelectEditorProductProps) {
  const { currentProfileAuthorization } = useAuth();
  const { data: products, isLoading } = useGetProducts(currentProfileAuthorization?.profileId, category);

  const handleProductSelect = (product: IProduct) => {
    onProductSelect(product);
    setIsOpen(false);
  };

  const isEmpty = !isLoading && !products?.data?.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading && <Loading />}

          {isEmpty && <EmptyState title="No Music found" />}

          {!isLoading && !isEmpty && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products?.data?.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex items-center gap-3">
                    {product.media?.[0] && (
                      <img
                        src={product.media[0].url}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{product.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
