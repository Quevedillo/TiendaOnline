// Middleware for authentication
import { defineMiddleware } from "astro:middleware";
import { supabase } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const isAdminRoute = context.url.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Get session from cookies (set after login)
    const sessionCookie = context.cookies.get('sb-session');

    // Check if user is authenticated
    if (!sessionCookie?.value) {
      // Redirect to login if not authenticated and not on login page
      if (!context.url.pathname.includes("/admin/login")) {
        return context.redirect("/admin/login");
      }
    } else {
      try {
        // Verify session is valid with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(sessionCookie.value);

        if (error || !user) {
          context.cookies.delete('sb-session');
          return context.redirect("/admin/login");
        }

        // Store user in context for use in pages
        context.locals.user = user;
      } catch (err) {
        context.cookies.delete('sb-session');
        return context.redirect("/admin/login");
      }
    }
  }

  return next();
});
