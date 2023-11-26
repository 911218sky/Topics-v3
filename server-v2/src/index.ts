console.time("Server Start Time");
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
// import { asyncMiddleware } from "middleware-async";

// Components
import Utils from "./components/Utils";
import EndProgram from "./EndProgram";
import WS from "./components/WS";
import { startMemcached } from "./script/Memcached";

// Routers
import AuthenticationRouter from "./router/Authentication";
import FormRouter from "./router/Form";
import ObtainRouter from "./router/Obtain";
import ReviseRouter from "./router/Revise";
import PublicRouter from "./router/Public";
import GameRouter from "./router/Game";
import MenuRouter from "./router/Menu";
import UserRouter from "./router/User";

config({
  path: "./../.env",
});

async function main() {
  const app = express();
  const port = 3001;
  app.use(express.json());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use("/api", express.static("./doc", { maxAge: 60 * 60 * 1000 }));
  app.use(Utils.verifyIdentity);
  app.use("/authentication", AuthenticationRouter);
  app.use("/revise", ReviseRouter);
  app.use("/obtain", ObtainRouter);
  app.use("/form", FormRouter);
  app.use("/public", PublicRouter);
  app.use("/game", GameRouter);
  app.use("/menu", MenuRouter);
  app.use("/user", UserRouter);

  const options: https.ServerOptions = {
    key: fs.readFileSync("./localhost.key"),
    cert: fs.readFileSync("./localhost.crt"),
  };

  startMemcached();
  
  const sslServer: https.Server = https.createServer(options, app);
  WS.startWS(sslServer, "/connection");
  sslServer.listen(port, () => {
    console.timeEnd("Server Start Time");
    console.log(`Express server running on port ${port} with SSL`);
  });

  process.on("SIGINT", () => {
    EndProgram().then(() => {
      process.exit();
    });
  });
}

main();
