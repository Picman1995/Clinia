# Proyecto: Sistema de Gestión de Pacientes para Depilación y Estética

Quiero desarrollar una aplicación móvil para gestionar pacientes, servicios, reservas, pagos, sesiones e información financiera de un negocio de **depilación y estética**.

La aplicación inicialmente será de uso interno. No tendrá un sistema de login propio para los usuarios finales, ya que en la primera versión será utilizada únicamente por el propietario y las secretarias/profesionales autorizadas físicamente.

El proyecto debe diseñarse desde el comienzo con una arquitectura preparada para crecer posteriormente.

---

# 1. Stack tecnológico

## Frontend

Utilizar:

* React Native
* Expo
* TypeScript
* Expo Router
* Componentes modernos y reutilizables
* Diseño responsive para teléfonos
* Modo claro
* Modo oscuro
* Persistencia local de preferencias cuando corresponda

La interfaz debe tener aspecto de aplicación profesional de gestión de pacientes, evitando un diseño genérico o excesivamente básico.

Debe priorizar:

* facilidad de uso
* rapidez para registrar pacientes
* pocos pasos para crear una reserva
* visualización clara de horarios
* historial de sesiones
* información financiera fácil de interpretar

## Backend

Utilizar:

* Java 17+
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* PostgreSQL
* Bean Validation
* Maven

La API debe desarrollarse siguiendo una arquitectura limpia y organizada.

Separar como mínimo:

* Controller
* Service
* Repository
* Entity
* DTO
* Mapper cuando sea necesario
* Exception handling
* Configuration

No colocar lógica de negocio importante directamente en los Controllers.

---

# 2. Base de datos

Utilizar PostgreSQL.

Durante el desarrollo inicial trabajaré con una base de datos PostgreSQL local.

Quiero que Hibernate/JPA permita crear inicialmente las tablas necesarias durante el primer despliegue.

Sin embargo, el proyecto debe quedar preparado para posteriormente utilizar migraciones mediante Flyway o Liquibase.

No quiero depender indefinidamente de `ddl-auto=create` o `create-drop`.

La configuración debe estar preparada mediante variables de entorno:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
```

No almacenar credenciales reales en Git.

Crear también un `.env.example` o archivo de ejemplo con las variables necesarias.

---

# 3. Concepto principal del sistema

La aplicación administrará pacientes que pueden contratar diferentes servicios:

## Depilación

Cada zona del cuerpo tendrá un precio configurable.

Ejemplos:

* Axilas
* Piernas
* Brazos
* Espalda
* Pecho
* Abdomen
* Ingle
* Rostro
* Zona íntima
* Cuerpo completo
* etc.

Los precios deben ser configurables y almacenarse en guaraníes paraguayos (PYG).

No asumir que todos los servicios tienen precio fijo para siempre.

El administrador debe poder modificar precios para nuevos servicios.

---

# 4. Promociones

El sistema debe soportar promociones.

Ejemplos:

* 2x1
* combos
* precio promocional
* descuento porcentual
* precio fijo promocional

Una promoción puede tener:

* nombre
* descripción
* servicios incluidos
* precio normal
* precio promocional
* fecha de inicio
* fecha de finalización
* estado activo/inactivo

Ejemplo:

```text
Promoción:
Depilación Axilas + Piernas

Precio normal:
200.000 Gs.

Precio promoción:
150.000 Gs.
```

El sistema debe registrar el precio aplicado en el momento de la venta/reserva.

IMPORTANTE:

Si posteriormente cambia el precio de un servicio, los registros históricos no deben cambiar.

El precio utilizado en una atención debe quedar guardado como snapshot histórico.

---

# 5. Servicios de estética

Además de depilación, existirán servicios de estética.

Ejemplos:

* Masaje cuerpo completo
* Masaje relajante
* Masaje descontracturante
* Masaje localizado
* Otros servicios que posteriormente se puedan agregar

Cada servicio debe tener:

* nombre
* descripción
* categoría
* duración estimada
* precio
* estado activo/inactivo

Los precios estarán expresados en guaraníes.

Ejemplo:

```text
Masaje cuerpo completo
Precio: 180.000 Gs.
Duración: configurable
```

---

# 6. Pacientes

Crear módulo de pacientes.

Datos iniciales:

* nombre
* apellido
* documento/CI
* teléfono
* email opcional
* fecha de nacimiento opcional
* dirección opcional
* observaciones
* fecha de registro
* estado activo/inactivo

Debe ser posible:

* crear paciente
* editar paciente
* buscar paciente
* visualizar paciente
* ver historial completo
* ver servicios realizados
* ver sesiones
* ver pagos
* ver reservas futuras
* ver saldo pendiente

La búsqueda debe ser rápida por:

* nombre
* apellido
* CI
* teléfono

---

# 7. Reserva / agenda

Los pacientes solicitarán una atención con una secretaria o conmigo.

Al crear una reserva se debe seleccionar:

1. Paciente
2. Servicio o servicios
3. Fecha
4. Hora
5. Seña
6. Observaciones

El sistema debe calcular automáticamente la duración aproximada dependiendo del servicio seleccionado.

Ejemplo:

```text
Paciente:
Juan Pérez

