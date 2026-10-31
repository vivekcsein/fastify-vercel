import Fastify, { type FastifyInstance } from "fastify";
import createApp from "./app/main";

const buildApp = async (): Promise<FastifyInstance> => {
  try {
    const app = await createApp();
    await app.ready();
    return app;
  } catch (thrown: unknown) {
    const message = thrown instanceof Error ? thrown.message : String(thrown);
    console.error("[startup failed]", message);

    const errorApp = Fastify();
    errorApp.all("*", async (_request, reply) =>
      reply.code(500).send({
        success: false,
        message: "Server failed to start",
        ...(process.env.NODE_ENV === "production" ? {} : { error: message }),
      }),
    );
    await errorApp.ready();
    return errorApp;
  }
};

const app = await buildApp();

await app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });

export default app;
