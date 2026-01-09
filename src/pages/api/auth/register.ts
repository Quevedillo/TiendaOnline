import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, password, full_name } = await request.json();

    // Validar datos
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email y password son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Registrar usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split('@')[0],
        },
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ error: 'Error al crear usuario' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // El trigger en la BD crea automáticamente el perfil en user_profiles
    // Si quieres esperar a que se cree el perfil:
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuario registrado exitosamente. Por favor inicia sesión.',
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Register error:', error);
    return new Response(
      JSON.stringify({ error: 'Error en el servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
