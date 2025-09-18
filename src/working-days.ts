import {
	addDays,
	addMinutes,
	getDay,
	getHours,
	getMinutes,
	setHours,
	setMilliseconds,
	setMinutes,
	setSeconds,
} from "date-fns";
import { isHoliday } from "./holidays-service";
import { WORKING_DAYS, WORKING_HOURS } from "./types";

/**
 * Clase para manejar cálculos de días y horas laborales basada en una fecha específica
 */
export class WorkingDaysCalculator {
	private baseDate: Date;

	/**
	 * Constructor que recibe una fecha base para los cálculos
	 * @param baseDate Fecha base en hora de Colombia para realizar los cálculos
	 */
	constructor(baseDate: Date) {
		this.baseDate = new Date(baseDate);
	}

	/**
	 * Obtiene la fecha base actual
	 */
	public getBaseDate(): Date {
		return new Date(this.baseDate);
	}

	/**
	 * Actualiza la fecha base
	 */
	public setBaseDate(newBaseDate: Date): void {
		this.baseDate = new Date(newBaseDate);
	}
	/**
	 * Verifica si una fecha es un día laboral (lunes a viernes y no festivo)
	 */
	public isWorkingDay(date: Date): boolean {
		const dayOfWeek = getDay(date);
		return WORKING_DAYS.includes(dayOfWeek) && !isHoliday(date);
	}

	public isWorkingHour(date: Date): boolean {
		const hour = getHours(date);
		const minutes = getMinutes(date);
		const timeInMinutes = hour * 60 + minutes;

		const workStart = WORKING_HOURS.start * 60;
		const lunchStart = WORKING_HOURS.lunchStart * 60;
		const lunchEnd = WORKING_HOURS.lunchEnd * 60;
		const workEnd = WORKING_HOURS.end * 60;

		return (
			(timeInMinutes >= workStart && timeInMinutes < lunchStart) ||
			(timeInMinutes >= lunchEnd && timeInMinutes < workEnd)
		);
	}


	public isWorkingTime(date: Date): boolean {
		return this.isWorkingDay(date) && this.isWorkingHour(date);
	}

	private adjustToWorkingTimePreservingHour(date: Date): Date {
		let adjustedDate = new Date(date);

		while (!this.isWorkingDay(adjustedDate)) {
			adjustedDate = addDays(adjustedDate, -1);
		}

		const hour = getHours(adjustedDate);
		const minutes = getMinutes(adjustedDate);

		if (hour < WORKING_HOURS.start) {
			adjustedDate = addDays(adjustedDate, -1);
			while (!this.isWorkingDay(adjustedDate)) {
				adjustedDate = addDays(adjustedDate, -1);
			}
			adjustedDate = setHours(adjustedDate, WORKING_HOURS.end);
			adjustedDate = setMinutes(adjustedDate, 0);
		} else if (hour >= WORKING_HOURS.end) {
			adjustedDate = setHours(adjustedDate, WORKING_HOURS.end);
			adjustedDate = setMinutes(adjustedDate, 0);
		} else if (hour === WORKING_HOURS.lunchStart && minutes > 0) {
			adjustedDate = setHours(adjustedDate, WORKING_HOURS.lunchStart);
			adjustedDate = setMinutes(adjustedDate, 0);
		} else if (
			hour > WORKING_HOURS.lunchStart &&
			hour < WORKING_HOURS.lunchEnd
		) {
			adjustedDate = setHours(adjustedDate, WORKING_HOURS.lunchStart);
			adjustedDate = setMinutes(adjustedDate, 0);
		}

		adjustedDate = setSeconds(adjustedDate, 0);
		adjustedDate = setMilliseconds(adjustedDate, 0);

		return adjustedDate;
	}

	/**
	 * Calcula las horas laborales en un día
	 */
	public getWorkingHoursInDay(): number {
		const morningHours = WORKING_HOURS.lunchStart - WORKING_HOURS.start;
		const afternoonHours = WORKING_HOURS.end - WORKING_HOURS.lunchEnd;
		return morningHours + afternoonHours;
	}

	/**
	 * Encuentra el siguiente momento laboral válido
	 */
	private getNextWorkingMoment(date: Date): Date {
		let nextDate = new Date(date);
		let wasNonWorkingDay = false;

		while (!this.isWorkingDay(nextDate)) {
			nextDate = addDays(nextDate, 1);
			wasNonWorkingDay = true;
		}

		const hour = getHours(nextDate);

		if (wasNonWorkingDay) {
			nextDate = setHours(nextDate, WORKING_HOURS.start);
			nextDate = setMinutes(nextDate, 0);
		} else if (hour < WORKING_HOURS.start) {
			nextDate = setHours(nextDate, WORKING_HOURS.start);
			nextDate = setMinutes(nextDate, 0);
		} else if (
			hour >= WORKING_HOURS.lunchStart &&
			hour < WORKING_HOURS.lunchEnd
		) {
			nextDate = setHours(nextDate, WORKING_HOURS.lunchEnd);
			nextDate = setMinutes(nextDate, 0);
		} else if (hour >= WORKING_HOURS.end) {
			nextDate = addDays(nextDate, 1);
			while (!this.isWorkingDay(nextDate)) {
				nextDate = addDays(nextDate, 1);
			}
			nextDate = setHours(nextDate, WORKING_HOURS.start);
			nextDate = setMinutes(nextDate, 0);
		}

		nextDate = setSeconds(nextDate, 0);
		nextDate = setMilliseconds(nextDate, 0);

		return nextDate;
	}

