import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

/**
 * POST - Darse de baja del newsletter
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = body.email?.toString().trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si existe el suscriptor
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (!existing) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Este email no está suscrito al newsletter',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar suscriptor
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Error removing newsletter subscriber:', error);
      return new Response(
        JSON.stringify({ error: 'Error al darse de baja del newsletter' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Te has dado de baja del newsletter correctamente. Lamentamos verte partir.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en POST /api/newsletter/unsubscribe:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * GET - Formulario de desuscripción (para enlaces en emails)
 */
export const GET: APIRoute = async ({ url, redirect }) => {
  const email = url.searchParams.get('email');
  
  // Redirigir a la página de desuscripción con el email pre-llenado
  if (email) {
    return redirect(`/unsubscribe?email=${encodeURIComponent(email)}`);
  }
  
  return redirect('/unsubscribe');
};

/**
 * Validar formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
