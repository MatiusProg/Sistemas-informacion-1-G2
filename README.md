# 🍲 Sistema de Gestión de Almacenes Gastronómicos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Autónoma Gabriel René Moreno**

## 📋 Descripción
Sistema inteligente para gestión de almacenes gastronómicos con control de caducidad, merma, estacionalidad y proveedores. Desarrollado como proyecto académico para la materia INF342 - Sistemas de Información I.

## 👥 Equipo de Desarrollo
| Nombre | Registro | GitHub |
|--------|----------|--------|
| Andrade Nova Marcos David | 223041505 | @MarcosAndradeNova |
| Chispas Flores Mirian Lisbet | 223047457 | *(pendiente)* |
| Grageda Rojas Adalid | 221044574 | *(pendiente)* |
| **Hurtado Castro Luis Mateo** | **222008687** | **@MatiusProg** |
| Ortega Mancilla Karen Paola | 222056592 | @KarenOrtegaM |

## 🛠️ Stack Tecnológico
| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | React + Vite + JavaScript | Exportable desde Lovable, hot-reload rápido |
| **Backend** | Django + Django REST Framework | ORM robusto, panel admin automático, baja curva |
| **Base de Datos** | Supabase (PostgreSQL) | PostgreSQL real, autenticación integrada, gratis |
| **Autenticación** | Supabase Auth | Única fuente de verdad, RLS nativo |
| **Hosting** | Railway (Plan Free → Hobby) | Sin cold starts, soporte nativo para Django |

## 📁 Estructura del Proyecto
``` bash
├── backend/ # Aplicación Django (API REST)
│ ├── venv/ # Entorno virtual (NO se sube a Git)
│ ├── nucleo/ # Configuración principal de Django
│ ├── usuarios/ # App de autenticación
│ ├── manage.py # Comandos de Django
│ └── requirements.txt # Dependencias Python
├── frontend/ # Aplicación React + Vite
├── docs/ # Documentación del proyecto
│ ├── diagramas/ # Diagramas UML, Ishikawa, Relacionales
│ └── informes/ # Avances, Entrevistas, Análisis
└── .github/ # Configuración de CI/CD (futuro)
```

## 🚀 Instalación y Ejecución Local

### Backend (Django)

#### 📋 Requisitos Previos

| Herramienta | Versión | Enlace de Descarga |
|-------------|---------|-------------------|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Git | 2.x+ | [git-scm.com](https://git-scm.com/) |
| Git Bash (Windows) | - | Incluido con Git |
| **Microsoft C++ Build Tools** | 2022+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

> ⚠️ **IMPORTANTE (Windows):** Debes instalar **Microsoft C++ Build Tools** marcando la opción *"Desarrollo para escritorio con C++"*. Esto es necesario para compilar `pyiceberg`. Sin esto, la instalación fallará.

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
