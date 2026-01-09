import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Borrar las cookies de sesión
    cookies.delete('auth-token', { path: '/' });
    cookies.delete('refresh-token', { path: '/' });

    // También cerrar sesión en Supabase
    await supabase.auth.signOut();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesión cerrada',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({ error: 'Error al cerrar sesión' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
