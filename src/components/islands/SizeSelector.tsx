import React, { useState, useEffect } from 'react';

interface SizeSelectorProps {
  stock: number;
  onSizesChange?: (sizes: Record<string, number>) => void;
}

const AVAILABLE_SIZES = [
  '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42',
  '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46', '47', '48', '49', '50', '51', '52'
];

export const SizeSelector: React.FC<SizeSelectorProps> = ({ stock: initialStock, onSizesChange }) => {
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [totalAssigned, setTotalAssigned] = useState(0);
  const [stock, setStock] = useState(initialStock);

  // Escuchar cambios de stock
  useEffect(() => {
    const handleStockUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newStock = customEvent.detail.stock;
      setStock(newStock);
      
      // Si el nuevo stock es menor, limpiar configuración de tallas
      if (newStock < totalAssigned) {
        setSizes({});
        setTotalAssigned(0);
      }
    };

    window.addEventListener('stock-updated', handleStockUpdate);
    return () => window.removeEventListener('stock-updated', handleStockUpdate);
  }, [totalAssigned]);

  // Emitir cambios
  const emitSizesUpdated = (updatedSizes: Record<string, number>) => {
    const event = new CustomEvent('sizes-updated', {
      detail: { sizes: updatedSizes }
    });
    window.dispatchEvent(event);
    onSizesChange?.(updatedSizes);
  };

  // Actualizar cantidad de una talla
  const updateSize = (size: string, quantity: number) => {
    let newSizes = { ...sizes };
    
    if (quantity === 0) {
      delete newSizes[size];
    } else if (quantity > 0) {
      newSizes[size] = quantity;
    }

    // Verificar que no excedamos el stock total
    const total = Object.values(newSizes).reduce((a, b) => a + b, 0);
    if (total > stock) {
      return; // No permitir exceder stock
    }

    setSizes(newSizes);
    setTotalAssigned(total);
    emitSizesUpdated(newSizes);
  };

  // Distribuir equitativamente
  const distributeEqually = () => {
    if (stock === 0) return;
    
    const newSizes: Record<string, number> = {};
    const baseQuantity = Math.floor(stock / Math.max(1, Object.keys(sizes).length || 1));
    const remainder = stock % Math.max(1, Object.keys(sizes).length || 1);

    Object.keys(sizes).forEach((size, idx) => {
      newSizes[size] = baseQuantity + (idx < remainder ? 1 : 0);
    });

    setSizes(newSizes);
    setTotalAssigned(stock);
    emitSizesUpdated(newSizes);
  };

  // Limpiar todo
  const clearAll = () => {
    setSizes({});
    setTotalAssigned(0);
    emitSizesUpdated({});
  };

  // Añadir una nueva talla
  const addSize = (size: string) => {
    if (!sizes.hasOwnProperty(size)) {
      const newSizes = { ...sizes, [size]: 1 };
      setSizes(newSizes);
      setTotalAssigned(totalAssigned + 1);
      emitSizesUpdated(newSizes);
    }
  };

  // Eliminar una talla
  const removeSize = (size: string) => {
    const newSizes = { ...sizes };
    const removed = newSizes[size] || 0;
    delete newSizes[size];
    setSizes(newSizes);
    setTotalAssigned(totalAssigned - removed);
    emitSizesUpdated(newSizes);
  };

  return (
    <div className="space-y-6">
      {/* Stock info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Stock total: {stock}</strong> pares • Asignado: {totalAssigned} • Disponibles: {stock - totalAssigned}
        </p>
      </div>

      {/* Tallas seleccionadas */}
      {Object.keys(sizes).length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Tallas Seleccionadas</h3>
          <div className="space-y-3">
            {Object.entries(sizes)
              .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
              .map(([size, quantity]) => (
                <div key={size} className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded border border-neutral-200">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">Talla {size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSize(size, quantity - 1)}
                      className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 rounded text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => updateSize(size, Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      max={stock}
                      className="w-12 text-center border border-neutral-300 rounded px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => updateSize(size, quantity + 1)}
                      className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 rounded text-sm"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Botones de utilidad */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={distributeEqually}
              className="flex-1 px-3 py-2 bg-brand-black text-white rounded text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Distribuir Equitativamente
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-2 bg-neutral-200 text-neutral-700 rounded text-sm font-medium hover:bg-neutral-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Selector de tallas disponibles */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <h3 className="font-semibold text-neutral-900 mb-4">
          {Object.keys(sizes).length === 0 ? 'Selecciona Tallas' : 'Añadir Más Tallas'}
        </h3>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = sizes.hasOwnProperty(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    removeSize(size);
                  } else {
                    addSize(size);
                  }
                }}
                disabled={!isSelected && totalAssigned >= stock}
                className={`
                  py-2 px-3 rounded border font-medium text-sm transition-all
                  ${isSelected
                    ? 'bg-brand-black text-white border-brand-black'
                    : totalAssigned >= stock
                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                    : 'bg-neutral-50 text-neutral-900 border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 cursor-pointer'
                  }
                `}
              >
                {size}
              </button>
            );
          })}
        </div>
        {stock === 0 && (
          <p className="text-sm text-red-600 mt-3">⚠️ No hay stock disponible. Configura el stock primero.</p>
        )}
      </div>

      {/* Hidden input para almacenar sizes */}
      <input
        type="hidden"
        name="sizes_available"
        value={JSON.stringify(sizes)}
      />
    </div>
  );
};