Servicio:
Masaje cuerpo completo

Precio:
180.000 Gs.

Duración:
60 minutos

Seña:
50.000 Gs.

Saldo:
130.000 Gs.
```

---

# 8. Depilaciones con varias zonas

Un paciente puede contratar varias zonas en una misma atención.

Ejemplo:

```text
Paciente:
María González

Atención:

Axilas             50.000 Gs.
Piernas            120.000 Gs.
Brazos             80.000 Gs.
------------------------------
Total              250.000 Gs.
```

También puede utilizar una promoción:

```text
Promo 2x1
Axilas + Piernas

Precio promocional:
150.000 Gs.
```

La reserva debe permitir seleccionar múltiples servicios/zones y calcular:

* duración total
* precio total
* descuento/promoción
* seña
* saldo pendiente

---

# 9. Señas y pagos

Registrar las señas realizadas por los pacientes.

Una reserva/atención puede tener:

* precio total
* descuento
* total final
* monto de seña
* saldo pendiente
* estado de pago

Estados posibles:

```text
PENDIENTE
SEÑA_PAGADA
PAGADO
PAGO_PARCIAL
CANCELADO
```

Posteriormente debe ser posible registrar pagos adicionales.

No asumir que una atención solamente puede tener un pago.

Un paciente podría:

```text
Servicio: 300.000 Gs.

Seña:
100.000 Gs.

Segundo pago:
100.000 Gs.

Pago final:
100.000 Gs.

Total:
300.000 Gs.
```

---

# 10. Historial de sesiones

Esta funcionalidad es MUY importante.

Un paciente puede pagar por varias sesiones.

Ejemplo:

```text
Paciente:
Ana López

Tratamiento:
Depilación

Sesiones contratadas:
6

Sesiones realizadas:
3

Sesiones pendientes:
3
```

El sistema debe permitir crear un paquete/tratamiento de varias sesiones.

Por ejemplo:

```text
Paquete:
Depilación piernas

Sesiones:
6

Precio:
600.000 Gs.
```

Cada vez que el paciente asiste se debe registrar una sesión.

Historial:

```text
Sesión 1
Fecha: 01/09/2026
Estado: Realizada

Sesión 2
Fecha: 08/09/2026
Estado: Realizada

Sesión 3
Fecha: 15/09/2026
Estado: Realizada

Sesión 4
Pendiente

Sesión 5
Pendiente

Sesión 6
Pendiente
```

Debe poder visualizarse claramente:

* sesiones contratadas
* sesiones realizadas
* sesiones restantes
* fechas
* servicio/tratamiento
* observaciones

Evitar que una sesión realizada pueda contabilizarse accidentalmente dos veces.

---

# 11. Agenda

Crear una pantalla de agenda.

Debe mostrar:

* día
* semana
* reservas
* horario
* paciente
* servicio
* duración
* estado

Ejemplo:

```text
09:00 — María González
        Depilación cuerpo completo
        300.000 Gs.

10:30 — Laura Fernández
        Masaje cuerpo completo
        180.000 Gs.

12:00 — Ana López
        Depilación piernas
        Sesión 3/6
