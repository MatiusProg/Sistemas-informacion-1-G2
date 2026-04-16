<<<<<<< HEAD
# ?? Sistema de Gestion de Almacenes Gastronomicos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Autonoma Gabriel Rene Moreno**

## ?? Descripcion
Sistema inteligente para gestion de almacenes gastronomicos con control de caducidad, merma, estacionalidad y proveedores. Desarrollado como proyecto academico para la materia INF342 - Sistemas de Informacion I.
=======
# ?? Sistema de GestiÃ³n de Almacenes Gastronè»Šmicos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Autè»Šnoma Gabriel Renè°· Moreno**

## ?? Descripciè»Šn
Sistema inteligente para gestiè»Šn de almacenes gastronè»Šmicos con control de caducidad, merma, estacionalidad y proveedores. Desarrollado como proyecto acadè°·mico para la materia INF342 - Sistemas de Informaciè»Šn I.
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877

## ?? Equipo de Desarrollo
| Nombre | Registro | GitHub |
|--------|----------|--------|
| Andrade Nova Marcos David | 223041505 | @MarcosAndradeNova |
| Chispas Flores Mirian Lisbet | 223047457 | *(pendiente)* |
| Grageda Rojas Adalid | 221044574 | *(pendiente)* |
| **Hurtado Castro Luis Mateo** | **222008687** | **@MatiusProg** |
| Ortega Mancilla Karen Paola | 222056592 | @KarenOrtegaM |

<<<<<<< HEAD
## ??? Stack Tecnologico
| Capa | Tecnologia | Justificacion |
|------|------------|---------------|
| **Frontend** | React + Vite + JavaScript | Exportable desde Lovable, hot-reload rapido |
| **Backend** | Django + Django REST Framework | ORM robusto, panel admin automatico, baja curva |
| **Base de Datos** | Supabase (PostgreSQL) | PostgreSQL real, autenticacion integrada, gratis |
| **Autenticacion** | Supabase Auth | Unica fuente de verdad, RLS nativo |
| **Hosting** | Railway (Plan Free ¡÷ Hobby) | Sin cold starts, soporte nativo para Django |

## ?? Estructura del Proyecto
``` bash
¢u¢w¢w backend/ # Aplicacion Django (API REST)
¢x ¢u¢w¢w venv/ # Entorno virtual (NO se sube a Git)
¢x ¢u¢w¢w nucleo/ # Configuracion principal de Django
¢x ¢u¢w¢w usuarios/ # App de autenticacion
¢x ¢u¢w¢w manage.py # Comandos de Django
¢x ¢|¢w¢w requirements.txt # Dependencias Python
¢u¢w¢w frontend/ # Aplicacion React + Vite
¢u¢w¢w docs/ # Documentacion del proyecto
¢x ¢u¢w¢w diagramas/ # Diagramas UML, Ishikawa, Relacionales
¢x ¢|¢w¢w informes/ # Avances, Entrevistas, Analisis
¢|¢w¢w .github/ # Configuracion de CI/CD (futuro)
```

## ?? Instalacion y Ejecucion Local
=======
## ??? Stack Tecnolè»Šgico
| Capa | Tecnologç©©a | Justificaciè»Šn |
|------|------------|---------------|
| **Frontend** | React + Vite + JavaScript | Exportable desde Lovable, hot-reload rèŠpido |
| **Backend** | Django + Django REST Framework | ORM robusto, panel admin automèŠtico, baja curva |
| **Base de Datos** | Supabase (PostgreSQL) | PostgreSQL real, autenticaciè»Šn integrada, gratis |
| **Autenticaciè»Šn** | Supabase Auth | ï¿½nica fuente de verdad, RLS nativo |
| **Hosting** | Railway (Plan Free ï¿½?Hobby) | Sin cold starts, soporte nativo para Django |

## ?? Estructura del Proyecto
``` bash
å¿µå²¸å²¸ backend/ # Aplicaciè»Šn Django (API REST)
å²« å¿µå²¸å²¸ venv/ # Entorno virtual (NO se sube a Git)
å²« å¿µå²¸å²¸ nucleo/ # Configuraciè»Šn principal de Django
å²« å¿µå²¸å²¸ usuarios/ # App de autenticaciè»Šn
å²« å¿µå²¸å²¸ manage.py # Comandos de Django
å²« å¼©å²¸å²¸ requirements.txt # Dependencias Python
å¿µå²¸å²¸ frontend/ # Aplicaciè»Šn React + Vite
å¿µå²¸å²¸ docs/ # Documentaciè»Šn del proyecto
å²« å¿µå²¸å²¸ diagramas/ # Diagramas UML, Ishikawa, Relacionales
å²« å¼©å²¸å²¸ informes/ # Avances, Entrevistas, AnèŠlisis
å¼©å²¸å²¸ .github/ # Configuraciè»Šn de CI/CD (futuro)
```

## ?? Instalaciè»Šn y Ejecuciè»Šn Local
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877

### Backend (Django)

#### ?? Requisitos Previos

<<<<<<< HEAD
| Herramienta | Version | Enlace de Descarga |
=======
| Herramienta | Versiè»Šn | Enlace de Descarga |
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877
|-------------|---------|-------------------|
| Python | 3.11+ | [python.org](https://www.python.org/downloads/) |
| Git | 2.x+ | [git-scm.com](https://git-scm.com/) |
| Git Bash (Windows) | - | Incluido con Git |
| **Microsoft C++ Build Tools** | 2022+ | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |

<<<<<<< HEAD
> ?? **IMPORTANTE (Windows):** Debes instalar **Microsoft C++ Build Tools** marcando la opcion *"Desarrollo para escritorio con C++"*. Esto es necesario para compilar `pyiceberg`. Sin esto, la instalacion fallara.

####  Instalacion Paso a Paso
=======
> ?? **IMPORTANTE (Windows):** Debes instalar **Microsoft C++ Build Tools** marcando la opciè»Šn *"Desarrollo para escritorio con C++"*. Esto es necesario para compilar `pyiceberg`. Sin esto, la instalaciè»Šn fallarèŠ.

#### ?? Instalaciè»Šn Paso a Paso
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877

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
	
	# Este paso puede tardar 3-5 minutos la primera vez.
	```
	
<<<<<<< HEAD
5. **Verificar instalacion:**
=======
5. **Verificar instalaciè»Šn:**
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877
	``` bash
	python -c "from supabase import create_client; print(' Backend listo')"
	
	# Debe mostrar:  Backend listo
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

<<<<<<< HEAD
	- Debe verse la pagina de bienvenida de Django ( cohete).
	
**?? Solucion de Problemas Comunes**

| Error	| Causa Probable | Solucion |
=======
	- Debe verse la pèŠgina de bienvenida de Django (?? cohete).
	
**?? Soluciè»Šn de Problemas Comunes**

| Error	| Causa Probable | Soluciè»Šn |
>>>>>>> d9616b08cc6eb504ad8045877d9bb221a24ba877
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

##  ?? Variables de Entorno Requeridas

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
