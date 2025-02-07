import { verifyRequestOrigin } from "oslo/request";
import { defineMiddleware } from "astro:middleware";
import { auth } from "./server/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method !== "GET") {
    const originHeader = context.request.headers.get("Origin");
    const hostHeader = context.request.headers.get("Host");
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response(null, {
        status: 403,
      });
    }
  }

  const sessionId = context.cookies.get(auth.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    context.locals.customer = null;
    context.locals.session = null;
    return next();
  }

  const { session, customer } = await auth.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = auth.createSessionCookie(session.id);
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
  if (!session) {
    const sessionCookie = auth.createBlankSessionCookie();
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }

  context.locals.session = session;
  context.locals.customer = customer;

  return next();
});
