import React, { useEffect, useState } from 'react';
import { cartStore, removeFromCart, updateCartItemQuantity, closeCart, getCartTotal } from '@stores/cart';

export default function CartSlideOver() {
  const [cart, setCart] = useState(cartStore.get());
  
  useEffect(() => {
    // Subscribe to cart changes
    const unsubscribe = cartStore.subscribe((newCart) => {
      setCart(newCart);
    });
    
    return () => unsubscribe();
  }, []);

  const total = getCartTotal();

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <>
      {/* Overlay */}
      {cart.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => closeCart()}
        />
      )}

      {/* Slide Over Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          cart.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-display font-bold text-brand-navy">
              Carrito
            </h2>
            <button
              onClick={() => closeCart()}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar carrito"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Items */}
          {cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-center">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.items.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-neutral-200 flex-shrink-0 overflow-hidden">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Talla: {item.size}
                      </p>
                      <p className="text-sm font-bold text-brand-navy mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product_id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="px-2 py-1 border border-neutral-300 text-xs hover:bg-neutral-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product_id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="px-2 py-1 border border-neutral-300 text-xs hover:bg-neutral-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.size)}
                        className="ml-auto text-xs text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer with Total and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t border-neutral-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold text-brand-navy">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button className="w-full bg-brand-navy text-white py-3 font-semibold hover:bg-brand-charcoal transition-colors">
                Proceder al Pago
              </button>
              <button
                onClick={() => closeCart()}
                className="w-full border border-brand-navy text-brand-navy py-3 font-semibold hover:bg-neutral-50 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
