import { Elysia } from "elysia";
import { auth } from "./auth";

const app = new Elysia().mount(auth.handler).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
