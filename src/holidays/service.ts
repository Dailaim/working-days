/**
 * Servicio para manejar días festivos colombianos
 */

let holidaysCache: Set<string> | null = null;

/**
 * Obtiene los días festivos desde la API de Capta
 */
export async function fetchHolidays(): Promise<string[]> {
	try {
		const response = await fetch(
			"https://content.capta.co/Recruitment/WorkingDays.json",
		);
		if (!response.ok) {
			throw new Error(`Failed to fetch holidays: ${response.status}`);
		}
		const holidays: string[] = await response.json();
		return holidays;
	} catch (error) {
		console.error("Error fetching holidays:", error);
		// Fallback con algunos días festivos conocidos de 2025
		return [
			"2025-01-01",
			"2025-01-06",
			"2025-03-24",
			"2025-04-17",
			"2025-04-18",
			"2025-05-01",
			"2025-06-02",
			"2025-06-23",
			"2025-06-30",
			"2025-08-07",
			"2025-08-18",
			"2025-10-13",
			"2025-11-03",
			"2025-11-17",
			"2025-12-08",
			"2025-12-25",
		];
	}
}

/**
 * Inicializa el cache de días festivos
 */
export async function initializeHolidays(): Promise<void> {
	if (holidaysCache === null) {
		const holidays = await fetchHolidays();
		holidaysCache = new Set(holidays);
	}
}

/**
 * Verifica si una fecha es día festivo
 */
export function isHoliday(date: Date): boolean {
	if (holidaysCache === null) {
		throw new Error(
			"Holidays not initialized. Call initializeHolidays() first.",
		);
	}

	const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
	return holidaysCache.has(dateString);
}

/**
 * Obtiene el conjunto de días festivos (para testing o debugging)
 */
export function getHolidaysSet(): Set<string> | null {
	return holidaysCache;
}
