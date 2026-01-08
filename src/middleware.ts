// Middleware for authentication
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  // Protect /admin routes
  const isAdminRoute = context.url.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // In production, verify Supabase session here
    // For now, we're allowing access - implement real auth in production
    const user = context.locals.user;

    // Example: redirect to login if not authenticated
    // if (!user) {
    //   return context.redirect("/admin/login");
    // }
  }

  return next();
});
