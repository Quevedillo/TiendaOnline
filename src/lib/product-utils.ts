import type { Product, CartItem } from '@lib/supabase';

/**
 * Calculate total price of cart items
 * @param items Cart items
 * @returns Total in cents
 */
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

/**
 * Calculate total quantity of items in cart
 * @param items Cart items
 * @returns Total quantity
 */
export const calculateTotalQuantity = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Check if product is in stock
 * @param stock Stock quantity
 * @returns Boolean indicating if product is in stock
 */
export const isInStock = (stock: number): boolean => {
  return stock > 0;
};

/**
 * Check if product has low stock
 * @param stock Stock quantity
 * @param threshold Low stock threshold (default: 5)
 * @returns Boolean indicating if stock is low
 */
export const isLowStock = (stock: number, threshold: number = 5): boolean => {
  return stock > 0 && stock <= threshold;
};

/**
 * Generate product image URL from storage
 * @param filename Image filename
 * @returns Full URL to image
 */
export const getProductImageUrl = (filename: string): string => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/products-images/${filename}`;
};

/**
 * Validate product data before submission
 * @param product Product data to validate
 * @returns Object with validation errors or empty if valid
 */
export const validateProduct = (
  product: Partial<Product>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!product.name || product.name.trim().length === 0) {
    errors.name = 'El nombre es requerido';
  }

  if (!product.slug || product.slug.trim().length === 0) {
    errors.slug = 'El slug es requerido';
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.description = 'La descripción es requerida';
  }

  if (!product.price || product.price < 0) {
    errors.price = 'El precio debe ser mayor a 0';
  }

  if (product.stock === undefined || product.stock < 0) {
    errors.stock = 'El stock no puede ser negativo';
  }

  if (!product.category_id) {
    errors.category_id = 'La categoría es requerida';
  }

  return errors;
};
