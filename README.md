# Sistema de Planillas - Frontend

Aplicación web desarrollada con React + TypeScript + Vite para la gestión de planillas, gastos e ingresos.

## Instalación y Configuración

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

   Crear el archivo `.env.local` en la raíz del proyecto con:

   ```env
   URL_API=http://localhost:4000/api
   ```

   **Nota:** Si el archivo `.env.local` no existe, puedes copiarlo desde `.env.template`:

   ```bash
   cp .env.template .env.local
   ```

3. **IMPORTANTE - Ejecutar el backend primero:**

   - El backend debe estar corriendo en `http://localhost:4000`
   - Debe tener los datos iniciales (SEED) ejecutados

4. **Ejecutar el frontend:**

```bash
npm run dev
```

5. **Abrir en el navegador:** `http://localhost:5173`

## Usuarios de Prueba

Una vez que el backend tenga el SEED ejecutado, usar estos usuarios:

- **Administrador:** admin@gmail.com / admin@Abc479
- **Editor:** jrios@gmail.com / 112233
- **Visor:** rdiaz@gmail.com / 998811

## Prerequisitos

- Node.js 18+
- npm
- Backend ejecutándose en puerto 4000

## Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run preview      # Previsualizar build de producción
npm run lint         # Verificar código con ESLint
```

## Estructura del Proyecto

```
src/
├── components/      # Componentes React reutilizables
├── pages/          # Páginas principales de la aplicación
├── services/       # Configuración de API y servicios
├── context/        # Context de React para estado global
├── hooks/          # Custom hooks de React
├── layout/         # Componentes de layout
└── routes/         # Configuración de rutas
```

## Tecnologías Utilizadas

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS Modules
- **HTTP Client:** Axios
- **Routing:** React Router DOM
