# Requisitos Funcionales

## RF-01: Registrar usuario

El usuario debe poder crear una cuenta proporcionando:

- Nombre.
- Correo electrónico.
- Contraseña.

El sistema verifica que el correo no esté registrado y almacena la contraseña utilizando un hash generado con bcrypt.

---

## RF-02: Iniciar sesión

El usuario debe poder iniciar sesión utilizando su correo electrónico y contraseña.

Si las credenciales son válidas, el backend genera un token JWT que identifica al usuario y permite acceder a las rutas protegidas.

---

## RF-03: Iniciar sesión de concentración

El usuario autenticado debe poder iniciar una sesión de concentración.

**Flujo básico:**

1. El usuario presiona **"Iniciar"**.
2. El sistema obtiene la configuración de trabajo del usuario.
3. El backend crea una sesión con estado `en_progreso`.
4. Se registra la fecha y hora de inicio.
5. El temporizador comienza a contar el tiempo configurado.

El sistema impide que un mismo usuario tenga más de una sesión de concentración en progreso.

---

## RF-04: Configurar períodos de trabajo y descanso

El usuario debe poder personalizar la configuración del temporizador Pomodoro, incluyendo:

- Duración del período de trabajo.
- Duración del descanso corto.
- Duración del descanso largo.
- Cantidad de sesiones antes del descanso largo.

La configuración se mantiene separada para cada usuario.

---

## RF-05: Pausar y reanudar el temporizador

El usuario debe poder pausar una sesión de concentración o un período de descanso y posteriormente reanudarlo.

El temporizador conserva el tiempo acumulado para continuar desde el punto en que fue pausado.

---

## RF-06: Finalizar manualmente una sesión de concentración

El usuario decide cuándo terminar su sesión de concentración.

Al finalizar:

1. El sistema registra la fecha y hora de término.
2. Se registra la duración real de la sesión.
3. La sesión cambia de `en_progreso` a `completada`.
4. Las estadísticas se actualizan.

El temporizador puede llegar a cero sin finalizar automáticamente la sesión. Cuando esto ocurre, la aplicación muestra el tiempo adicional de concentración y permite al usuario continuar trabajando o finalizar la sesión.

---

## RF-07: Gestionar períodos de descanso

Al finalizar el período de concentración configurado, la aplicación puede iniciar un período de descanso según el ciclo Pomodoro configurado.

El sistema distingue entre:

- Descanso corto.
- Descanso largo.

La aplicación notifica al usuario cuando termina un período de trabajo o descanso.

El usuario también puede continuar trabajando o descansando después de que el temporizador llegue a cero.

---

## RF-08: Recuperar el estado del temporizador

La aplicación debe recuperar el estado de una sesión en progreso cuando el usuario vuelve a abrir la aplicación o recarga la página.

Para ello:

- Las sesiones de concentración en progreso se consultan en el backend.
- El estado de los descansos se conserva localmente.
- El temporizador calcula nuevamente el tiempo transcurrido utilizando fechas y horas.

Esto permite mantener el funcionamiento del temporizador aunque la página haya sido cerrada o la aplicación haya quedado en segundo plano.

---

## RF-09: Consultar historial

El usuario autenticado debe poder visualizar su historial de sesiones.

Cada registro muestra como mínimo:

- Fecha y hora de inicio.
- Fecha y hora de finalización.
- Duración.
- Estado.

El historial contiene únicamente las sesiones pertenecientes al usuario autenticado.

---

## RF-10: Cancelar una sesión

El usuario puede cancelar una sesión dependiendo de su estado.

### Sesión en progreso

Una sesión `en_progreso` puede cancelarse sin considerarse una sesión completada.

### Sesión completada

Una sesión `completada` puede cancelarse desde el historial para excluirla de las estadísticas.

---

## RF-11: Restaurar una sesión cancelada

El usuario debe poder restaurar una sesión cancelada.

Al restaurarla, la sesión vuelve al estado `completada` y vuelve a ser considerada en las estadísticas.

---

## RF-12: Consultar estadísticas

El usuario autenticado debe poder visualizar estadísticas de concentración.

La aplicación muestra:

- Tiempo de concentración de hoy.
- Tiempo de concentración de esta semana.
- Tiempo de concentración de este mes.
- Cantidad total de sesiones completadas.
- Cantidad de sesiones completadas hoy.
- Distribución del tiempo de concentración por día durante la semana actual.
- Distribución del tiempo de concentración por día durante el mes actual.

Las estadísticas consideran únicamente sesiones con estado `completada`.

La aplicación permite alternar entre una vista semanal y una vista mensual para visualizar la distribución diaria del tiempo de concentración.

Las estadísticas diarias, semanales y mensuales utilizan la fecha de inicio de la sesión y la zona horaria `America/Santiago`.

---

## RF-13: Notificaciones

La aplicación debe poder mostrar notificaciones cuando termina un período del temporizador.

Las notificaciones pueden incluir acciones para:

- Iniciar el descanso.
- Iniciar una nueva sesión de concentración.

La aplicación utiliza un Service Worker para gestionar las notificaciones del navegador.

---

## RF-14: Instalar la aplicación como PWA

La aplicación debe poder instalarse como Progressive Web App (PWA) desde un navegador compatible.

---

# Reglas de negocio

- Cada sesión pertenece a un único usuario.
- Solo puede existir una sesión `en_progreso` por usuario.
- Una sesión nueva se crea con estado `en_progreso`.
- Una sesión finalizada manualmente cambia a `completada`.
- Una sesión `en_progreso` puede cambiar a `cancelada`.
- Una sesión `completada` puede cambiar a `cancelada`.
- Una sesión `cancelada` puede restaurarse a `completada`.
- Las sesiones `cancelada` no se consideran en las estadísticas.
- Las estadísticas se calculan únicamente sobre sesiones del usuario autenticado.
- La configuración del temporizador se mantiene separada por usuario.
- Las estadísticas utilizan la zona horaria de Chile (`America/Santiago`).


---

## RF-15: Editar la duración de una sesión completada

El usuario debe poder editar la duración de una sesión que se encuentre en estado `completada`.

### Flujo básico

1. El usuario selecciona **"Editar"** en una sesión completada del historial.
2. La aplicación permite introducir una nueva duración en minutos.
3. El usuario selecciona **"Guardar"**.
4. El frontend envía la nueva duración al backend.
5. El backend verifica que la sesión pertenezca al usuario autenticado y que se encuentre en estado `completada`.
6. El sistema actualiza la duración de la sesión.
7. Las estadísticas se actualizan utilizando la nueva duración.

Las sesiones `en_progreso` y `cancelada` no pueden editarse mediante esta funcionalidad.