	/**
	 * Suma días laborales a la fecha base
	 * @param daysToAdd Número de días laborales a sumar
	 * @returns Nueva fecha después de sumar los días laborales
	 */
	public addWorkingDays(daysToAdd: number): Date {
		if (daysToAdd === 0) return new Date(this.baseDate);

		let currentDate = this.adjustToWorkingTimePreservingHour(this.baseDate);
		let remainingDays = daysToAdd;

		while (remainingDays > 0) {
			currentDate = addDays(currentDate, 1);
			if (this.isWorkingDay(currentDate)) {
				remainingDays--;
			}
		}

		return currentDate;
	}

	/**
	 * Suma horas laborales a la fecha base
	 * @param hoursToAdd Número de horas laborales a sumar
	 * @returns Nueva fecha después de sumar las horas laborales
	 */
	public addWorkingHours(hoursToAdd: number): Date {
		if (hoursToAdd === 0) return new Date(this.baseDate);

		let currentDate = this.getNextWorkingMoment(this.baseDate);
		let remainingMinutes = hoursToAdd * 60;

		while (remainingMinutes > 0) {
			if (!this.isWorkingTime(currentDate)) {
				currentDate = this.getNextWorkingMoment(currentDate);
				continue;
			}

			const currentHour = getHours(currentDate);
			const currentMinute = getMinutes(currentDate);

			let minutesUntilBreak: number;

			if (currentHour < WORKING_HOURS.lunchStart) {
				minutesUntilBreak =
					WORKING_HOURS.lunchStart * 60 - (currentHour * 60 + currentMinute);
			} else {
				minutesUntilBreak =
					WORKING_HOURS.end * 60 - (currentHour * 60 + currentMinute);
			}

			if (remainingMinutes <= minutesUntilBreak) {
				currentDate = addMinutes(currentDate, remainingMinutes);
				remainingMinutes = 0;
			} else {
				remainingMinutes -= minutesUntilBreak;
				currentDate = addMinutes(currentDate, minutesUntilBreak);
				currentDate = this.getNextWorkingMoment(currentDate);
				currentDate = this.getNextWorkingMoment(currentDate);
			}
		}

		return currentDate;
	}

	/**
	 * Suma días y horas laborales a la fecha base
	 * @param daysToAdd Número de días laborales a sumar
	 * @param hoursToAdd Número de horas laborales a sumar
	 * @returns Nueva fecha después de sumar días y horas laborales
	 */
	public addWorkingDaysAndHours(daysToAdd: number, hoursToAdd: number): Date {
		const resultDate = this.addWorkingDays(daysToAdd);
		const tempCalculator = new WorkingDaysCalculator(resultDate);
		return tempCalculator.addWorkingHours(hoursToAdd);
	}

	/**
	 * Suma días laborales a una fecha específica (método estático)
	 */
	public addDays(startDate: Date, daysToAdd: number): Date {
		if (daysToAdd === 0) return new Date(startDate);

		let currentDate = this.adjustToWorkingTimePreservingHour(startDate);
		let remainingDays = daysToAdd;

		while (remainingDays > 0) {
			currentDate = addDays(currentDate, 1);
			if (this.isWorkingDay(currentDate)) {
				remainingDays--;
			}
		}

		return currentDate;
	}

	/**
	 * Suma días laborales a una fecha específica (método de utilidad)
	 */
	public addDaysToDate(startDate: Date, daysToAdd: number): Date {
		if (daysToAdd === 0) return new Date(startDate);

		let currentDate = this.adjustToWorkingTimePreservingHour(startDate);
		let remainingDays = daysToAdd;

		while (remainingDays > 0) {
			currentDate = addDays(currentDate, 1);
			if (this.isWorkingDay(currentDate)) {
				remainingDays--;
			}
		}

		return currentDate;
	}

	/**
	 * Suma horas laborales a una fecha específica (método de utilidad)
	 */
	public addHoursToDate(startDate: Date, hoursToAdd: number): Date {
		if (hoursToAdd === 0) return new Date(startDate);

		let currentDate = this.getNextWorkingMoment(startDate);
		let remainingMinutes = hoursToAdd * 60;

		while (remainingMinutes > 0) {
			if (!this.isWorkingTime(currentDate)) {
				currentDate = this.getNextWorkingMoment(currentDate);
				continue;
			}

			const currentHour = getHours(currentDate);
			const currentMinute = getMinutes(currentDate);

			let minutesUntilBreak: number;

			if (currentHour < WORKING_HOURS.lunchStart) {
				minutesUntilBreak =
					WORKING_HOURS.lunchStart * 60 - (currentHour * 60 + currentMinute);
			} else {
				minutesUntilBreak =
					WORKING_HOURS.end * 60 - (currentHour * 60 + currentMinute);
			}

			if (remainingMinutes <= minutesUntilBreak) {
				currentDate = addMinutes(currentDate, remainingMinutes);
				remainingMinutes = 0;
			} else {
				remainingMinutes -= minutesUntilBreak;
				currentDate = addMinutes(currentDate, minutesUntilBreak);
				currentDate = this.getNextWorkingMoment(currentDate);
				currentDate = this.getNextWorkingMoment(currentDate);
			}
		}

		return currentDate;
	}
}