```

Los horarios deben considerar la duración de los servicios.

Evitar permitir reservas superpuestas.

---

# 12. Estados de las citas

Una reserva puede tener estados:

```text
PENDIENTE
CONFIRMADA
ATENDIDA
CANCELADA
NO_ASISTIO
```

Al marcar una cita como `ATENDIDA`, debe poder registrarse la atención y, cuando corresponda, consumir una sesión del paquete contratado.

---

# 13. Profesionales

Aunque inicialmente el sistema será utilizado por pocas personas, diseñar el modelo pensando en que posteriormente pueda haber varios profesionales.

Una atención podría estar asociada a:

* profesional
* servicio
* paciente

No implementar un sistema complejo de usuarios todavía si no es necesario.

Dejar la arquitectura preparada para agregarlo posteriormente.

---

# 14. Reportes

Crear un módulo de reportes.

Debe permitir seleccionar:

```text
Fecha desde
Fecha hasta
```

y generar información sobre:

* cantidad de pacientes atendidos
* cantidad de servicios realizados
* ingresos
* señas
* pagos recibidos
* saldos pendientes
* servicios de depilación
* servicios de estética
* promociones aplicadas

---

# 15. Reporte financiero

Necesito especialmente dos cálculos diferentes.

## Ganancia neta / ingresos del negocio

Mostrar el total generado por servicios durante un período.

Ejemplo:

```text
Período:
01/09/2026 - 30/09/2026

Depilación:
5.000.000 Gs.

Estética:
3.000.000 Gs.

Total:
8.000.000 Gs.
```

---

# 16. Ganancia del propietario

Mi participación/ganancia será del **40% del total de los servicios**.

Ejemplo:

```text
Total servicios:
8.000.000 Gs.

Porcentaje propietario:
40%

Ganancia propietario:
3.200.000 Gs.
```

El porcentaje NO debe estar hardcodeado directamente en múltiples partes del sistema.

Crear una configuración o parámetro:

```text
OWNER_COMMISSION_PERCENTAGE=40
```

De esta forma posteriormente puede modificarse.

El reporte debe mostrar claramente:

```text
Total servicios
40% propietario
Ganancia propietario
60% restante
```

El cálculo debe utilizar el valor final realmente cobrado por los servicios, teniendo en cuenta promociones/descuentos según las reglas del negocio.

---

# 17. Reportes combinados

Debe existir un reporte general que combine:

```text
DEPILACIÓN
+
ESTÉTICA
```

No quiero tener que generar reportes separados obligatoriamente.

Ejemplo:

```text
REPORTE MENSUAL

Período:
01/09/2026 - 30/09/2026

Pacientes atendidos:
72

Servicios realizados:
94

Ingresos por depilación:
5.500.000 Gs.

Ingresos por estética:
3.200.000 Gs.

TOTAL:
8.700.000 Gs.

