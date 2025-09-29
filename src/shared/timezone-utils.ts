import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { COLOMBIA_TIMEZONE } from "./types";

export function utcToColombiaTime(date: Date): Date {
	return toZonedTime(date, COLOMBIA_TIMEZONE);
}

export function colombiaTimeToUtc(date: Date): Date {
	return fromZonedTime(date, COLOMBIA_TIMEZONE);
}

export function getCurrentColombiaTime(): Date {
	const now = new Date();
	return toZonedTime(now, COLOMBIA_TIMEZONE);
}

export function formatToUtcIsoString(date: Date): string {
	// Formatear sin milisegundos: remover .000 antes de Z
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function parseUtcToColombiaTime(isoString: string): Date {
	const utcDate = new Date(isoString);
	return utcToColombiaTime(utcDate);
}

export function isValidIsoDate(dateString: string): boolean {
	try {
		const date = new Date(dateString);
		return !Number.isNaN(date.getTime()) && dateString.endsWith("Z");
	} catch {
		return false;
	}
}
