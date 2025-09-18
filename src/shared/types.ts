/**
 * Tipos e interfaces para la API de fechas hábiles
 */

// Parámetros de entrada de la API
export interface WorkingDaysParams {
	days?: string;
	hours?: string;
	date?: string;
}

// Respuesta exitosa de la API
export interface SuccessResponse {
	date: string;
}

// Respuesta de error de la API
export interface ErrorResponse {
	error: string;
	message: string;
}

// Configuración de horarios laborales
export interface WorkingHours {
	start: number; // Hora de inicio (8)
	end: number; // Hora de fin (17)
	lunchStart: number; // Inicio del almuerzo (12)
	lunchEnd: number; // Fin del almuerzo (13)
}

// Días de la semana como números (0 = domingo, 1 = lunes, etc.)
export enum WeekDay {
	SUNDAY = 0,
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
}

// Constantes de configuración
export const COLOMBIA_TIMEZONE = "America/Bogota";
export const WORKING_HOURS: WorkingHours = {
	start: 8,
	end: 17,
	lunchStart: 12,
	lunchEnd: 13,
};

// Días laborales (lunes a viernes)
export const WORKING_DAYS = [
	WeekDay.MONDAY,
	WeekDay.TUESDAY,
	WeekDay.WEDNESDAY,
	WeekDay.THURSDAY,
	WeekDay.FRIDAY,
];

// Parámetros validados de entrada
export interface ValidatedParams {
	days: number;
	hours: number;
	startDate: Date;
}
