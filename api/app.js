import express from "express";
import cors from "cors";
import { AuthService, proxyToJira } from "./service.js";
const app = express();

if (!process.env.DISABLE_CORS) {
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
}

// Proxy
app.all("/api/*", async (req, res) => {
  const { method } = req;
  console.log(`${method} - ${req.originalUrl}`);
  const cleanedUrl = req.originalUrl.split("/api")[1];
  try {
    const response = await proxyToJira(cleanedUrl, method);
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("Content-Type"));
    response.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).end;
  }
});

app.use("/", express.static("public"));

async function initialize() {
  if (process.env.USERNAME && process.env.PASSWORD) {
    await AuthService.tidyAccessTokens();
    await AuthService.createAccessToken();
  } else if (process.env.ACCESS_TOKEN) {
    AuthService.setAccessToken(process.env.ACCESS_TOKEN);
  } else {
    throw new Error(
      `CRITICAL: No Jira api credentials have been provided. 
      Please either provide USERNAME and PASSWORD environment variables, 
      or the ACCESS_TOKEN environment variable!`
    );
  }

  app.listen(80, () => {
    console.log("listening on localhost:80");
  });
}

initialize();
