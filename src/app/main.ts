import Fastify, { LogController, type FastifyInstance } from "fastify";
import { envAppConfig } from "../packages/env/app.env";

const healthResponse = () => ({
  success: true,
  message: "Server is healthy",
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
});

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

  app.get("/", async (_req, reply) => reply.status(200).send(healthResponse()));
  app.get("/health", async (_req, reply) => reply.status(200).send(healthResponse()));

  return app;
};

export default createApp;
