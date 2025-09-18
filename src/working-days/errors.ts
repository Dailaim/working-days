export namespace WorkingDaysErrors {
	export const STATUS_CODES = [400, 422, 500];

	/**
	 * Clase base para todos los errores de WorkingDays
	 */
	export abstract class BaseWorkingDaysError extends Error {
		abstract status: number;

		constructor(message: string, name: string) {
			super(message);
			this.name = name;
		}
	}

	export class invalidParameters extends BaseWorkingDaysError {
		status = 400;

		constructor(message: string) {
			super(message, "InvalidParameters");
		}
	}

	export class validationError extends BaseWorkingDaysError {
		status = 422;

		constructor(message: string) {
			super(message, "ValidationError");
		}
	}

	export class internalServerError extends BaseWorkingDaysError {
		status = 500;

		constructor(message: string) {
			super(message, "InternalServerError");
		}
	}

	/**
	 * Verifica si un error es una instancia de cualquier error de WorkingDays
	 */
	export function isWorkingDaysError(
		error: unknown,
	): error is BaseWorkingDaysError {
		return error instanceof BaseWorkingDaysError;
	}
}
