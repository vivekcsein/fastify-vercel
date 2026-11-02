import Fastify, { LogController, type FastifyInstance } from "fastify";
import { envAppConfig } from "../packages/env/app.env";
import { registerBootstrap } from "./routes";
import bodyLimit from "../packages/middlewares/body-limit";
import compression from "../packages/middlewares/compression";
import cors from "../packages/middlewares/cors";
import rateLimiter from "../packages/middlewares/rate-limiter";
import requestLogging from "../packages/middlewares/request-logging";
import securityHeaders from "../packages/middlewares/security-headers";

const createApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
    },
    // Requests are logged by the request-logging plugin; skip Fastify's own two lines.
    // (`logController` replaces the deprecated `disableRequestLogging`; needs fastify >= 5.12.)
    logController: new LogController({ disableRequestLogging: true }),
    // Parser-level limit — the real backstop behind the Content-Length check in body-limit.
    bodyLimit: envAppConfig.BODY_LIMIT_BYTES,
    // Trust x-forwarded-for so `request.ip` is the real client, not the proxy. Vercel
    // overwrites that header, so it is always safe there; elsewhere set TRUST_PROXY=true
    // ONLY when you run behind a proxy you control (nginx, a load balancer, ...).
    // Without it every client shares the proxy's IP, and therefore one rate-limit bucket.
    trustProxy: envAppConfig.TRUST_PROXY || process.env.VERCEL !== undefined,
    // Globally unique request ids (Fastify's default is a per-process counter: "req-1").
    genReqId: () => crypto.randomUUID(),
  });

  await app.register(requestLogging);
  await app.register(securityHeaders);

  // 2. Guards that apply to every request, before any route runs. CORS comes before the
  //    rate limiter so preflight (OPTIONS) requests are answered before them.
  await app.register(cors);
  await app.register(compression);
  await app.register(bodyLimit);
  await app.register(rateLimiter);

  // 3. Error and not-found handlers before the routes, so every route inherits them.
  // await app.register(errorHandler);
  // await app.register(notFound);

  // 4. Routes. OpenAPI first (see routes.ts), then health, static and the versioned API.
  await registerBootstrap(app);

  return app;
};

export default createApp;
