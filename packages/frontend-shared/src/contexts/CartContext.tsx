"use client";
import type { ProductDeliveryType } from "../types";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  productVariantId: string;
  title: string;
  price: number;
  coverImage?: string;
  isGift: boolean;
  recipientName?: string;
  recipientEmail?: string;
  canIncreaseQuantity: boolean;
  quantity: number;
  recipientMessage?: string;
  payWhatYouWant: boolean;
  color?: string;
  size?: string;
  deliveryType?: ProductDeliveryType;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => boolean;
  removeFromCart: (productId: string, isGift: boolean, recipientEmail?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tribenest-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    if (!isInitialized) {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [cartItems, isInitialized]);

  const addToCart = useCallback(
    (item: CartItem): boolean => {
      const exists = cartItems.some(
        (i) =>
          i.productId === item.productId &&
          i.productVariantId === item.productVariantId &&
          i.isGift === item.isGift &&
          i.recipientEmail === item.recipientEmail,
      );

      if (exists) {
        setCartItems((prev) =>
          prev.map((i) => {
            if (
              i.productId === item.productId &&
              i.productVariantId === item.productVariantId &&
              i.isGift === item.isGift &&
              i.recipientEmail === item.recipientEmail
            ) {
              return item;
            } else {
              return i;
            }
          }),
        );
        toast.info("Item already in cart");
        return false;
      }
      setCartItems((prev) => [...prev, item]);
      setCartOpen(true);
      toast.success("Item added to cart");
      return true;
    },
    [cartItems],
  );

  const removeFromCart = (productId: string, isGift: boolean, recipientEmail?: string) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.isGift === isGift && i.recipientEmail === recipientEmail)),
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isCartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
