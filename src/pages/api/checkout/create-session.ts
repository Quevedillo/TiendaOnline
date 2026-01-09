import type { APIRoute } from 'astro';
import { stripe } from '@lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay productos en el carrito' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get tokens from cookies
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Debe estar autenticado para hacer checkout' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client and set session
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: { session }, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Sesión inválida. Por favor inicie sesión nuevamente.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user.id;
    const userEmail = session.user.email || '';

    // Transform cart items to Stripe line items
    const lineItems = items.map((item: {
      product: {
        name: string;
        images: string[];
        price: number;
        brand?: string;
      };
      quantity: number;
      size: string;
    }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.product.brand ? item.product.brand + ' - ' : ''}${item.product.name}`,
          description: `Talla: ${item.size}`,
          images: item.product.images.slice(0, 1), // Stripe allows max 8 images
        },
        unit_amount: item.product.price, // Price is already in cents
      },
      quantity: item.quantity,
    }));

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:4322';

    // Create minimal cart items for metadata (Stripe has 500 char limit per value)
    const minimalCartItems = items.map((item: {
      product_id: string;
      product: {
        id: string;
        name: string;
        price: number;
        brand?: string;
        images?: string[];
      };
      quantity: number;
      size: string;
    }) => ({
      id: item.product_id || item.product.id,
      name: item.product.name,
      brand: item.product.brand || '',
      price: item.product.price,
      qty: item.quantity,
      size: item.size,
      img: item.product.images?.[0] || '',
    }));

    // Create Stripe Checkout Session with user metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ['US', 'MX', 'ES', 'AR', 'CO', 'CL', 'PE'],
      },
      billing_address_collection: 'required',
      locale: 'es',
      metadata: {
        items_count: items.length.toString(),
        user_id: userId,
        user_email: userEmail,
        cart_items: JSON.stringify(minimalCartItems),
      },
    });

    return new Response(
      JSON.stringify({ 
        sessionId: checkoutSession.id,
        url: checkoutSession.url 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
