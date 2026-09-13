# Acople futuro: OCR de fichas de pacientes

Idea a madurar despues de cerrar las fases del producto. No forma parte del alcance actual.

## Objetivo

Permitir sacar una foto de una hoja fisica de paciente y precargar datos en Clinia (nombre, apellido, CI, telefono, etc.), con revision humana antes de guardar.

## Arquitectura propuesta

```text
App Clinia (Expo)
   |
   |  foto / imagen
   v
Microservicio OCR (Python + FastAPI)
   |
   |  JSON estructurado
   v
API Clinia (Spring Boot)  -->  confirmacion en UI  -->  POST /api/patients
```

El OCR no vive dentro de Spring Boot ni de React Native. Se acopla como servicio aparte.

## Flujo sugerido

1. Usuario toma o elige una foto en la app.
2. La app envia la imagen al servicio OCR.
3. El OCR devuelve campos detectados + nivel de confianza.
4. Clinia muestra un formulario prellenado.
5. El usuario corrige y confirma.
6. Recien ahi se crea el paciente en la API.

## Stack tentativo (Python)

- FastAPI
- EasyOCR o Tesseract (hojas impresas)
- Opcional: Google Vision / Azure Form Recognizer si la calidad lo exige
- OpenCV para enderezado y contraste
- Pydantic para respuesta tipada

## Contrato de respuesta (borrador)

```json
{
  "firstName": "Maria",
  "lastName": "Gonzalez",
  "documentNumber": "1234567",
  "phone": "0981123456",
  "email": null,
  "birthDate": null,
  "address": null,
  "notes": null,
  "confidence": {
    "documentNumber": 0.92,
    "firstName": 0.81,
    "lastName": 0.77
  }
}
```

## Complejidad real

- Media para fichas impresas o semi-estructuradas.
- Alta si la letra es manuscrita o las fotos salen mal (luz, sombra, angulo).
- Siempre conviene confirmacion manual: el OCR asiste, no reemplaza.

## Riesgos

- Datos personales en imagenes (privacidad / retención).
- Falsos positivos en CI o telefono.
- Dependencia de calidad de camara y plantilla de la hoja.
- Costo si se usa OCR cloud.

## Decision diferida

Madurar esto recien despues de las fases 4-7. Prioridad actual: agenda, pagos, sesiones y reportes estables.
