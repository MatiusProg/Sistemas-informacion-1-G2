# ?? Sistema de Gestión de Almacenes Gastron車micos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Aut車noma Gabriel Ren谷 Moreno**

## ?? Descripci車n
Sistema inteligente para gesti車n de almacenes gastron車micos con control de caducidad, merma, estacionalidad y proveedores. Desarrollado como proyecto acad谷mico para la materia INF342 - Sistemas de Informaci車n I.

## ?? Equipo de Desarrollo
| Nombre | Registro | GitHub |
|--------|----------|--------|
| Andrade Nova Marcos David | 223041505 | @MarcosAndradeNova |
| Chispas Flores Mirian Lisbet | 223047457 | *(pendiente)* |
| Grageda Rojas Adalid | 221044574 | *(pendiente)* |
| **Hurtado Castro Luis Mateo** | **222008687** | **@MatiusProg** |
| Ortega Mancilla Karen Paola | 222056592 | @KarenOrtegaM |

## ??? Stack Tecnol車gico
| Capa | Tecnolog穩a | Justificaci車n |
|------|------------|---------------|
| **Frontend** | React + Vite + JavaScript | Exportable desde Lovable, hot-reload r芍pido |
| **Backend** | Django + Django REST Framework | ORM robusto, panel admin autom芍tico, baja curva |
| **Base de Datos** | Supabase (PostgreSQL) | PostgreSQL real, autenticaci車n integrada, gratis |
| **Autenticaci車n** | Supabase Auth | �nica fuente de verdad, RLS nativo |
| **Hosting** | Railway (Plan Free �?Hobby) | Sin cold starts, soporte nativo para Django |

## ?? Estructura del Proyecto
``` bash
念岸岸 backend/ # Aplicaci車n Django (API REST)
岫 念岸岸 venv/ # Entorno virtual (NO se sube a Git)
岫 念岸岸 nucleo/ # Configuraci車n principal de Django
岫 念岸岸 usuarios/ # App de autenticaci車n
岫 念岸岸 manage.py # Comandos de Django
岫 弩岸岸 requirements.txt # Dependencias Python
念岸岸 frontend/ # Aplicaci車n React + Vite
念岸岸 docs/ # Documentaci車n del proyecto
岫 念岸岸 diagramas/ # Diagramas UML, Ishikawa, Relacionales
岫 弩岸岸 informes/ # Avances, Entrevistas, An芍lisis
弩岸岸 .github/ # Configuraci車n de CI/CD (futuro)
```

## ?? Instalaci車n y Ejecuci車n Local

### Backend (Django)

#### ?? Requisitos Previos

| Herramienta | Versi車n | Enlace de Descarga |
|-------------|---------|-------------------|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Git | 2.x+ | [git-scm.com](https://git-scm.com/) |
| Git Bash (Windows) | - | Incluido con Git |
| **Microsoft C++ Build Tools** | 2022+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

> ?? **IMPORTANTE (Windows):** Debes instalar **Microsoft C++ Build Tools** marcando la opci車n *"Desarrollo para escritorio con C++"*. Esto es necesario para compilar `pyiceberg`. Sin esto, la instalaci車n fallar芍.

#### ?? Instalaci車n Paso a Paso

1. **Clonar el repositorio:**
	```bash
	git clone https://github.com/MatiusProg/Sistemas-informacion-1-G2.git
	cd Sistemas-informacion-1-G2/backend
	```
2. **Crear y activar entorno virtual:**
	``` bash
	python -m venv venv
	source venv/Scripts/activate  # En Git Bash (Windows)
	# En Mac/Linux: source venv/bin/activate
	```

3. **Actualizar pip (opcional pero recomendado):**
	``` bash
	python -m pip install --upgrade pip
	```
	
4. **Instalar dependencias:**
	``` bash
	pip install -r requirements.txt
	
	#?? Este paso puede tardar 3-5 minutos la primera vez.
	```
	
5. **Verificar instalaci車n:**
	``` bash
	python -c "from supabase import create_client; print('? Backend listo')"
	
	# Debe mostrar: ? Backend listo
	```

6. **Configurar variables de entorno:**
	- Copiar el archivo .env.example a .env:
	``` bash
	cp .env.example .env
	```	
	- Solicitar al Tech Lead (Mateo) las credenciales REALES.

	- Editar .env con las credenciales proporcionadas.
	
7. **Ejecutar migraciones:**
	``` bash
	python manage.py migrate
	```
	
8. **Iniciar servidor de desarrollo:**
	``` bash
	python manage.py runserver
	```

9. **Probar en navegador:**
	- Abrir http://127.0.0.1:8000/

	- Debe verse la p芍gina de bienvenida de Django (?? cohete).
	
**?? Soluci車n de Problemas Comunes**

| Error	| Causa Probable | Soluci車n |
| -----	| -------------- | -------- |
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

## ?? Variables de Entorno Requeridas

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

**?? IMPORTANTE:** Estos archivos `.env` **NO se suben a GitHub**. 
Cada desarrollador debe crear el suyo localmente con las claves reales del proyecto Supabase del equipo.
No se registran porque lso .env, se ignoran, debido al .gitignore
