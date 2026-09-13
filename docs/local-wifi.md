# Prueba local con telefono en la misma WiFi

## Objetivo

Usar la notebook como servidor (API + PostgreSQL) y el telefono con Expo Go en la misma red WiFi.

## 1. Backend escuchando en la red

Clinia ya arranca en `0.0.0.0:8080` por defecto.

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "local"
cd backend
mvn spring-boot:run
```

Verifica en la notebook:

```text
http://localhost:8080/api/health
```

## 2. Obtener la IP local de la notebook

```powershell
ipconfig
```

Busca IPv4 de tu WiFi, por ejemplo:

```text
192.168.1.42
```

## 3. Configurar el mobile

En `mobile/.env` (no se sube a Git):

```text
EXPO_PUBLIC_API_URL=http://192.168.1.42:8080
```

Luego:

```powershell
$env:Path="C:\Users\tadeo.ramirez\Downloads\node-v24.16.0-win-x64\node-v24.16.0-win-x64;$env:Path"
cd mobile
npx expo start
```

Escanea el QR con Expo Go.

## 4. Firewall de Windows

Si el telefono no conecta, permite el puerto 8080 en la red privada o crea una regla de entrada TCP 8080.

## 5. Checklist rapido

- Notebook y telefono en la misma WiFi (no datos moviles)
- PostgreSQL local con base `clinia`
- API UP en `/api/health`
- `EXPO_PUBLIC_API_URL` con IP de la notebook
- Reiniciar Expo despues de cambiar `.env`

## 6. Railway (despues)

Cuando estes satisfecho con local, usaremos las variables documentadas en `docs/railway-prep.md`.
No desplegar hasta validar el flujo completo en WiFi.
