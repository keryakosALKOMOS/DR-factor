import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  customDesign?: {
    description: string;
    hexColors: string[];
    uploadedLogoUrl?: string | null;
    uploadedDesignUrl?: string | null;
    aiPreviewUrl?: string | null;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (i) => i.product === item.product && i.size === item.size && i.color === item.color
        );
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.product === item.product && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) => !(i.product === productId && i.size === size && i.color === color)
          ),
        });
      },
      updateQuantity: (productId, quantity, size, color) => {
        set({
          items: get().items.map((i) =>
            i.product === productId && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      cartTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "ds-cart-storage",
    }
  )
);
