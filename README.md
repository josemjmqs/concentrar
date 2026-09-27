# Concentra

Aplicación web full stack de productividad enfocada en mejorar y medir la concentración mediante sesiones de trabajo y descanso basadas en la técnica Pomodoro.

## 🚀 Demo

**Aplicación:** https://focusflow-inky-theta.vercel.app

## 📋 Descripción

Concentra permite registrar sesiones de concentración, configurar períodos personalizados de trabajo y descanso y consultar estadísticas e historial para realizar un seguimiento del tiempo dedicado a la concentración.

El proyecto fue desarrollado de principio a fin como una aplicación web full stack y cuenta con una versión desplegada y funcional en producción.

## ✨ Funcionalidades

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Temporizador basado en la técnica Pomodoro.
- Configuración personalizada de los períodos de trabajo y descanso.
- Registro y finalización de sesiones de concentración.
- Historial de sesiones.
- Estadísticas de concentración.
- Notificaciones al finalizar los períodos del temporizador.
- Progressive Web App (PWA) instalable desde el navegador.

## 🏗️ Arquitectura

La aplicación está dividida en tres partes principales:

- **Frontend:** interfaz desarrollada con React, responsable de la interacción con el usuario y del funcionamiento del temporizador.
- **Backend:** API REST desarrollada con Node.js y Express, encargada de la autenticación y de la lógica de negocio.
- **Base de datos:** PostgreSQL, utilizada para almacenar usuarios, sesiones y datos necesarios para las estadísticas.

El frontend se comunica con el backend mediante solicitudes HTTP a la API REST.

## 🛠️ Tecnologías

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite
- vite-plugin-pwa

### Backend
- Node.js
- Express
- JWT
- bcrypt

### Base de datos
- PostgreSQL

### Herramientas
- Git
- GitHub

## 📁 Estructura del proyecto

```text
concentra/
├── frontend/
├── backend/
├── database/
└── docs/
```

## 💻 Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/josemjmqs/concentra.git
cd concentra
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

### 3. Ejecutar el frontend

```bash
npm run dev
```

### 4. Instalar y ejecutar el backend

En otra terminal:

```bash
cd backend
npm install
npm run dev
```

Para ejecutar el proyecto localmente también es necesario configurar las variables de entorno y la conexión a PostgreSQL. Las credenciales y secretos deben mantenerse fuera del repositorio mediante archivos `.env`.

## 📚 Documentación

La carpeta `docs/` contiene la documentación del proyecto, incluyendo:

- Especificación del proyecto.
- Diseño y decisiones de desarrollo.
- Estructura de la base de datos.
- Documentación de la API REST.

## 📌 Estado del proyecto

Proyecto personal desarrollado y desplegado en producción.

La aplicación se encuentra funcional y continúa evolucionando mediante mejoras y nuevas funcionalidades.

## 📸 Capturas

### Temporizador y estadísticas

![Temporizador y estadísticas](docs/images/temporizador.jpg)

### Configuración Pomodoro

![Configuración Pomodoro](docs/images/configuracion.jpg)

### Historial

![Historial](docs/images/historial.jpg)
