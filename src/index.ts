import openapi from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { initializeHolidays } from "./holidays";
import { WorkingDaysErrors } from "./working-days/errors";
import { handleWorkdaysRequest } from "./working-days/handlers";

// Inicializar días festivos al arrancar la aplicación
await initializeHolidays();

export const api = new Elysia()
	.use(openapi())
	.onError(({ error, set }) => {
		if (WorkingDaysErrors.isWorkingDaysError(error)) {
			set.status = error.status;
			return {
				error: error.name,
				message: error.message,
			};
		}
	})
	.get(
		"/workdays",
		({ query }) => {
			const result = handleWorkdaysRequest(query);

			return result;
		},
		{
			detail: {
				summary: "Calculate working days and hours",
				description:
					"Calculates the resulting date after adding working days and/or hours to a given start date",
				tags: ["Working Days"],
			},
			error: ({ error, set }) => {
				// Manejo de errores personalizados de WorkingDays
				if (WorkingDaysErrors.isWorkingDaysError(error)) {
					set.status = error.status;
					return {
						error: error.name,
						message: error.message,
					};
				}

				set.status = 500;
				return {
					error: "InternalServerError",
					message: "An internal server error occurred",
				};
			},
			response: {
				200: t.Object({
					date: t.String({
						description: "The resulting date in UTC ISO format",
					}),
				}),
				400: t.Object({
					error: t.String({
						description: "Error type identifier",
					}),
					message: t.String({
						description: "Human-readable error message",
					}),
				}),
				500: t.Object({
					error: t.String(),
					message: t.String(),
				}),
			},
			query: t.Object(
				{
					days: t.Optional(
						t.String({
							description: "Number of working days to add",
							examples: ["5", "10"],
						}),
					),
					hours: t.Optional(
						t.String({
							description: "Number of working hours to add",
							examples: ["8", "16"],
						}),
					),
					date: t.Optional(
						t.String({
							description: "Start date in ISO 8601 format with Z suffix",
							examples: ["2023-12-01T10:00:00Z"],
						}),
					),
				},
				{
					description: "At least one of 'days' or 'hours' must be provided",
				},
			),
		},
	);

export default api;
