# Clinia

Aplicacion movil y API para gestion de pacientes, servicios, agenda, pagos y reportes de un negocio de depilacion y estetica.

## Licencia

GNU Affero General Public License v3.0 (AGPL-3.0). Ver [LICENSE](./LICENSE).

## Monorepo

- `backend/` — Spring Boot 3 + Java 21 + PostgreSQL
- `mobile/` — Expo + React Native + TypeScript + Expo Router

## Requisitos locales

- JDK 21
- Maven 3.9+
- Node.js 20.19+ / 24 LTS
- PostgreSQL con base `clinia`

Variables de entorno del backend (ver `backend/.env.example`):

```text
DB_URL=jdbc:postgresql://localhost:5432/clinia
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
OWNER_COMMISSION_PERCENTAGE=40
```

Variable del mobile:

```text
EXPO_PUBLIC_API_URL=http://localhost:8080
```

En un telefono fisico usa la IP local de tu PC, no `localhost`.

## Backend

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:DB_PASSWORD = "tu_password_local"
cd backend
mvn spring-boot:run
```

Health check: `http://localhost:8080/api/health`

## Mobile

```powershell
$env:Path="C:\Users\tadeo.ramirez\Downloads\node-v24.16.0-win-x64\node-v24.16.0-win-x64;$env:Path"
cd mobile
npx expo start
```

## Fases

1. Base (estructura, entidades, health, shell mobile) — en progreso
2. Pacientes y servicios
3. Agenda y citas
4. Promociones y pagos
5. Paquetes y sesiones
6. Dashboard y reportes
7. PDF, pulido y Railway
