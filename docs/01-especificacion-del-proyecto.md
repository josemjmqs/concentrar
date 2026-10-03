# Especificación del Proyecto

## 1. Nombre del proyecto

**Concentrar**

---

## 2. Objetivo

Desarrollar una aplicación web de productividad que permita organizar sesiones de concentración, registrar el tiempo dedicado a actividades productivas y facilitar el seguimiento del progreso mediante un historial y estadísticas.

---

## 3. Problema que resuelve

Muchas personas tienen dificultades para mantener la concentración durante períodos prolongados o no tienen una forma sencilla de registrar cuánto tiempo dedican a sus actividades. Concentrar busca resolver este problema proporcionando un temporizador de concentración, registro de sesiones y herramientas para visualizar el tiempo acumulado.

---

## 4. Público objetivo

La aplicación está dirigida a personas que desean organizar mejor sus períodos de concentración y realizar un seguimiento de su tiempo productivo, entre ellas:

* Estudiantes.
* Profesionales.
* Trabajadores independientes.
* Cualquier persona que necesite realizar sesiones de concentración.

---

## 5. Alcance actual del proyecto

La aplicación cuenta actualmente con las siguientes funcionalidades:

* Registro e inicio de sesión de usuarios.
* Autenticación mediante JWT.
* Temporizador de concentración inspirado en la técnica Pomodoro.
* Configuración personalizada de los períodos de trabajo y descanso.
* Inicio y finalización manual de sesiones de concentración.
* Pausar y reanudar una sesión.
* Continuar una sesión cuando el temporizador llega a cero, registrando el tiempo adicional de concentración.
* Cancelación de sesiones en progreso y posibilidad de restaurarlas.
* Registro persistente del historial de sesiones.
* Visualización del historial con fecha, duración y estado de las sesiones.
* Estadísticas de concentración para períodos diarios, semanales y mensuales.
* Notificaciones al finalizar los períodos del temporizador.
* Persistencia de parte del estado del temporizador y configuración mediante localStorage.
* Progressive Web App (PWA) instalable desde el navegador.

La duración configurada para el período de concentración funciona como una referencia del temporizador. La sesión no se finaliza automáticamente al llegar a cero, ya que el usuario decide cuándo terminarla.

---

## 6. Funcionalidades futuras

En versiones posteriores se podrán incorporar funcionalidades como:

* Diferentes métodos de organización del tiempo.
* Metas diarias y semanales.
* Etiquetas o categorías para las sesiones.
* Nuevas herramientas para registrar y analizar el tiempo dedicado a distintas actividades.

---

## 7. Tecnologías utilizadas

### Frontend

* React
* Vite
* JavaScript
* HTML5
* CSS

### Backend

* Node.js
* Express
* API REST
* JWT
* bcrypt

### Base de datos

* PostgreSQL

### Persistencia local

* localStorage

### PWA

* Service Worker
* Web App Manifest

### Control de versiones

* Git
* GitHub
