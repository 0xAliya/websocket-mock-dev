import { createServer } from "vite";
import { parse } from "url";
import { WebSocketServer } from "ws";

(async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
  });

  const wsServer = new WebSocketServer({
    noServer: true,
  });

  server.httpServer?.on("upgrade", async (req, socket, head) => {
    const { pathname } = parse(req.url ?? "");

    if (pathname === "/wss") {
      const wsConfig = (await import("./src/mock/ws/ws.js")).default;
      wsServer.handleUpgrade(req, socket, head, (ws) => {
        wsConfig.open.forEach((openMsg) => {
          ws.send(JSON.stringify(openMsg));
        });

        wsConfig.interval.forEach(([message, interval]) => {
          setInterval(() => {
            ws.send(JSON.stringify(message));
          }, interval);
        });
      });
    }
  });

  await server.listen();

  server.printUrls()
})();
