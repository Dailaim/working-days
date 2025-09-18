# Working Days API

Una API para calcular días y horas laborales, considerando festivos colombianos y horarios de trabajo estándar.

🌐 **URL de la API:** <https://working-days-beta.vercel.app/>

## 📋 Características

- ✅ Cálculo de días y horas laborales
- ✅ Soporte para festivos colombianos
- ✅ Horario laboral configurable (9:00 AM - 6:00 PM)
- ✅ Zona horaria de Colombia (COT)
- ✅ API REST con documentación OpenAPI
- ✅ Tests automatizados

## 🚀 Inicio rápido

### Documentación de la API

La documentación completa de la API está disponible en:

```url
https://working-days-beta.vercel.app/openapi
```

### Endpoint principal

#### `/workdays`

Calcula la fecha resultante después de sumar días u horas laborales a una fecha base.

**Parámetros de consulta:**

- `date` (string): Fecha base en formato ISO 8601 (ej: `2025-01-15T14:30:00.000Z`)
- `days` (number, opcional): Número de días laborales a sumar
- `hours` (number, opcional): Número de horas laborales a sumar

**Ejemplo de uso:**

```bash
# Sumar 5 días laborales
curl "https://working-days-beta.vercel.app/workdays?date=2025-01-15T14:30:00.000Z&days=5"

# Sumar 8 horas laborales
curl "https://working-days-beta.vercel.app/workdays?date=2025-01-15T14:30:00.000Z&hours=8"
```

**Respuesta exitosa:**

```json
{
  "date": "2025-01-22T14:30:00.000Z",
  "businessDaysAdded": 5,
  "businessHoursAdded": 0
}
```

## 🏗️ Desarrollo

### Prerrequisitos

- [Bun](https://bun.sh/) >= 1.0

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Dailaim/working-days.git
cd working-days

# Instalar dependencias
bun install
```

### Scripts disponibles

```bash
# Ejecutar en modo desarrollo (con hot reload)
bun run dev

# Ejecutar tests
bun test

# Construir para producción
bun run build
```

### 🧪 Tests

El proyecto incluye una suite completa de tests que cubren:

- ✅ Validación de parámetros
- ✅ Cálculo de días laborales
- ✅ Cálculo de horas laborales
- ✅ Manejo de fines de semana
- ✅ Manejo de festivos colombianos
- ✅ Casos límite y edge cases

Para ejecutar los tests:

```bash
bun test
```

Los tests están ubicados en la carpeta `tests/` y utilizan Bun como test runner.

## 📅 Reglas de negocio

### Días laborales

- **Días válidos:** Lunes a Viernes
- **Días excluidos:** Sábados, domingos y festivos colombianos

### Horas laborales

- **Horario:** 8:00 AM - 7:00 PM (COT)
- **Zona horaria:** Colombia (UTC-5)
- **Comportamiento:** Si se añaden horas fuera del horario laboral, se ajustan al siguiente día laboral

### Festivos

- Se incluyen todos los festivos oficiales de Colombia
- Los festivos se cargan automáticamente desde `public/holidays.json`

## 🛠️ Tecnologías

- **Framework:** [Elysia](https://elysiajs.com/) con TypeScript
- **Runtime:** [Bun](https://bun.sh/)
- **Documentación:** OpenAPI/Swagger
- **Testing:** Bun Test
- **Deployment:** Vercel
- **Utilidades de fecha:** date-fns

## 📁 Estructura del proyecto

```text
├── src/
│   ├── index.ts              # Configuración principal de la API
│   ├── init.ts               # Punto de entrada para desarrollo
│   ├── holidays/             # Lógica de festivos
│   ├── working-days/         # Lógica principal de días laborales
│   └── shared/               # Tipos y utilidades compartidas
├── tests/
│   └── workdays.test.ts      # Tests de la API
├── public/
│   └── holidays.json         # Datos de festivos colombianos
└── package.json
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request


## 🔗 Enlaces útiles

- [API en vivo](https://working-days-beta.vercel.app/)
- [Documentación OpenAPI](https://working-days-beta.vercel.app/openapi)
- [Repositorio en GitHub](https://github.com/Dailaim/working-days)