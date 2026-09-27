# API REST

Concentra utiliza una API REST para comunicar el frontend con el backend. La API recibe y responde datos en formato JSON.

Los endpoints protegidos requieren autenticación mediante JWT. El token debe enviarse en el encabezado:

```
Authorization: Bearer <token>
```

Los datos de las sesiones y estadísticas están asociados al usuario autenticado.

## Sesiones

---

## GET /api/sesiones

Obtiene el historial de sesiones del usuario autenticado.

### Descripción

Retorna las sesiones registradas para el usuario, ordenadas desde la más reciente hasta la más antigua.

### Respuesta

Código:

```
200 OK
```

Ejemplo:

```json
[
  {
    "id": 10,
    "inicio": "2026-07-28T18:39:26.631Z",
    "fin": "2026-07-28T18:40:04.687Z",
    "duracion": 38,
    "estado": "completada"
  }
]
```

### Campos

| Campo    | Tipo      | Descripción                       |
| -------- | --------- | --------------------------------- |
| id       | integer   | Identificador único de la sesión  |
| inicio   | timestamp | Fecha y hora de inicio            |
| fin       | timestamp | Fecha y hora de finalización      |
| duracion | integer   | Duración de la sesión en segundos |
| estado   | varchar   | Estado actual de la sesión        |

### Estados posibles

* `en_progreso`
* `completada`
* `cancelada`

---

## POST /api/sesiones

Inicia una nueva sesión de concentración.

### Descripción

Crea una sesión asociada al usuario autenticado, con estado `en_progreso`, y registra la fecha y hora de inicio.

### Respuesta

Código:

```
201 Created
```

Ejemplo:

```json
{
  "id": 10,
  "inicio": "2026-07-28T18:39:26.631Z",
  "fin": null,
  "duracion": null,
  "estado": "en_progreso"
}
```

---

## PUT /api/sesiones/:id

Finaliza una sesión de concentración.

### Descripción

Actualiza una sesión en progreso del usuario autenticado, registrando la fecha y hora de finalización, calculando la duración y cambiando el estado a `completada`.

### Respuesta

Código:

```
200 OK
```

Ejemplo:

```json
{
  "id": 10,
  "inicio": "2026-07-28T18:39:26.631Z",
  "fin": "2026-07-28T18:40:04.687Z",
  "duracion": 38,
  "estado": "completada"
}
```

---

## PATCH /api/sesiones/:id/cancelar

Cancela una sesión de concentración.

### Descripción

Permite cancelar una sesión en progreso del usuario autenticado. La sesión mantiene su registro y cambia su estado a `cancelada`.

### Respuesta

Código:

```
200 OK
```

Ejemplo:

```json
{
  "id": 6,
  "estado": "cancelada"
}
```

---

## GET /api/estadisticas

Obtiene estadísticas de concentración del usuario autenticado.

### Descripción

Retorna información sobre el tiempo dedicado a sesiones completadas y el número de sesiones realizadas.

### Respuesta

Código:

```
200 OK
```

Ejemplo:

```json
{
  "tiempoHoy": 0,
  "tiempoSemana": 21855,
  "tiempoMes": 30133,
  "sesionesCompletadas": 8,
  "sesionesHoy": 2,
  "tiempoPorDia": [
    {
      "dia": "2026-07-28",
      "tiempo": 3600
    }
  ]
}
```

### Campos de respuesta

| Campo | Tipo | Descripción |
| --- | --- | --- |
| tiempoHoy | integer | Tiempo de concentración completado durante el día actual, en segundos |
| tiempoSemana | integer | Tiempo de concentración completado durante la semana actual, en segundos |
| tiempoMes | integer | Tiempo de concentración completado durante el mes actual, en segundos |
| sesionesCompletadas | integer | Cantidad total de sesiones completadas por el usuario |
| sesionesHoy | integer | Cantidad de sesiones completadas durante el día actual |
| tiempoPorDia | array | Tiempo de concentración completado por cada día del período mostrado |

Cada elemento de `tiempoPorDia` contiene:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| dia | string | Fecha del día |
| tiempo | integer | Tiempo de concentración de ese día, en segundos |

### Reglas de negocio

* Solo se consideran sesiones con estado `completada`.
* Las estadísticas corresponden únicamente al usuario autenticado.
* El tiempo se calcula en segundos.
* Las fechas se interpretan utilizando la zona horaria configurada para la aplicación.

---

## Autenticación

Los endpoints protegidos requieren un token JWT válido.

### Encabezado

```
Authorization: Bearer <token>
```

Si el token no existe, es inválido o ha expirado, la API rechaza la solicitud.

### Respuesta de error

Código:

```
401 Unauthorized
```

---

## Errores HTTP

La API puede utilizar los siguientes códigos según el resultado de la solicitud:

| Código | Significado |
| --- | --- |
| 200 | Solicitud procesada correctamente |
| 201 | Recurso creado correctamente |
| 400 | Solicitud inválida |
| 401 | Falta autenticación o el token no es válido |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |
