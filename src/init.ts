import { Elysia } from "elysia";
import { api } from ".";

const server = new Elysia().use(api).listen(process.env.PORT || 3000);

console.log(
	`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
);
