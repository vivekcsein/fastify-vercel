// import Fastify, { type FastifyInstance } from "fastify";

// const healthResponse = () => ({
//   success: true,
//   message: "Server is healthy",
//   timestamp: new Date().toISOString(),
//   environment: process.env.NODE_ENV,
// });

// const createApp = async (): Promise<FastifyInstance> => {
//   const app = Fastify({
//     logger: {
//       level: process.env.NODE_ENV === "production" ? "warn" : "info",
//     },
//   });

//   app.get("/", async (_req, reply) => reply.status(200).send(healthResponse()));
//   app.get("/health", async (_req, reply) => reply.status(200).send(healthResponse()));

//   return app;
// };

// export default createApp;
