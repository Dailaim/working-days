import {
	colombiaTimeToUtc,
	formatToUtcIsoString,
	getCurrentColombiaTime,
	isValidIsoDate,
	parseUtcToColombiaTime,
} from "../shared/timezone-utils";
import type {
	ErrorResponse,
	SuccessResponse,
	WorkingDaysParams,
} from "../shared/types";
import { WorkingDaysErrors } from "./errors";
import { WorkingDaysCalculator } from "./service";

/**
 * Valida y parsea el parámetro de días
 */
function validateDays(days?: string): { value: number } {
	if (!days) return { value: 0 };

	const parsed = parseInt(days, 10);
	if (Number.isNaN(parsed) || parsed < 0) {
		throw new WorkingDaysErrors.invalidParameters(
			"Parameter 'days' must be a positive integer",
		);
	}
	return { value: parsed };
}

/**
 * Valida y parsea el parámetro de horas
 */
function validateHours(hours?: string): {
	value: number;
} {
	if (!hours) return { value: 0 };

	const parsed = parseInt(hours, 10);
	if (Number.isNaN(parsed) || parsed < 0) {
		throw new WorkingDaysErrors.invalidParameters(
			"Parameter 'hours' must be a positive integer",
		);
	}
	return { value: parsed };
}

/**
 * Valida y parsea el parámetro de fecha
 */
function validateDate(date?: string): { value: Date } {
	if (!date) {
		return { value: getCurrentColombiaTime() };
	}

	if (!isValidIsoDate(date)) {
		throw new WorkingDaysErrors.invalidParameters(
			"Parameter 'date' must be a valid ISO 8601 date with Z suffix",
		);
	}

	return { value: parseUtcToColombiaTime(date) };
}

/**
 * Valida todos los parámetros de entrada
 */
function validateParams(params: WorkingDaysParams) {
	const { days, hours, date } = params;

	// Al menos uno de days o hours debe estar presente
	if (!days && !hours) {
		throw new WorkingDaysErrors.invalidParameters(
			"At least one of 'days' or 'hours' parameters is required",
		);
	}

	// Validar cada parámetro
	const daysResult = validateDays(days);

	const hoursResult = validateHours(hours);

	const dateResult = validateDate(date);

	return {
		days: daysResult.value,
		hours: hoursResult.value,
		startDate: dateResult.value,
	};
}

/**
 * Calcula la fecha resultado basada en días y horas
 */
function calculateResultDate(
	calculator: WorkingDaysCalculator,
	days: number,
	hours: number,
): Date {
	if (days > 0 && hours > 0) {
		return calculator.addWorkingDaysAndHours(days, hours);
	}
	if (days > 0) {
		return calculator.addWorkingDays(days);
	}
	return calculator.addWorkingHours(hours);
}

/**
 * Maneja la lógica principal del endpoint
 */
export function handleWorkdaysRequest(
	params: WorkingDaysParams,
): SuccessResponse | ErrorResponse {
	const { days, hours, startDate } = validateParams(params);

	const calculator = new WorkingDaysCalculator(startDate);
	const resultDate = calculateResultDate(calculator, days, hours);
	const utcResult = colombiaTimeToUtc(resultDate);

	return {
		date: formatToUtcIsoString(utcResult),
	};
}
