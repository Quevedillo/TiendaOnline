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
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <>
      {/* Overlay */}
      {cart.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={() => closeCart()}
        />
      )}

      {/* Slide Over Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-brand-dark shadow-2xl z-50 transform transition-transform duration-300 ${
          cart.isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-brand-gray bg-brand-black">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
              🛒 Tu Carrito
            </h2>
            <button
              onClick={() => closeCart()}
              className="text-neutral-400 hover:text-white transition-colors"
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
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-6xl mb-4">👟</div>
              <p className="text-neutral-500 text-center text-lg">
                Tu carrito está vacío
              </p>
              <a 
                href="/productos"
                onClick={() => closeCart()}
                className="mt-6 bg-brand-red text-white px-6 py-3 font-bold uppercase hover:bg-brand-orange transition-colors"
              >
                Explorar Kicks
              </a>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.items.map((item) => (
                <div key={`${item.product_id}-${item.size}`} className="flex gap-4 bg-brand-gray p-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-brand-black flex-shrink-0 overflow-hidden">
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
                      <p className="text-brand-red text-xs font-bold uppercase">
                        {item.product.brand}
                      </p>
                      <h3 className="font-bold text-white text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        Talla: <span className="text-white">{item.size}</span>
                      </p>
                      <p className="text-lg font-bold text-brand-red mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.product_id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 bg-brand-black text-white text-sm font-bold hover:bg-brand-red transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-white w-8 text-center">
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
                        className="w-8 h-8 bg-brand-black text-white text-sm font-bold hover:bg-brand-red transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id, item.size)}
                        className="ml-auto text-xs text-neutral-500 hover:text-brand-red transition-colors"
                      >
                        ✕ Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer with Total and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t border-brand-gray p-6 space-y-4 bg-brand-black">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 uppercase text-sm">Total:</span>
                <span className="text-2xl font-bold text-white">{formatPrice(total)}</span>
              </div>
              <button className="w-full bg-brand-red text-white py-4 font-bold uppercase tracking-wider hover:bg-brand-orange transition-all hover:scale-[1.02]">
                🔒 Proceder al Pago
              </button>
              <button
                onClick={() => closeCart()}
                className="w-full bg-brand-gray text-white py-3 font-bold uppercase tracking-wider hover:bg-brand-dark transition-colors"
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
