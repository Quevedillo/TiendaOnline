import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async () => {
  try {
    // Get first 5 products with their details
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, cost_price, stock, sizes_available')
      .limit(5);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Primeros 5 productos',
      products: products?.map(p => ({
        id: p.id,
        name: p.name,
        priceInCents: p.price,
        priceInEuros: p.price ? (p.price / 100).toFixed(2) : '0.00',
        cost_price: p.cost_price,
        stock: p.stock,
        sizes_available: p.sizes_available,
      })) || [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
