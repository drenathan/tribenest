import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);

      // Inject runtime environment variables into the request
      req.runtimeConfig = {
        rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001",
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      };

      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Runtime config:`, {
        rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001",
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      });
    });
});
