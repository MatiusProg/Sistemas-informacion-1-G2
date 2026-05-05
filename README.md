# 🍲 Sistema de Gestión de Almacenes Gastronómicos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Autónoma Gabriel René Moreno**

## 📋 Descripción
Sistema inteligente para gestión de almacenes gastronómicos con control de caducidad, merma, estacionalidad y proveedores. Desarrollado como proyecto académico para la materia INF342 - Sistemas de Información I.

## 👥 Equipo de Desarrollo
| Nombre | Registro | GitHub |
|--------|----------|--------|
| Andrade Nova Marcos David | 223041505 | @MarcosAndradeNova |
| Chispas Flores Mirian Lisbet | 223047457 | *(Retiró...)* | 
| Grageda Rojas Adalid | 221044574 | @NyxM4x |
| **Hurtado Castro Luis Mateo** | **222008687** | **@MatiusProg** |
| Ortega Mancilla Karen Paola | 222056592 | @KarenOrtegaM |

## 📁 Estructura Detallada del Proyecto

### Backend (`/backend/`)
```bash
backend/
├── venv/ # Entorno virtual Python (NO se sube a Git)
├── nucleo/ # Configuración principal de Django
│ ├── init.py
│ ├── settings.py # Configuración global (CORS, Supabase, BD)
│ ├── urls.py # Rutas principales (/admin/, /api/)
│ └── wsgi.py # Entrada para servidores WSGI (Railway)
├── usuarios/ # App de Autenticación y Usuarios
│ ├── init.py
│ ├── admin.py # Panel admin de Django
│ ├── apps.py # Configuración de la app
│ ├── authentication.py # Autenticación personalizada con Supabase JWT
│ ├── models.py # Modelos de datos
│ ├── serializers.py # Validación de datos (Login, Register, Reset)
│ ├── urls.py # Rutas de la API (/auth/login/, /auth/register/, etc.)
│ └── views.py # Lógica de negocio (Login, Register, Profile, Admin)
├── bitacora/ # App de Auditoría
│ ├── init.py
│ ├── admin.py # Panel admin de Django
│ ├── apps.py # Configuración de la app
│ ├── models.py # Modelo Bitacora (registro de acciones)
│ ├── utils.py # Funciones helper (registrar_accion, obtener_ip)
│ └── migrations/ # Migraciones de la base de datos
├── manage.py # Comandos de Django (runserver, migrate, etc.)
├── requirements.txt # Dependencias Python
├── .env # Variables de entorno (NO se sube a Git)
├── .env.example # Ejemplo de variables de entorno
└── railway.json # Configuración de despliegue en Railway
```

### Frontend (`/frontend/`)
```bash
frontend/
├── src/
│ ├── context/
│ │ └── AuthContext.tsx # 🔥 Contexto de autenticación (login, register, logout, etc.)
│ ├── pages/
│ │ ├── Login.tsx # Página de Inicio de Sesión
│ │ ├── Register.tsx # Página de Registro (rol "usuario" por defecto)
│ │ ├── ForgotPassword.tsx # Página de Recuperación de Contraseña
│ │ ├── UpdatePassword.tsx # Página de Cambio de Contraseña (desde email)
│ │ ├── Profile.tsx # Página de Perfil (ver/editar datos)
│ │ ├── AdminUsers.tsx # Panel de Administración (solo admin)
│ │ ├── Index.tsx # Página de inicio pública
│ │ └── NotFound.tsx # Página 404
│ ├── components/
│ │ ├── AppHeader.tsx # Barra de navegación superior
│ │ ├── AuthLayout.tsx # Plantilla para páginas de auth
│ │ ├── ProtectedRoute.tsx # 🔒 Protege rutas según autenticación y rol
│ │ ├── Logo.tsx # Componente del logo
│ │ ├── NavLink.tsx # Enlace de navegación
│ │ └── ui/ # Componentes de shadcn/ui (botones, inputs, etc.)
│ ├── lib/
│ │ ├── supabase.ts # Cliente de Supabase para el frontend
│ │ └── utils.ts # Función utilitaria cn() para estilos
│ ├── hooks/ # Hooks personalizados
│ ├── App.tsx # Componente principal (rutas)
│ ├── main.tsx # Punto de entrada de React
│ └── index.css # Estilos globales
├── index.html # Plantilla HTML principal
├── package.json # Dependencias y scripts de Node.js
├── vite.config.ts # Configuración de Vite
├── tailwind.config.ts # Configuración de Tailwind CSS
├── tsconfig.json # Configuración de TypeScript
├── .env # Variables de entorno (NO se sube a Git)
└── railway.json # Configuración de despliegue en Railway
```