PARTICIPACIÓN PROPIETARIO (40%):
3.480.000 Gs.
```

---

# 18. Exportación / impresión

Los reportes deben poder prepararse para:

* visualizar en pantalla
* imprimir
* posteriormente exportar a PDF

El PDF puede implementarse en una segunda etapa.

Primero priorizar que los datos y cálculos sean correctos.

---

# 19. Dashboard

Crear un Dashboard inicial.

Debe mostrar información como:

```text
Pacientes de hoy
Citas de hoy
Ingresos del día
Servicios realizados
Señas pendientes
Saldo pendiente
```

También mostrar estadísticas del período seleccionado.

Evitar sobrecargar el Dashboard.

Debe ser visual, limpio y fácil de entender desde un teléfono.

---

# 20. Pantallas principales de React Native

Crear inicialmente:

### Dashboard

Resumen general.

### Pacientes

Lista y búsqueda.

### Nuevo paciente

Formulario.

### Detalle del paciente

Información + historial + sesiones + pagos + próximas citas.

### Agenda

Calendario y citas.

### Nueva reserva

Selección de paciente + servicios + fecha + horario + seña.

### Servicios

Servicios de depilación y estética.

### Promociones

Promociones y precios especiales.

### Sesiones

Control de paquetes y sesiones realizadas.

### Pagos

Registro de pagos.

### Reportes

Filtros por fecha y resultados.

### Configuración

Configuraciones generales, incluyendo porcentaje del propietario.

---

# 21. Diseño UI/UX

La aplicación debe tener un diseño moderno y profesional.

No quiero una interfaz que parezca una aplicación administrativa antigua.

Características:

* modo oscuro
* modo claro
* tipografía clara
* tarjetas
* botones grandes para acciones frecuentes
* buena separación visual
* iconografía consistente
* estados mediante badges
* formularios simples
* navegación intuitiva
* excelente experiencia en teléfonos

El tema debe poder cambiarse desde Configuración.

Guardar la preferencia localmente.

---

# 22. Arquitectura de API

Crear una API REST.

Ejemplos:

```text
/api/patients
/api/services
/api/promotions
/api/appointments
/api/payments
/api/treatment-packages
/api/sessions
/api/reports
/api/settings
```

Utilizar DTOs para entrada y salida.

No exponer directamente las entidades JPA como respuesta de todos los endpoints.

Agregar validaciones.

Ejemplo:

```text
POST /api/patients
POST /api/appointments
POST /api/payments
POST /api/treatment-packages
POST /api/sessions
```

---

# 23. Manejo de errores

Implementar manejo global de excepciones con:

```text
@RestControllerAdvice
```

La API debe devolver respuestas consistentes.

Ejemplo:

```json
{
  "timestamp": "...",
  "status": 400,
  "message": "El paciente es obligatorio",
  "path": "/api/appointments"
}
```

---

# 24. Auditoría e historial

Los datos financieros e históricos son importantes.

Evitar eliminar físicamente registros críticos.

Por ejemplo, una atención histórica no debería desaparecer simplemente porque se eliminó el servicio actual.

Usar estados como:

```text
ACTIVO
INACTIVO
```

cuando corresponda.

Los registros históricos deben conservar:

* precio aplicado
* descuento
* promoción aplicada
* fecha
* paciente
* servicio
* profesional
* pagos

---

# 25. Fechas y moneda

La aplicación está orientada inicialmente a Paraguay.

Moneda:

```text
PYG
Guaraníes
```

No utilizar números de punto flotante para dinero.

En Java utilizar:

```java
BigDecimal
```

para valores monetarios.

Definir correctamente la zona horaria para Paraguay.

Las fechas y horarios deben manejarse de manera consistente entre React Native, API y PostgreSQL.

---

# 26. Seguridad futura

Aunque la primera versión NO tendrá login propio, la arquitectura debe quedar preparada para incorporar posteriormente:

* usuarios
* roles
* administrador
* secretaria
* profesional

No implementar una solución de autenticación compleja todavía.

Importante:

No guardar credenciales de Expo, Google, PostgreSQL ni tokens en el repositorio.

Utilizar variables de entorno.

---

# 27. Expo / desarrollo

El frontend será desarrollado utilizando Expo y React Native.

El proyecto debe quedar preparado para ejecutarse localmente mediante el flujo habitual de Expo.

No colocar credenciales personales dentro del código fuente.

Si se requiere autenticación para herramientas de Expo/EAS, utilizar el mecanismo oficial de autenticación de Expo y variables/configuración local.

La cuenta de Expo se configurará fuera del código fuente.

---

# 28. Entorno local

Inicialmente:

```text
React Native / Expo
        ↓
Spring Boot
        ↓
PostgreSQL local
```

Ejemplo:

```text
Expo:
http://localhost / IP local según dispositivo

Spring Boot:
http://localhost:8080

PostgreSQL:
localhost:5432
```

Recordar que cuando se pruebe desde un teléfono físico, `localhost` del teléfono NO apunta a la computadora. Utilizar la IP local de la computadora cuando sea necesario.

---

# 29. Futuro despliegue en Railway

Posteriormente quiero desplegar:

```text
React Native / Expo
        ↓
Spring Boot API
        ↓
