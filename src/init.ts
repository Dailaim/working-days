import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { api } from ".";

const server = new Elysia().use(openapi()).use(api).listen(3000);

console.log(
	`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
);
