# Preparacion para Railway (sin desplegar todavia)

Usar solo cuando la prueba local con WiFi este estable y aprobada.

## Servicios previstos

1. PostgreSQL en Railway
2. Backend Spring Boot en Railway
3. Mobile Expo apuntando a la URL publica de la API

## Variables del backend

```text
PORT=8080
SERVER_ADDRESS=0.0.0.0
DB_URL=jdbc:postgresql://HOST:PORT/DATABASE
DB_USERNAME=...
DB_PASSWORD=...
DDL_AUTO=update
OWNER_COMMISSION_PERCENTAGE=40
CORS_ALLOWED_ORIGINS=*
```

Notas:

- Railway inyecta `PORT`; la app ya lo lee.
- Preferir `DB_URL` en formato JDBC.
- No subir secretos al repo.

## Build sugerido

```powershell
cd backend
mvn -DskipTests package
```

Imagen: `backend/Dockerfile`

Opcional local con Docker Compose:

```powershell
$env:DB_PASSWORD="tu_password"
docker compose up --build
```

## Mobile en produccion

```text
EXPO_PUBLIC_API_URL=https://TU-SERVICIO.up.railway.app
```

## Pendiente al momento de migrar

- Crear proyecto Railway
- Provisionar PostgreSQL
- Configurar variables
- Desplegar jar/imagen
- Probar health y un flujo completo (paciente -> cita -> pago -> reporte)
- Recien ahi publicar build Expo/EAS si hace falta
