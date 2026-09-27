# Arquitectura

## Arquitectura general

Concentra utiliza una arquitectura cliente-servidor de tres capas:

- **Frontend:** React + Vite.
- **Backend:** Node.js + Express.
- **Base de datos:** PostgreSQL.

La aplicación está separada en un frontend y un backend independientes. El frontend se encarga de la interfaz y de la lógica de interacción del temporizador, mientras que el backend expone una API REST, aplica las reglas de negocio relacionadas con los datos y se comunica con PostgreSQL.

---

## Flujo de la aplicación

```text
Usuario
   │
   ▼
React + Vite
   │
   │ HTTP / JSON
   ▼
API REST
Node.js + Express
   │
   ├── Middleware de autenticación (JWT)
   │
   ├── Controllers
   │
   └── PostgreSQL
          │
          ▼
       Base de datos
```

---

## Responsabilidades

### Frontend

- Mostrar la interfaz de usuario.
- Gestionar el temporizador de concentración y descanso.
- Permitir configurar los períodos de trabajo y descanso.
- Permitir pausar y reanudar el temporizador.
- Mostrar historial y estadísticas.
- Gestionar el estado de autenticación en el cliente.
- Consumir la API REST.
- Gestionar funcionalidades PWA y notificaciones mediante Service Worker.
- Persistir localmente determinados estados y configuraciones mediante `localStorage`.

### Backend

- Exponer la API REST.
- Registrar y finalizar sesiones.
- Gestionar cancelación y restauración de sesiones.
- Consultar historial y estadísticas.
- Gestionar registro e inicio de sesión.
- Generar y verificar tokens JWT.
- Verificar que las operaciones correspondan al usuario autenticado.
- Aplicar reglas de negocio.
- Comunicarse con PostgreSQL mediante el driver `pg`.

### Base de datos

PostgreSQL almacena de forma persistente:

- Usuarios.
- Sesiones de concentración.

Las consultas de estadísticas se realizan a partir de las sesiones completadas de cada usuario.

---

## Autenticación y autorización

La autenticación utiliza **JSON Web Tokens (JWT)**.

El flujo general es:

1. El usuario inicia sesión.
2. El backend verifica las credenciales.
3. El backend genera un JWT.
4. El frontend utiliza el token en las solicitudes protegidas.
5. El middleware del backend verifica el token.
6. El backend identifica al usuario y limita el acceso a sus propios datos.

Las contraseñas se almacenan utilizando **bcrypt**.

---

## Comunicación

La comunicación entre frontend y backend se realiza mediante una API REST utilizando HTTP y JSON.

Las rutas protegidas requieren autenticación mediante JWT.

Ejemplos de operaciones disponibles:

- Registro e inicio de sesión.
- Crear una sesión.
- Finalizar una sesión.
- Consultar sesiones.
- Cancelar y restaurar sesiones.
- Consultar una sesión en progreso.
- Consultar estadísticas.

---

## Estructura del proyecto

```text
concentra/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── sw.js
│   └── package.json
│
└── docs/
    ├── 01-especificacion-del-proyecto.md
    ├── 02-requisitos-funcionales.md
    ├── 03-requisitos-no-funcionales.md
    ├── 04-modelo-de-datos.md
    ├── 05-arquitectura.md
    ├── 06-api-rest.md
    └── images/
```

---

## Despliegue

El frontend y el backend se despliegan como aplicaciones independientes.

- **Frontend:** Vercel.
- **Backend:** Render.
- **Base de datos:** PostgreSQL en Neon.

Las credenciales y variables de entorno se mantienen fuera del repositorio mediante archivos `.env`.

---

## Principios de diseño

El proyecto busca mantener responsabilidades separadas:

- React se ocupa de la interfaz y la interacción del usuario.
- Express organiza las rutas, middleware y controladores de la API.
- PostgreSQL se ocupa del almacenamiento persistente.
- JWT permite identificar al usuario en las rutas protegidas.
- La configuración específica del temporizador se mantiene separada para cada usuario.

Esta separación facilita mantener y ampliar la aplicación a medida que incorpora nuevas funcionalidades.
