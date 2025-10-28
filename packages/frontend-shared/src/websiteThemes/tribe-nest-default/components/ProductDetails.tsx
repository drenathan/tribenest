"use client";
import { useState, useMemo, useEffect } from "react";
import { type IPublicProduct } from "../../../types";
import { useEditorContext } from "../../../components/editor/context";
import { useCart } from "../../../contexts/CartContext";
import { toast } from "sonner";
import { EditorButtonWithoutEditor } from "../../../components/editor/selectors";

export function ProductDetails({ product }: { product: IPublicProduct }) {
  const { themeSettings } = useEditorContext();
  const { addToCart } = useCart();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get unique colors from variants
  const availableColors = useMemo(() => {
    const colors = Array.from(new Set(product.variants.map((v) => v.color)));
    return colors.map((color) => ({
      name: color,
      hasAvailableSize: product.variants.some((v) => v.color === color && v.availabilityStatus === "active"),
    }));
  }, [product.variants]);

  // Get sizes for selected color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    return product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => ({
        name: v.size,
        isAvailable: v.availabilityStatus === "active",
        variant: v,
      }));
  }, [selectedColor, product.variants]);

  // Get selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  }, [selectedColor, selectedSize, product.variants]);

  // Only show images for selected variant, fallback to product images if none
  const availableImages = useMemo(() => {
    if (selectedVariant?.media) {
      const variantImages = selectedVariant.media.filter((m) => m.type === "image");
      if (variantImages.length > 0) {
        return variantImages;
      }
    }
    // Fallback to product images if no variant images
    return product.media.filter((m) => m.type === "image");
  }, [selectedVariant, product.media]);

  // Auto-select first available color on mount
  useMemo(() => {
    if (!selectedColor && availableColors.length > 0) {
      const firstAvailableColor = availableColors.find((c) => c.hasAvailableSize);
      if (firstAvailableColor) {
        setSelectedColor(firstAvailableColor.name);
      }
    }
  }, [availableColors, selectedColor]);

  // Auto-select first available size when color changes
  useMemo(() => {
    if (selectedColor && !selectedSize && availableSizes.length > 0) {
      const firstAvailableSize = availableSizes.find((s) => s.isAvailable);
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.name);
      }
    }
  }, [selectedColor, selectedSize, availableSizes]);

  // Reset image index when variant changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select color and size");
      return;
    }

    if (selectedVariant.availabilityStatus !== "active") {
      toast.error("This variant is out of stock");
      return;
    }

    const coverImage = availableImages[0]?.url || "";

    addToCart({
      productId: product.id,
      productVariantId: selectedVariant.id,
      title: product.title,
      price: selectedVariant.price,
      coverImage,
      isGift: false,
      canIncreaseQuantity: true,
      quantity,
      payWhatYouWant: selectedVariant.payWhatYouWant || false,
      color: selectedVariant.color,
      size: selectedVariant.size,
      deliveryType: selectedVariant.deliveryType,
    });
  };

  const isAddToCartDisabled = !selectedVariant || selectedVariant.availabilityStatus !== "active";

  return (
    <div
      className="w-full flex flex-col items-center px-2 @md:px-8 min-h-screen pb-10"
      style={{
        backgroundColor: themeSettings.colors.background,
        color: themeSettings.colors.text,
        fontFamily: themeSettings.fontFamily,
      }}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div
            className="aspect-square rounded-lg overflow-hidden"
            style={{ backgroundColor: `${themeSettings.colors.background}` }}
          >
            {availableImages.length > 0 ? (
              <img
                src={availableImages[currentImageIndex]?.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ color: `${themeSettings.colors.text}60` }}
              >
                No image available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {availableImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index ? "border-current" : "border-transparent"
                  }`}
                  style={{
                    borderColor: currentImageIndex === index ? themeSettings.colors.primary : "transparent",
                  }}
                >
                  <img src={image.url} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-xl font-semibold" style={{ color: themeSettings.colors.primary }}>
              ${selectedVariant?.price.toFixed(2) || product.variants[0]?.price.toFixed(2)}
              {selectedVariant?.payWhatYouWant && " (Pay what you want)"}
            </p>
          </div>

          {product.description && (
            <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {/* Color Selection */}
          <div>
            <h3 className="text-lg mb-3">Color</h3>
            <div className="flex flex-wrap gap-3  items-center h-10">
              {availableColors.map((color) => {
                // Check if color is a hex code, otherwise use CSS color names or fallback
                const isHexColor = color.name.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
                const colorValue = isHexColor ? color.name : color.name.toLowerCase();

                return (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedSize(null); // Reset size when color changes
                    }}
                    disabled={!color.hasAvailableSize}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name ? "border-current shadow-md scale-110 h-10 w-10" : undefined
                    } ${!color.hasAvailableSize ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
                    style={{
                      borderColor:
                        selectedColor === color.name ? themeSettings.colors.primary : `${themeSettings.colors.text}30`,
                      backgroundColor: colorValue,
                    }}
                    title={color.name}
                  >
                    {/* Inner circle for better visibility on light colors */}
                    <div
                      className="absolute inset-1 rounded-full border"
                      style={{
                        backgroundColor: colorValue,
                        borderColor: `${themeSettings.colors.text}10`,
                      }}
                    />
                    {/* Selected indicator */}
                    {selectedColor === color.name && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <div
                          className="w-2 h-2 rounded-full shadow-sm"
                          style={{ backgroundColor: themeSettings.colors.textPrimary }}
                        />
                      </div>
                    )}
                    {/* Disabled overlay */}
                    {!color.hasAvailableSize && (
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${themeSettings.colors.text}30` }}
                      >
                        <div
                          className="w-6 h-0.5 rotate-45"
                          style={{ backgroundColor: `${themeSettings.colors.text}60` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          {selectedColor && (
            <div>
              <h3 className="text-lg mb-3">Size</h3>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    disabled={!size.isAvailable}
                    className={`px-4 py-2 rounded-md border-2 transition-all ${
                      selectedSize === size.name ? "shadow-md" : ""
                    } ${!size.isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    style={{
                      borderColor:
                        selectedSize === size.name ? themeSettings.colors.primary : `${themeSettings.colors.text}30`,
                      backgroundColor:
                        selectedSize === size.name
                          ? `${themeSettings.colors.primary}10`
                          : !size.isAvailable
                            ? `${themeSettings.colors.text}10`
                            : "transparent",
                      color: !size.isAvailable ? `${themeSettings.colors.text}60` : themeSettings.colors.text,
                    }}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          {selectedVariant && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
                  style={{
                    borderColor: `${themeSettings.colors.text}30`,
                    color: themeSettings.colors.text,
                  }}
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
                  style={{
                    borderColor: `${themeSettings.colors.text}30`,
                    color: themeSettings.colors.text,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="pt-4">
            <EditorButtonWithoutEditor
              fullWidth
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
              text={
                !selectedVariant
                  ? "Select Color and Size"
                  : selectedVariant.availabilityStatus !== "active"
                    ? "Out of Stock"
                    : "Add to Cart"
              }
            />
          </div>

          {/* Product Details */}
          {selectedVariant && (
            <div className="pt-6 border-t" style={{ borderColor: `${themeSettings.colors.text}20` }}>
              <h3 className="text-lg font-semibold mb-3">Product Details</h3>
              <div className="space-y-2 text-sm" style={{ color: `${themeSettings.colors.text}80` }}>
                <p>
                  <span className="font-medium">Category:</span> {product.category}
                </p>
                <p>
                  <span className="font-medium">SKU:</span> {selectedVariant.upcCode || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProductDetails.craft = {
  name: "ProductDetails",
  custom: {
    preventDelete: true,
  },
};
