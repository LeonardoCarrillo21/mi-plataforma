<table align="center" border="0">
  <tr>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/NXmonorepo.png?raw=true" height="50"><br>
      <sub>Nx monorepo</sub>
    </td>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/amplify.jpg?raw=true" height="50"><br>
      <sub>AWS Amplify</sub>
    </td>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/angular.png?raw=true" height="50"><br>
      <sub>Angular</sub>
    </td>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/nestJS.png?raw=true" height="50"><br>
      <sub>NestJS</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/next.png?raw=true" height="50"><br>
      <sub>NextJS</sub>
    </td>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/supabase.jpg?raw=true" height="50"><br>
      <sub>Supabase</sub>
    </td>
    <td align="center">
      <img src="https://github.com/LeonardoCarrillo21/mi-plataforma/blob/main/GitImages/typescript.png?raw=true" height="50"><br>
      <sub>TypeScript</sub>
    </td>
    <td align="center">
      </td>
  </tr>
</table>

🚀 ERP Multi-Módulo (Monorepo)
Este es un sistema de gestión empresarial (ERP) desarrollado con una arquitectura de Monorepo moderna. El proyecto centraliza la lógica de un E-commerce, un API-Server y un Dashboard Administrativo, utilizando tecnologías de vanguardia para garantizar escalabilidad y rendimiento.

🛠️ Stack Tecnológico
Frontend: Angular 18+ (Signals, Standalone Components, Tailwind CSS).

Backend: NestJS (Modular Architecture, Class Validator, DTOs).

Base de Datos: Supabase (PostgreSQL + RLS + Auth).

Herramientas de Monorepo: Nx (Librerías compartidas, Dependency Graph).

Lógica de Negocio: Integración con Excel (XLSX) y Gráficas en tiempo real (Chart.js).

### 📂 Estructura del Proyecto

```text
apps/
├── admin-dashboard/    # Cascarón (Shell) del panel administrativo
├── api-server/         # API REST con NestJS
└── ecommerce/           # Aplicación orientada al cliente final

libs/
├── admin/              # Librerías de funcionalidades (Feature-HR, Feature-Home)
├── shared/             # Acceso a datos, UI Kit y utilidades globales
└── shared-utils/       # Interfaces, DTOs y modelos compartidos (TS)

Funcionalidades Principales
Gestión de Personal (HR): CRUD completo de trabajadores con relaciones muchos-a-muchos con departamentos.

Business Intelligence: Dashboard con métricas calculadas (Nómina total, promedio salarial) y gráficas de barras dinámicas.

Importación Masiva: Procesamiento de archivos Excel para carga rápida de datos con barra de progreso.

Paginación del Servidor: Manejo eficiente de grandes volúmenes de datos directamente desde la API.

Buscador en Tiempo Real: Filtrado reactivo mediante Angular Signals.

🚀 Instalación y Uso
Clonar el repositorio:

  git clone https://github.com/tu-usuario/tu-proyecto.git
  cd tu-proyecto

Instalar dependencias:

  npm install

Configurar variables de entorno:
Crea un archivo .env en la raíz (o dentro de apps/api-server) con tus credenciales de Supabase:

  SUPABASE_URL=tu_url_aqui
  SUPABASE_KEY=tu_key_aqui

Ejecutar el proyecto:
  # Iniciar la API
  npx nx serve api-server
  
  # Iniciar el Dashboard
  npx nx serve admin-dashboard

📊 Grafo de Dependencias
Para visualizar cómo interactúan las apps y librerías, ejecuta:

  npx nx graph
