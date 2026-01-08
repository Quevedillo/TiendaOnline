import React, { useState } from 'react';
import { addToCart, openCart } from '@stores/cart';
import type { Product } from '@lib/supabase';

interface AddToCartButtonProps {
  product: Product;
  client:boolean;
}

export default function AddToCartButton({ product, client = true }: AddToCartButtonProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>('');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    if (!selectedSize) {
      setFeedback('Por favor, selecciona una talla');
      return;
    }

    if (product.stock <= 0) {
      setFeedback('Producto agotado');
      return;
    }

    addToCart(product, quantity, selectedSize);
    openCart();
    setFeedback('✓ Agregado al carrito');
    setQuantity(1);
    setSelectedSize('');

    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Talla
        </label>
        <div className="grid grid-cols-6 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-2 px-3 text-sm font-medium border-2 transition-colors ${
                selectedSize === size
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-neutral-300 bg-white text-gray-900 hover:border-brand-navy'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={product.stock <= 0}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 border border-neutral-300 text-gray-900 hover:bg-neutral-50"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
            }
            className="w-16 text-center border border-neutral-300 py-2"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 border border-neutral-300 text-gray-900 hover:bg-neutral-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className={`w-full py-3 px-4 font-semibold transition-colors ${
          product.stock > 0
            ? 'bg-brand-navy text-white hover:bg-brand-charcoal cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
      </button>

      {/* Feedback Message */}
      {feedback && (
        <p className={`text-center text-sm ${feedback.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {feedback}
        </p>
      )}

      {/* Stock Info */}
      <p className="text-xs text-neutral-600">
        {product.stock > 0
          ? `${product.stock} en stock`
          : 'No disponible'}
      </p>
    </div>
  );
}
