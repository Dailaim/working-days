import { describe, expect, it } from "bun:test";
import { api } from "../src";

const BASE_URL = "http://localhost/workdays";

describe("API /workdays", () => {
	it("debe retornar 400 si no se pasan parámetros", async () => {
		const res = await api.handle(new Request(BASE_URL));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body).toEqual({
			error: "InvalidParameters",
			message: expect.any(String),
		});
	});

	it("debe sumar 1 hora desde un viernes a las 17:00 → lunes 9:00 a.m.", async () => {
		const testDate = "2025-08-16T22:00:00.000Z";
		const url = `${BASE_URL}?hours=1&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toHaveProperty("date");
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-19T14:00:00.000Z");
	});

	it("debe saltar fin de semana si la fecha es sábado → lunes 9:00 a.m.", async () => {
		const testDate = "2025-08-17T19:00:00.000Z";
		const url = `${BASE_URL}?hours=1&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-19T14:00:00.000Z");
	});

	it("debe sumar 1 día y 4 horas → jueves 9:00 a.m.", async () => {
		const testDate = "2025-08-19T20:00:00.000Z";
		const url = `${BASE_URL}?days=1&hours=4&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-21T15:00:00.000Z");
	});

	it("debe sumar 1 día desde domingo → lunes 5:00 p.m.", async () => {
		const testDate = "2025-08-18T23:00:00.000Z";
		const url = `${BASE_URL}?days=1&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-19T22:00:00.000Z");
	});

	it("debe sumar 8 horas desde 8:00 a.m. → mismo día 5:00 p.m.", async () => {
		const testDate = "2025-08-20T13:00:00.000Z";
		const url = `${BASE_URL}?hours=8&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-20T22:00:00.000Z");
	});

	it("debe sumar 1 día desde 8:00 a.m. → siguiente día laboral 8:00 a.m.", async () => {
		const testDate = "2025-08-20T13:00:00.000Z";
		const url = `${BASE_URL}?days=1&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-21T13:00:00.000Z");
	});

	it("debe sumar 1 día desde 12:30 p.m. → siguiente día laboral 12:00 p.m.", async () => {
		const testDate = "2025-08-20T17:30:00.000Z";
		const url = `${BASE_URL}?days=1&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-21T17:00:00.000Z");
	});

	it("debe sumar 3 horas desde 11:30 a.m. → mismo día 3:30 p.m.", async () => {
		const testDate = "2025-08-20T16:30:00.000Z";
		const url = `${BASE_URL}?hours=3&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-08-20T20:30:00.000Z");
	});

	it("debe manejar festivos correctamente: 5 días + 4 horas desde 10 abril → 21 abril 3:00 p.m.", async () => {
		const testDate = "2025-04-10T15:00:00.000Z";
		const url = `${BASE_URL}?days=5&hours=4&date=${encodeURIComponent(testDate)}`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.date).toMatch(/Z$/);
		expect(body.date).toBe("2025-04-21T20:00:00.000Z");
	});

	it("debe devolver error si days es negativo", async () => {
		const url = `${BASE_URL}?days=-1`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body).toEqual({
			error: "InvalidParameters",
			message: expect.any(String),
		});
	});

	it("debe devolver error si date no es ISO válido", async () => {
		const url = `${BASE_URL}?hours=1&date=fecha-invalida`;
		const res = await api.handle(new Request(url));
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toBe("InvalidParameters");
	});
});
