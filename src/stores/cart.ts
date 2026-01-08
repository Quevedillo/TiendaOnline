import { atom } from 'nanostores';
import type { CartItem, Product } from './supabase';

export interface CartStore {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartStore = {
  items: [],
  isOpen: false,
};

// Load cart from localStorage on client side
const getInitialCart = (): CartStore => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  const stored = localStorage.getItem('fashionmarket-cart');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialState;
    }
  }
  return initialState;
};

export const cartStore = atom<CartStore>(getInitialCart());

// Save to localStorage whenever cart changes
cartStore.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fashionmarket-cart', JSON.stringify(value));
  }
});

// Actions
export const addToCart = (product: Product, quantity: number, size: string) => {
  const current = cartStore.get();
  const existingItem = current.items.find(
    (item) => item.product_id === product.id && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    current.items.push({
      product_id: product.id,
      product,
      quantity,
      size,
    });
  }

  cartStore.set({ ...current, items: current.items });
};

export const removeFromCart = (productId: string, size: string) => {
  const current = cartStore.get();
  current.items = current.items.filter(
    (item) => !(item.product_id === productId && item.size === size)
  );
  cartStore.set({ ...current, items: current.items });
};

export const updateCartItemQuantity = (
  productId: string,
  size: string,
  quantity: number
) => {
  const current = cartStore.get();
  const item = current.items.find(
    (item) => item.product_id === productId && item.size === size
  );

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId, size);
    } else {
      item.quantity = quantity;
      cartStore.set({ ...current, items: current.items });
    }
  }
};

export const clearCart = () => {
  cartStore.set({ items: [], isOpen: false });
};

export const toggleCart = () => {
  const current = cartStore.get();
  cartStore.set({ ...current, isOpen: !current.isOpen });
};

export const openCart = () => {
  const current = cartStore.get();
  cartStore.set({ ...current, isOpen: true });
};

export const closeCart = () => {
  const current = cartStore.get();
  cartStore.set({ ...current, isOpen: false });
};

// Calculated values
export const getCartTotal = (): number => {
  const current = cartStore.get();
  return current.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

export const getCartItemCount = (): number => {
  const current = cartStore.get();
  return current.items.reduce((count, item) => count + item.quantity, 0);
};
