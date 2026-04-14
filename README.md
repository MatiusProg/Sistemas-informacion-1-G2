# 🍲 Sistema de Gestión de Almacenes Gastronómicos - SI1

**Grupo 2 - INF342 - Semestre 1-2026**
**Universidad Autónoma Gabriel René Moreno / UNIVALLE**

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
bash'''
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
'''

## 🚀 Instalación y Ejecución Local

### Backend (Django)
cd backend
python -m venv venv
source venv/Scripts/activate  # En Git Bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### Frontend (React)
cd frontend
npm install
npm run dev