PostgreSQL Railway
```

El backend debe quedar preparado para Railway.

No asumir rutas absolutas del sistema local.

Toda configuración dependiente del ambiente debe utilizar variables de entorno.

---

# 30. Docker

Aunque inicialmente puedo ejecutar Spring Boot y PostgreSQL localmente sin Docker, dejar preparado el proyecto para incorporar Docker posteriormente.

Sería conveniente poder tener:

```text
backend
postgres
```

como servicios separados.

No complicar la primera versión innecesariamente.

---

# 31. Reglas importantes del negocio

Implementar estas reglas:

1. Un paciente puede tener muchas citas.
2. Una cita pertenece a un paciente.
3. Una cita puede contener uno o varios servicios.
4. Un servicio puede ser de DEPILACION o ESTETICA.
5. Una depilación puede contener varias zonas.
6. Cada zona puede tener su precio.
7. Las promociones pueden modificar el precio final.
8. El precio histórico debe conservarse.
9. Una cita puede tener uno o varios pagos.
10. Un paciente puede tener múltiples paquetes/tratamientos.
11. Un paquete puede tener múltiples sesiones.
12. Cada sesión realizada debe quedar registrada.
13. No permitir consumir más sesiones de las contratadas.
14. Una cita no debe poder solaparse con otra cuando se trate del mismo profesional/recurso.
15. El sistema debe calcular automáticamente el saldo pendiente.
16. Los reportes deben poder filtrarse por fecha.
17. El porcentaje del propietario debe ser configurable.
18. Por defecto será 40%.
19. El cálculo del propietario debe considerar el valor final de los servicios.
20. Los datos históricos no deben modificarse cuando cambien los precios actuales.

---

# 32. Modelo de datos inicial

Proponer y diseñar correctamente las entidades necesarias.

Como punto de partida considerar:

```text
Patient
ServiceCategory
Service
ServiceZone
Promotion
PromotionItem
Appointment
AppointmentItem
Payment
TreatmentPackage
TreatmentSession
Professional
BusinessSetting
```

No asumir que esta lista es definitiva.

Analizar las relaciones y normalización antes de implementarlas.

Por ejemplo:

```text
Patient
   |
   +---- Appointment
   |        |
   |        +---- AppointmentItem
   |                    |
   |                    +---- Service
   |
   +---- TreatmentPackage
            |
            +---- TreatmentSession
```

---

# 33. Desarrollo por etapas

NO intentar construir todo de una sola vez.

Trabajar por fases.

## Fase 1

Crear:

* proyecto Spring Boot
* proyecto Expo React Native
* PostgreSQL
* configuración de ambientes
* estructura base
* conexión DB
* entidades principales
* creación inicial de tablas
* API básica

## Fase 2

Implementar:

* pacientes
* servicios
* categorías
* zonas de depilación

## Fase 3

Implementar:

* agenda
* citas
* cálculo de duración
* múltiples servicios por cita

## Fase 4

Implementar:

* promociones
* señas
* pagos
* saldos

## Fase 5

Implementar:

* paquetes
* sesiones
* historial

## Fase 6

Implementar:

* Dashboard
* reportes
* cálculo 40%
* filtros por fecha

## Fase 7

Implementar:

* impresión/PDF
* mejoras UI/UX
* optimización
* preparación para Railway

---

# 34. Calidad del código

Quiero código mantenible.

Evitar:

* código duplicado
* lógica de negocio en componentes React
* lógica de negocio en Controllers
* consultas SQL innecesarias
* entidades JPA expuestas directamente
* números mágicos
* strings repetidos
* credenciales hardcodeadas

Utilizar:

* DTOs
* servicios
* enums cuando corresponda
* validaciones
* constantes/configuración
* manejo global de errores
* transacciones cuando sean necesarias

---

# 35. Antes de programar

Antes de comenzar a escribir código:

1. Analizar los requerimientos.
2. Detectar ambigüedades.
3. Proponer la arquitectura.
4. Proponer el modelo entidad-relación.
5. Explicar las relaciones entre las entidades.
6. Proponer la estructura de carpetas del backend.
7. Proponer la estructura de carpetas del frontend.
8. Proponer los endpoints REST.
9. Identificar reglas de negocio.
10. Indicar cualquier decisión que deba confirmarse.

No inventar funcionalidades importantes que no hayan sido solicitadas.

Cuando exista una decisión de arquitectura que tenga impacto importante, explicarla brevemente antes de implementarla.

---

# 36. Objetivo final

El objetivo es construir una aplicación móvil profesional para administrar un negocio de **depilación y estética**, permitiendo:

* registrar pacientes
* administrar servicios
* administrar precios
* administrar promociones
* reservar horarios
* calcular duración
* registrar señas
* registrar pagos
* controlar saldos
* controlar paquetes
* controlar sesiones
* consultar historial de pacientes
* controlar agenda
* obtener reportes
* calcular ingresos
* calcular automáticamente mi participación del 40%
* visualizar información de manera clara
* utilizar modo oscuro y claro
* comenzar completamente en local
* posteriormente desplegar el backend y PostgreSQL en Railway

La aplicación debe diseñarse pensando en que posteriormente pueda crecer a múltiples profesionales, usuarios, roles, autenticación y posiblemente múltiples sucursales, pero **sin implementar esa complejidad en la primera versión**.
