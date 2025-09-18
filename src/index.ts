import { Elysia } from "elysia";
import { initializeHolidays } from "./holidays-service";

await initializeHolidays();

export const api = new Elysia();
