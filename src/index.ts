import { Elysia, t } from "elysia";
import { initializeHolidays } from "./holidays-service";
import {
	colombiaTimeToUtc,
	formatToUtcIsoString,
	getCurrentColombiaTime,
	isValidIsoDate,
	parseUtcToColombiaTime,
} from "./timezone-utils";
import { WorkingDaysCalculator } from "./working-days";

// Inicializar días festivos al arrancar la aplicación
await initializeHolidays();

export const api = new Elysia().get(
	"/workdays",
	({ query, status }) => {
		try {
			const { days, hours, date } = query;

			if (!days && !hours) {
				return status(400, {
					error: "InvalidParameters",
					message: "At least one of 'days' or 'hours' parameters is required",
				});
			}

			let daysToAdd = 0;
			if (days) {
				const parsedDays = parseInt(days, 10);
				if (Number.isNaN(parsedDays) || parsedDays < 0) {
					return status(400, {
						error: "InvalidParameters",
						message: "Parameter 'days' must be a positive integer",
					});
				}
				daysToAdd = parsedDays;
			}

			let hoursToAdd = 0;
			if (hours) {
				const parsedHours = parseInt(hours, 10);
				if (Number.isNaN(parsedHours) || parsedHours < 0) {
					return status(400, {
						error: "InvalidParameters",
						message: "Parameter 'hours' must be a positive integer",
					});
				}
				hoursToAdd = parsedHours;
			}

			let startDate: Date;
			if (date) {
				if (!isValidIsoDate(date)) {
					return status(400, {
						error: "InvalidParameters",
						message:
							"Parameter 'date' must be a valid ISO 8601 date with Z suffix",
					});
				}
				startDate = parseUtcToColombiaTime(date);
			} else {
				startDate = getCurrentColombiaTime();
			}

			const calculator = new WorkingDaysCalculator(startDate);

			let resultDate: Date;

			if (daysToAdd > 0 && hoursToAdd > 0) {
				resultDate = calculator.addWorkingDaysAndHours(daysToAdd, hoursToAdd);
			} else if (daysToAdd > 0) {
				resultDate = calculator.addWorkingDays(daysToAdd);
			} else {
				resultDate = calculator.addWorkingHours(hoursToAdd);
			}

			const utcResult = colombiaTimeToUtc(resultDate);

			return {
				date: formatToUtcIsoString(utcResult),
			};
		} catch (error) {
			console.error("Error processing request:", error);
			return status(500, {
				error: "InternalServerError",
				message: "An internal server error occurred",
			});
		}
	},
	{
		response: {
			200: t.Object({
				date: t.String(),
			}),
			400: t.Object({
				error: t.String(),
				message: t.String(),
			}),
			422: t.Object({
				error: t.String(),
				message: t.String(),
			}),
			500: t.Object({
				error: t.String(),
				message: t.String(),
			}),
		},

		query: t.Partial(
			t.Object({
				days: t.String(),
				hours: t.String(),
				date: t.String(),
			}),
		),
	},
);

export default api;