### Documentación (`/docs/`)
```bash
docs/
├── diagramas/ # Diagramas UML, Ishikawa, Relacionales
└── informes/ # Avances, Entrevistas, Análisis
```

## 🚀 Guía de Inicio Rápido para el Equipo (Paso a Paso para Principiantes)

Si es tu primera vez con Git, Python o Node.js, ¡no te preocupes! Sigue esta guía al pie de la letra y en 20-30 minutos tendrás todo el proyecto funcionando en tu computadora.

### 1. Preparando tu Computadora (Solo la Primera Vez)

Estas son las herramientas base que necesitas instalar. Es como preparar tu cocina antes de empezar a cocinar.

1.  **Instalar Python**:
    *   Ve a [python.org](https://www.python.org/downloads/) y descarga el instalador para Windows.
    *   **¡IMPORTANTE!** Al inicio de la instalación, **Marca la casilla ✅ "Add Python to PATH"** (está abajo del todo). Si no lo haces, los comandos no funcionarán.
    *   Haz clic en "Install Now".

2.  **Instalar Node.js**:
    *   Ve a [nodejs.org](https://nodejs.org/) y descarga la versión LTS (la que dice "Recommended for most users").
    *   Ejecuta el instalador y sigue los pasos (puedes dar "Next" a todo).

3.  **Instalar Git y Git Bash**:
    *   Ve a [git-scm.com](https://git-scm.com/) y descarga el instalador.
    *   Durante la instalación, puedes dar "Next" a todo. Esto instalará **Git Bash**, que es el programa que usaremos para escribir comandos.

4.  **Instalar Microsoft C++ Build Tools**:
    *   Ve a [este enlace](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
    *   Descarga y ejecuta el instalador.
    *   En la ventana que aparece, marca la opción **"Desarrollo para escritorio con C++"**.
    *   Haz clic en "Instalar". Este paso puede tardar varios minutos. Es necesario para que funcionen algunas librerías de Python.

### 2. Verificando que Todo Esté Instalado

Abre el programa **Git Bash** que acabas de instalar. Se abrirá una ventana negra. Escribe los siguientes comandos **uno por uno** y presiona Enter. Deberías ver un número de versión en cada caso.

```bash
python --version
node --version
npm --version
git --version
```

### 3. Descargando el Proyecto (Clonar el Repositorio)
Ahora vamos a descargar el código fuente a tu computadora.

1. En Git Bash, navega a la carpeta donde quieres guardar el proyecto. Por ejemplo, para ir a la carpeta Documentos escribe: cd Documents.
2. Escribe el siguiente comando para descargar el código:
```bash
git clone https://github.com/MatiusProg/Sistemas-informacion-1-G2.git
```
3. Entra a la carpeta del proyecto que se acaba de crear:
```bash
cd Sistemas-informacion-1-G2
```

### 4. Configurando y Ejecutando el Backend (Django)
El "backend" es el cerebro del sistema, lo que procesa los datos.

1. Asegúrate de estar en la carpeta backend:
```bash
cd backend
```
2. Crea un entorno virtual (esto aísla las dependencias de este proyecto):
```bash
python -m venv venv
```
3. Activa el entorno virtual:
```bash
source venv/Scripts/activate
```
- Señal de éxito: Verás que el prompt de Git Bash ahora empieza con (venv).
4. Instala todas las dependencias del proyecto:
```bash
pip install -r requirements.txt
```
5. Consigue el archivo .env. Pídele a Mateo que te pase las credenciales secretas por WhatsApp o en persona. NUNCA se suben a GitHub.
6. Una vez que tengas el archivo .env, pégalo dentro de la carpeta backend/ (al mismo nivel que manage.py).
7. Ejecuta el servidor:
```bash
python manage.py runserver
```
8. Abre tu navegador y ve a http://127.0.0.1:8000/. Si ves un cohete 🚀 de Django, ¡el backend está funcionando!


### 5. Configurando y Ejecutando el Frontend (React + Vite)
El "frontend" es la interfaz visual, lo que el usuario ve y toca.

1. Abre una NUEVA ventana de Git Bash (no cierres la del backend).
2. Navega a la carpeta del proyecto y luego a frontend:
```bash
cd Documents/Sistemas-informacion-1-G2/frontend
```
3. Instala las dependencias del frontend:
```bash
npm install
```
4. Consigue el archivo .env para el frontend. De nuevo, pídele a Mateo las credenciales del frontend y pégalas en un archivo llamado .env dentro de la carpeta frontend/.
5. Inicia el servidor de desarrollo del frontend:
```bash
npm run dev
```
6. Abre tu navegador en la dirección que te indica (normalmente http://localhost:8080/). Si ves la pantalla de login, ¡lo lograste!
## 🆘 Glosario de Supervivencia para Nuevos Desarrolladores
- Git: Un programa que usamos para llevar el historial de cambios del código y poder trabajar en equipo sin pisarnos.
- Git Bash: Una terminal (ventana de comandos) para Windows que entiende los comandos de Git y otros que usamos.
- Clonar (git clone): Descargar una copia completa del código fuente de un proyecto desde GitHub a tu computadora.
- Entorno Virtual (venv): Una "caja" aislada para que las librerías de Python de un proyecto no interfieran con las de otro. Siempre hay que activarlo antes de trabajar en el backend.
- Dependencias (requirements.txt o package.json): La lista de todas las "piezas de Lego" (librerías de código) que nuestro proyecto necesita para funcionar. pip install y npm install se encargan de descargarlas todas.
- Commit (git commit): Guardar tus cambios en el historial local de Git con un mensaje descriptivo.
- Push (git push): Subir tus cambios (commits) a GitHub para que el resto del equipo pueda verlos.
- Pull (git pull): Bajar los cambios más recientes que otros han subido a GitHub.
  
## 🛠️ Stack Tecnológico
| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | React + Vite + JavaScript | Exportable desde Lovable, hot-reload rápido |
| **Backend** | Django + Django REST Framework | ORM robusto, panel admin automático, baja curva |
| **Base de Datos** | Supabase (PostgreSQL) | PostgreSQL real, autenticación integrada, gratis |
| **Autenticación** | Supabase Auth | Única fuente de verdad, RLS nativo |
| **Hosting** | Railway (Plan Free → Hobby) | Sin cold starts, soporte nativo para Django |



## 🚀 Instalación y Ejecución Local

### Backend (Django)

#### 🔧 Instalación Paso a Paso

1. **Clonar el repositorio:**
 ```bash
 git clone https://github.com/MatiusProg/Sistemas-informacion-1-G2.git
 cd Sistemas-informacion-1-G2/backend
```

2. **Crear y activar entorno virtual:**
```bash
python -m venv venv
source venv/Scripts/activate  # En Git Bash (Windows)
# En Mac/Linux: source venv/bin/activate
```

3. **Actualizar pip (opcional pero recomendado):**
```bash
python -m pip install --upgrade pip
```

4. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```
⏱️ Este paso puede tardar 3-5 minutos la primera vez.

5. **Verificar instalación:**
```bash
python -c "from supabase import create_client; print('✅ Backend listo')"
```
Debe mostrar: ✅ Backend listo

6. **Configurar variables de entorno:**
- Copiar el archivo .env.example a .env:
```bash
cp .env.example .env
```
- Solicitar al Tech Lead (Mateo) las credenciales REALES.
- Editar .env con las credenciales proporcionadas.

7. **Ejecutar migraciones:**
```bash
python manage.py migrate
```

8. **Iniciar servidor de desarrollo:**
```bash
python manage.py runserver
```

9. **Probar en navegador:**
- Abrir http://127.0.0.1:8000/
- Debe verse la página de bienvenida de Django (🚀 cohete).

**🩺 Solución de Problemas Comunes**
| Error | Causa Probable | Solución |
|-------| -------------- | -------- |
| ModuleNotFoundError: No module named 'supabase' | Dependencias no instaladas | Ejecutar pip install -r requirements.txt |
| error: Microsoft Visual C++ 14.0 or greater is required | Falta C++ Build Tools | Instalar desde este enlace |
| (venv) no aparece en el prompt | Entorno virtual no activado | Ejecutar source venv/Scripts/activate |
| Error loading MySQLdb module | No usamos MySQL | Ignorar (es un warning inofensivo) |
| Connection refused al probar login | Supabase no configurado | Verificar .env con credenciales correctas |
   
### Frontend (React)
``` bash
cd frontend
npm install
npm run dev
```

## 📊 Variables de Entorno Requeridas

Crear un archivo `.env` en la carpeta `backend/` con el siguiente formato:
``` bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SECRET_KEY=django-insecure-xxxxxxxxxxxxx
DEBUG=True
```


Crear un archivo `.env` en la carpeta `frontend/` con el siguiente formato:
``` bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:8000/api
```

**⚠️ IMPORTANTE:** Estos archivos `.env` **NO se suben a GitHub**. 
Cada desarrollador debe crear el suyo localmente con las claves reales del proyecto Supabase del equipo.
No se registran porque lso .env, se ignoran, debido al .gitignore
