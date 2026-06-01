# SaludSD — Sistema de Gestión de Listas de Espera

> Plataforma web para la **Municipalidad de Santo Domingo** que permite gestionar listas de espera y tiempos de atención en la red de salud primaria comunal.

---

## Índice

1. [Integrantes](#integrantes)
2. [Descripción del Proyecto](#descripción-del-proyecto)
3. [Justificación del Problema (EP 1.2)](#ep-12-justificación-del-problema)
4. [Requerimientos (EP 1.1)](#ep-11-requerimientos)
5. [Mockups UI/UX (EP 1.3)](#ep-13-mockups-uiux)
6. [Arquitectura de Navegación (EP 1.4)](#ep-14-arquitectura-de-navegación-y-experiencia-del-usuario)
7. [Estructura del Proyecto Ionic+React (EP 1.5)](#ep-15-proyecto-ionic--react)
8. [Pantallas Implementadas (EP 1.6)](#ep-16-pantallas-principales-implementadas)
9. [Modelo Relacional y Base de Datos (EP 2.2)](#ep-22-modelo-relacional-y-base-de-datos)
10. [Documentación de la API (EP 2.1, 2.3, 2.7)](#ep-23-api-restful)
11. [Seguridad y Manejo de Sesión (EP 2.5, 2.6)](#ep-26-seguridad-y-manejo-de-sesiones)
12. [Instalación y Ejecución](#instalación-y-ejecución)
13. [Tecnologías](#tecnologías)

---

## Integrantes

| Integrantes|
|-----------|
| Matias Delgadillo|
| Benjamin Gonzalez|
| Javier Montoya|
| Gabriel Reyes|

**Asignatura:** Ingeniería Web y Móvil

---

## Descripción del Proyecto

**SaludSD** es una aplicación web desarrollada para la Municipalidad de Santo Domingo, enfocada en resolver la problemática de las **listas de espera y tiempos de atención excesivos** en la red de salud primaria comunal. Los usuarios (pacientes) deben esperar meses para consultas o exámenes debido a la sobredemanda y falta de organización, esta plataforma digitaliza y transparenta ese proceso.

La autenticación se realiza exclusivamente mediante **ClaveÚnica** del Gobierno de Chile (OpenID Connect / OAuth 2.0), cumpliendo con el Instructivo Presidencial de Transformación Digital. El diseño sigue los lineamientos del [Framework Digital del Gobierno de Chile](https://framework.digital.gob.cl/).

### Centros de salud cubiertos

| Centro | Tipo | Dirección | Teléfono |
|--------|------|-----------|----------|
| CESFAM Santo Domingo | CESFAM | Las Hortensias #146, Santo Domingo | +56 35 220 4500 |
| Posta Rural El Convento | Posta | Sector El Convento s/n, Santo Domingo | +56 9 6669 3380 |
| Posta Rural Bucalemu | Posta | Sector Bucalemu s/n, Santo Domingo | +56 9 4131 2782 |
| Posta Rural San Enrique | Posta | Sector San Enrique s/n, Santo Domingo | +56 9 6669 3386 |

---

## EP 1.2: Justificación del Problema

### Problemática

Según el diagnóstico de salud comunal, la comuna de Santo Domingo enfrenta:

- **Tiempos de espera excesivos:** Los pacientes esperan un promedio de 250 días para ser atendidos por especialistas, llegando hasta 420 días en especialidades como Neurología.
- **Sobredemanda:** Con 847 pacientes actualmente en lista de espera distribuidos en 4 centros de salud, la capacidad instalada es insuficiente.
- **Falta de transparencia:** Los pacientes no tienen visibilidad sobre su posición en la lista ni sobre los tiempos estimados de espera.
- **Desorganización administrativa:** La gestión manual de listas impide una asignación eficiente de recursos y priorización adecuada.
- **Brecha digital:** La comuna carece de herramientas digitales para la gestión de salud primaria.

### Análisis del Usuario Objetivo

Se identifican dos perfiles principales:

**Paciente (Ciudadano)**
- Residente de la comuna de Santo Domingo (Región de Valparaíso).
- Necesita consultar su posición en la lista de espera y solicitar citas médicas.
- Accede desde dispositivos móviles principalmente.
- Utiliza ClaveÚnica como mecanismo de autenticación.
- Prioriza la simplicidad y rapidez de acceso a la información.

**Funcionario de Salud (Administrador / SOME)**
- Profesional de salud o administrativo del CESFAM o Posta rural.
- Necesita gestionar las listas de espera, visualizar métricas (KPIs) y generar reportes.
- Accede desde equipos de escritorio principalmente.
- Puede acceder también como paciente (rol dual mediante ClaveÚnica).
- Requiere vistas con mayor densidad de información y herramientas de gestión.

### Impacto esperado

- Reducción de tiempos de espera mediante priorización inteligente.
- Transparencia total para el paciente sobre su estado en la lista.
- Optimización de la gestión administrativa de citas y listas.
- Reducción de inasistencias mediante notificaciones y recordatorios.
- Datos en tiempo real para la toma de decisiones en salud comunal.

---

## EP 1.1: Requerimientos

### Requerimientos Funcionales

| ID | Requerimiento | Rol | Descripción |
|----|--------------|-----|-------------|
| **RF-01** | Consulta de lista de espera | Paciente | El paciente puede visualizar su posición actual en cada lista de espera, incluyendo la especialidad, centro de salud, fecha de solicitud, posición relativa (ej: 12 de 89) y tiempo estimado de espera en días. |
| **RF-02** | Solicitud de cita médica | Paciente | El paciente puede solicitar una nueva cita médica mediante un formulario multi-paso: selección de especialidad, centro de salud, preferencia horaria y confirmación. |
| **RF-03** | Historial de atenciones | Paciente | El paciente puede consultar su historial de citas pasadas con detalle de especialidad, médico tratante, centro, fecha, hora, estado y notas clínicas. |
| **RF-04** | Centro de notificaciones | Paciente | El paciente recibe y consulta notificaciones sobre avances en su lista de espera, confirmaciones de cita, recordatorios y alertas del sistema. |
| **RF-05** | Directorio de centros de salud | Paciente | El paciente puede consultar los centros de salud disponibles en la comuna con sus especialidades, porcentaje de ocupación, tiempos de espera promedio y datos de contacto. |
| **RF-06** | Gestión CRUD de listas de espera | Administrador | El funcionario SOME puede ver, buscar, filtrar, editar y eliminar registros de la lista de espera. Incluye filtros por especialidad, estado y búsqueda por nombre o RUT. |
| **RF-07** | Dashboard de métricas y KPIs | Administrador | El funcionario visualiza estadísticas en tiempo real: total de pacientes en espera, tiempo promedio, demanda por especialidad (gráfico de barras), ocupación por centro y tendencia semanal. |
| **RF-08** | Estadísticas detalladas del sistema | Administrador | Visualización de gráficos comparativos de pacientes en espera y tiempos promedio por especialidad, estado por centro de salud con indicadores de criticidad, y tabla de detalle con clasificación semáforo. |
| **RF-09** | Autenticación con ClaveÚnica | Ambos | Los usuarios se autentican exclusivamente mediante ClaveÚnica (OpenID Connect). El sistema identifica al usuario por su RUN y determina si es funcionario para ofrecer selección de rol. |
| **RF-10** | Selección de rol dual | Funcionario | Los usuarios registrados como funcionarios de salud pueden elegir entre vista de *Paciente* o *Funcionario* al iniciar sesión, y cambiar de rol en cualquier momento desde la barra de navegación. |

### Requerimientos No Funcionales

| ID | Categoría | Requerimiento |
|----|-----------|--------------|
| **RNF-01** | Rendimiento | La aplicación debe cargar la vista principal (dashboard) en menos de 3 segundos en conexiones 3G. Las transiciones entre vistas deben ser fluidas (<300ms). |
| **RNF-02** | Seguridad | Autenticación delegada a ClaveÚnica (OAuth 2.0 / OpenID Connect). Tokens CSRF anti-falsificación. Credenciales (`client_id`, `client_secret`) almacenadas en variables de entorno, nunca en código fuente. Comunicación exclusiva por HTTPS (TLS 1.2+). |
| **RNF-03** | Usabilidad | Diseño responsive (mobile-first para pacientes, desktop-first para admin). Cumplimiento del Framework Digital del Gobierno de Chile (paleta de colores, tipografía Roboto, componentes institucionales). Navegación intuitiva con máximo 3 clics para cualquier funcionalidad. |
| **RNF-04** | Disponibilidad | El sistema debe estar accesible 24/7 con un uptime mínimo de 99.5%. |
| **RNF-05** | Compatibilidad | Compatible con Chrome, Firefox, Safari y Edge en sus últimas 2 versiones. Responsive en dispositivos desde 320px hasta 1920px. |

---

## EP 1.3: Mockups UI/UX

Se diseñaron prototipos interactivos en Figma para las versiones móvil y web, cubriendo todas las funcionalidades definidas en los requerimientos.

### 🔗 Prototipo Interactivo en Figma

**[Ver Prototipo Completo →]https://www.figma.com/design/wiRkyfgUn2k9aq9kdSNkug/Mockups?node-id=18-2&t=r1KbuVtDWPgA7QMF-1**

### Pantallas prototipadas

| # | Pantalla | Funcionalidad (RF) | Descripción |
|---|----------|-------------------|-------------|
| 1 | Landing / Inicio | — | Página pública con información del sistema, estadísticas y acceso a ClaveÚnica. |
| 2 | Login con ClaveÚnica | RF-09 | Botón oficial de ClaveÚnica, información de ayuda y pie de seguridad. |
| 3 | Selector de Rol | RF-10 | Modal post-autenticación para funcionarios: elegir entre Paciente o Funcionario. |
| 4 | Dashboard Paciente | RF-01, RF-04 | Resumen de listas activas, próxima cita, acciones rápidas y notificaciones recientes. |
| 5 | Mi Lista de Espera | RF-01 | Detalle de posición, barra de progreso, tiempo estimado y prioridad. |
| 6 | Solicitar Cita | RF-02 | Formulario multi-paso (especialidad → centro → horario → confirmación). |
| 7 | Historial de Atenciones | RF-03 | Línea temporal de citas pasadas con notas clínicas. |
| 8 | Centros de Salud | RF-05 | Directorio con ocupación, tiempos y especialidades por centro. |
| 9 | Notificaciones | RF-04 | Centro de alertas con estado leído/no leído. |
| 10 | Dashboard Admin | RF-07 | Métricas, gráfico de demanda por especialidad, ocupación por centro. |
| 11 | Gestión de Listas | RF-06 | Tabla CRUD con filtros, búsqueda y acciones por registro. |
| 12 | Estadísticas | RF-08 | Gráficos comparativos y estado por centro con tabla detallada. |

> **Nota sobre Login/Registro:** Siguiendo el Instructivo Presidencial, se utiliza exclusivamente ClaveÚnica como mecanismo de autenticación. No existe registro local. Los mockups incluyen el formulario de ClaveÚnica (RUT + contraseña) como referencia visual del flujo de autenticación delegada.

<!-- Los mockups se encuentran también en la carpeta /otros/mockups/ -->

---

## EP 1.4: Arquitectura de Navegación y Experiencia del Usuario

### Diagramas

- **[Mapa de Navegación →](https://whimsical.com/gabo7845/mapa-de-navegacion-DtenZv4SmmE5SSwnnExByc)**

El diagrama de navegación define la arquitectura de rutas y jerarquía de vistas de la plataforma, organizando el acceso a funcionalidades según el tipo de usuario.

La navegación se estructura mediante rutas públicas y protegidas, permitiendo que pacientes y administradores accedan únicamente a los módulos correspondientes a su rol. El diseño prioriza simplicidad de navegación, claridad visual y escalabilidad de la arquitectura frontend, manteniendo una experiencia consistente entre dispositivos web y móviles.

- **[Flujo de Datos (Task Flow) →](https://whimsical.com/gabo7845/flujo-de-datos-LEkfVXA4Q9x6f6thfc2Nft)**

El diagrama de flujo de datos representa la interacción entre los distintos módulos del sistema, mostrando el proceso de autenticación mediante ClaveÚnica, validación de usuarios y derivación de funcionalidades según el rol asignado.

El flujo contempla operaciones principales para pacientes, como consulta de listas de espera, historial médico y solicitud de citas, así como funcionalidades administrativas orientadas a la gestión de listas, métricas y reportes del sistema. La estructura busca garantizar una separación clara de responsabilidades y un flujo de información coherente entre las distintas capas de la aplicación.


<!-- Los diagramas se encuentran también en la carpeta /otros/diagramas/ -->

### (a) Rutas principales y secundarias

```
Rutas Públicas (sin autenticación)
├── /                         → Landing Page
├── /login                    → Página de ClaveÚnica
└── /auth/callback            → Callback OAuth (recibe code + state)

Rutas Protegidas — Paciente (/paciente/*)
├── /paciente/dashboard       → Panel principal del paciente
├── /paciente/lista-espera    → Mi lista de espera
├── /paciente/solicitar-cita  → Formulario de solicitud de cita
├── /paciente/historial       → Historial de atenciones
├── /paciente/centros         → Directorio de centros de salud
└── /paciente/notificaciones  → Centro de notificaciones

Rutas Protegidas — Administrador (/admin/*)
├── /admin/dashboard          → Panel de administración
├── /admin/listas             → Gestión de listas de espera
└── /admin/estadisticas       → Estadísticas del sistema
```

### (b) Relaciones jerárquicas entre vistas

```
SaludSD (Root)
├── Nivel Público
│   ├── Landing (información + acceso)
│   └── Autenticación ClaveÚnica
│       ├── Login (botón oficial)
│       ├── Portal ClaveÚnica (externo)
│       └── Callback OAuth
│           └── Selector de Rol (si es staff)
├── Nivel Paciente
│   ├── Dashboard (hub central)
│   │   ├── → Mi Lista de Espera
│   │   ├── → Solicitar Cita
│   │   ├── → Historial
│   │   ├── → Centros de Salud
│   │   └── → Notificaciones
│   └── Navbar (navegación persistente)
└── Nivel Administrador
    ├── Dashboard (hub central)
    │   ├── → Gestión de Listas (CRUD)
    │   └── → Estadísticas
    └── Navbar (navegación persistente + switch de rol)
```

### (c) Flujo de navegación entre funcionalidades

El flujo principal sigue el patrón: **Landing → ClaveÚnica → [Selector de Rol] → Dashboard → Funcionalidad específica**.

Desde el Dashboard (ambos roles), el usuario accede a cualquier funcionalidad con un máximo de **1 clic** gracias a la barra de navegación persistente y las tarjetas de acceso rápido.

### (d) Diferenciación de acceso según roles

| Aspecto | Paciente | Funcionario (Admin/SOME) |
|---------|----------|--------------------------|
| Rutas accesibles | `/paciente/*` | `/admin/*` |
| Navbar | Dashboard, Mi Lista, Solicitar Cita, Historial | Dashboard, Listas de Espera, Estadísticas |
| Densidad de info | Baja (datos personales) | Alta (datos agregados, tablas, gráficos) |
| Acciones | Consulta y solicitud | Gestión CRUD y reportes |
| Botón switch | "Funcionario" (si es staff) | "Paciente" (si es staff) |

Los funcionarios de salud ven el **Selector de Rol** al autenticarse y pueden cambiar entre ambas vistas con el botón **↔ Paciente / Funcionario** en la navbar.

### (e) Flujo de principales tareas (Task Flow)

**Tarea: Consultar posición en lista de espera**
```
Paciente → ClaveÚnica → Dashboard → "Mi Lista" → Ver posición (#12 de 89) → Ver tiempo estimado (45 días)
```

**Tarea: Solicitar una cita médica**
```
Paciente → Dashboard → "Solicitar Cita" → Paso 1: Especialidad → Paso 2: Centro → Paso 3: Horario → Confirmar
```

**Tarea: Gestionar lista de espera (admin)**
```
Funcionario → Dashboard → "Listas de Espera" → Filtrar por especialidad/estado → Editar registro → Guardar
```

### (f) Puntos críticos de interacción

1. **Autenticación con ClaveÚnica:** Punto de control donde se redirige al portal externo del gobierno. Si falla, el usuario debe reintentar. Se muestra una pantalla de carga ("Verificando identidad...") durante el callback.
2. **Selector de Rol:** Decisión binaria post-login para funcionarios. Es bloqueante (debe elegir para continuar).
3. **Formulario multi-paso de cita:** 3 pasos secuenciales con validación en cada uno. El usuario puede retroceder pero no avanzar sin completar el paso actual.

### (g) Coherencia de experiencia entre dispositivos

- **Móvil (Pacientes):** Navegación vertical, tarjetas apiladas, tipografía grande, acciones con botones prominentes. Jerarquía favorece acceso rápido a tiempos de espera.
- **Escritorio (Administradores):** Layout en columnas, tablas con múltiples columnas, gráficos de barras, filtros laterales. Prioriza visualización de datos complejos y gestión administrativa.
- **Componentes compartidos:** Navbar y footer se adaptan responsivamente. El Framework Gobierno de Chile garantiza consistencia visual entre dispositivos.

### (h) Justificación técnica de las decisiones

- **ClaveÚnica como único mecanismo de autenticación:** Cumple con el Instructivo Presidencial y elimina la necesidad de registro local, simplificando la arquitectura y mejorando la seguridad.
- **Separación por roles en rutas:** Facilita la implementación de rutas protegidas y la escalabilidad futura (agregar nuevos roles).
- **Navegación por navbar persistente:** Reduce el número de clics para acceder a cualquier funcionalidad (máximo 1 clic desde cualquier vista).
- **Formulario multi-paso:** Mejora la usabilidad en móvil al evitar formularios largos, guiando al usuario paso a paso.
- **Dashboard como hub central:** Patrón probado que permite al usuario ver un resumen y elegir su siguiente acción.

---

## EP 1.5: Proyecto Ionic + React

### (a) Uso de React Router

La aplicación utiliza `react-router-dom` v5 integrado con `@ionic/react-router` (`IonReactRouter` + `IonRouterOutlet`) para gestionar la navegación SPA con transiciones nativas de Ionic.

```tsx
// App.tsx — Configuración de rutas
<IonReactRouter>
  <IonRouterOutlet>
    <Route exact path="/" component={Landing} />
    <Route exact path="/login" component={Login} />
    <Route exact path="/auth/callback" component={AuthCallback} />
    <Route exact path="/paciente/dashboard" component={PatientDashboard} />
    {/* ... más rutas */}
    <Route><Redirect to="/" /></Route>
  </IonRouterOutlet>
</IonReactRouter>
```

### (b) Rutas públicas y protegidas

| Tipo | Rutas | Acceso |
|------|-------|--------|
| **Públicas** | `/`, `/login`, `/auth/callback` | Sin autenticación |
| **Protegidas (Paciente)** | `/paciente/*` | Requiere ClaveÚnica + rol paciente |
| **Protegidas (Admin)** | `/admin/*` | Requiere ClaveÚnica + rol admin |

La protección se gestiona mediante `AuthContext` que verifica la sesión del usuario y su rol activo.

### (c) Redirecciones

- **Sin sesión → Landing:** El fallback `<Redirect to="/" />` redirige rutas no encontradas al inicio.
- **Post-login → Dashboard:** Tras la autenticación, el usuario es redirigido al dashboard correspondiente a su rol.
- **Logout → Landing:** Al cerrar sesión, se redirige al inicio y (en producción) se llama al endpoint de logout de ClaveÚnica.

### (d) Estructura modular de vistas

```
src/
├── App.tsx                          # Router principal (12 rutas)
├── main.tsx                         # Entry point
├── components/
│   ├── GobNavbar.tsx                # Navbar institucional (dinámico por rol)
│   └── GobFooter.tsx                # Footer con datos de la municipalidad
├── pages/
│   ├── Landing.tsx                  # Página pública
│   ├── Login.tsx                    # ClaveÚnica + Selector de rol
│   ├── AuthCallback.tsx             # Callback OAuth
│   ├── patient/
│   │   ├── Dashboard.tsx
│   │   ├── WaitList.tsx
│   │   ├── RequestAppointment.tsx
│   │   ├── History.tsx
│   │   ├── HealthCenters.tsx
│   │   └── Notifications.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── ManageLists.tsx
│       └── Statistics.tsx
├── services/
│   ├── AuthContext.tsx               # Contexto de autenticación (ClaveÚnica)
│   └── mockData.ts                  # Datos simulados + tipos + validación RUT
└── theme/
    ├── variables.css                 # Variables Ionic + paleta Gobierno
    └── global.css                    # Estilos globales personalizados
```

---

## EP 1.6: Pantallas Principales Implementadas

Se implementaron múltiples pantallas funcionales utilizando Ionic + React, manteniendo coherencia visual y separación estructural entre módulos de paciente y administrador.

### Pantallas Principales

#### Paciente

- Dashboard principal
- Lista de espera
- Solicitud de citas
- Historial médico
- Centros de salud
- Notificaciones
#### Administrador

- Dashboard administrativo
- Gestión de listas
- Estadísticas y métricas

### Componentes Implementados

#### Las vistas incorporan componentes reutilizables y elementos visuales adaptativos como:

- Navbar institucional
- Footer institucional
- Formularios multi-paso
- Tarjetas informativas
- Barras de progreso
- Tablas administrativas
- Filtros y búsqueda
- Indicadores visuales de estado

### Separación estructural

```
src/
├── pages/          → Vistas organizadas por rol (patient/, admin/)
├── components/     → Componentes reutilizables (GobNavbar, GobFooter)
├── services/       → Lógica de negocio y datos (AuthContext, mockData)
└── theme/          → Estilos y variables CSS
```


---

## EP 2.2: Modelo Relacional y Base de Datos

El sistema de SaludSD utiliza una base de datos relacional para garantizar la integridad, consistencia y trazabilidad de la información de salud comunal.

### Diagrama del Modelo Relacional
El diagrama físico del modelo relacional se encuentra disponible en la carpeta `/otros/diagramas/modelo_relacional.png` y se detalla a continuación:

![Modelo Relacional de Base de Datos](file:///c:/Users/matia/OneDrive/Desktop/Web%20y%20movil/saludsd/otros/diagramas/modelo_relacional.png)

### Tablas y Relaciones DDL (`schema.sql`)
1. **`usuarios`**: Almacena el perfil (pacientes y funcionarios) con restricciones de RUT único y email único. Las contraseñas se almacenan cifradas (`password_hash`).
2. **`centros_salud`**: Registra los CESFAM y Postas rurales con su dirección, capacidad de atención y tiempos estimados promedio.
3. **`especialidades_centro`**: Tabla intermedia que vincula los centros con sus especialidades médicas específicas (Relación N:M resuelta).
4. **`lista_espera`**: Controla las derivaciones médicas con llaves foráneas a `usuarios` y `centros_salud`. Registra fecha de solicitud, prioridad y posición calculada dinámicamente.
5. **`citas`**: Registra la agenda de horas programadas o confirmadas de los pacientes.
6. **`notificaciones`**: Almacena el centro de notificaciones de cada usuario, marcando el flag de leída/no leída.

---

## EP 2.3: API RESTful

El servidor backend está desarrollado en **Node.js + Express** con **TypeScript**. Expone una interfaz RESTful que maneja formatos JSON para las solicitudes y respuestas de datos e implementa códigos de estado HTTP estándar (200, 201, 400, 401, 403, 404, 500).

### Detalle de Endpoints Disponibles

#### 🔐 Autenticación y Cuentas (`/api/auth`)
* `POST /api/auth/register` - Registro local de pacientes (valida RUT, encripta clave, genera JWT).
* `POST /api/auth/login` - Inicio de sesión local (RUT + Contraseña, genera JWT).
* `POST /api/auth/claveunica/callback` - Simulación del callback OIDC de ClaveÚnica para testing rápido.
* `GET /api/auth/me` - [Protegido] Retorna los datos del usuario en sesión extraídos del token JWT.

#### 📋 Listas de Espera (`/api/waitlist`)
* `GET /api/waitlist` - [Protegido] Retorna la lista de espera (solo la propia para Pacientes, todas para Funcionarios SOME con filtros).
* `POST /api/waitlist` - [Protegido] Crea una derivación/solicitud y calcula la posición en cola de forma dinámica.
* `PUT /api/waitlist/:id` - [Protegido, Solo Funcionario] Actualiza prioridad, estado o centro de derivación.
* `DELETE /api/waitlist/:id` - [Protegido, Solo Funcionario] Elimina una derivación de la lista.

#### 🏥 Directorio de Salud (`/api/health-centers`)
* `GET /api/health-centers` - Retorna los centros activos de la comuna, especialidades ofertadas y ocupación.

#### 📅 Citas Médicas (`/api/appointments`)
* `GET /api/appointments` - [Protegido] Historial de citas agendadas, finalizadas y canceladas del paciente.

#### 🔔 Notificaciones (`/api/notifications`)
* `GET /api/notifications` - [Protegido] Alertas de avance en cola de espera y recordatorios.
* `PUT /api/notifications/:id/read` - [Protegido] Marca la notificación como leída en la base de datos.

#### 📊 Estadísticas y Reportes (`/api/stats`)
* `GET /api/stats` - Retorna indicadores clave de rendimiento (KPIs, pacientes por especialidad, saturación por centro) para el dashboard del funcionario de SOME.

---

## EP 2.6: Seguridad y Manejo de Sesiones

Para cumplir con las restricciones técnicas y normativas de seguridad, se incorporaron las siguientes prácticas:

1. **Hash de Contraseñas (Bcrypt):** Las claves se encriptan con `bcryptjs` usando un factor de costo (salt) de 10. Nunca se guardan contraseñas en texto plano.
2. **Consultas Parametrizadas (Inyección SQL):** Se rechaza la concatenación de strings en sentencias SQL. Todas las consultas al pool de conexiones utilizan placeholders para separar estrictamente el código del dato.
3. **Mapeo de Tokens JWT:** El backend firma tokens de sesión con una firma robusta de 256 bits (`jsonwebtoken`). El frontend (`api.ts`) posee un **Interceptor de Peticiones** para inyectar la cabecera `Authorization: Bearer <token>` y un **Interceptor de Respuestas** para capturar códigos `401` y purgar la sesión automáticamente ante tokens vencidos.
4. **Validación del Algoritmo del RUT:** Tanto en el formulario web como en el backend se procesa el dígito verificador bajo el algoritmo chileno de Módulo 11, rechazando el ingreso o registro ante RUTs inconsistentes.

---

## Instalación y Ejecución

### Prerrequisitos
* [Node.js](https://nodejs.org/) v20 o superior
* MySQL 8.0 activo en tu máquina local

### 1. Configuración de Variables de Entorno
Crea o edita el archivo `backend/.env` con la configuración de tu entorno:
```env
PORT=5000
DB_USER=root
DB_PASSWORD=tu_contraseña_root_mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=saludsd
JWT_SECRET=saludsd_secret_key_for_jwt_2026_primary_health_sec!
JWT_EXPIRES_IN=7d
```

### 2. Inicialización de la Base de Datos (Semilla)
Ejecuta el script de semilla para crear la base de datos, las tablas y poblar las credenciales de prueba en MySQL:
```bash
cd backend
npm install
npm run seed
```

### 3. Iniciar el Servidor de API (Backend)
Inicia el servidor en modo desarrollo (correrá en http://localhost:5000):
```bash
npm run dev
```

### 4. Iniciar la Aplicación Frontend
En otra ventana de terminal en la raíz del proyecto, instala dependencias e inicia el frontend (correrá en http://localhost:5173/):
```bash
npm install
npm run dev
```

### Credenciales de Demostración Sembradas
Puedes acceder e interactuar con la base de datos en tiempo real usando:

| Perfil | RUT | Contraseña |
|---|---|---|
| **Paciente** (María González) | `12.345.678-5` | `123456` |
| **Funcionario** (Dr. Carlos Muñoz) | `9.876.543-3` | `123456` |

---

## Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Ionic + React | 8.5 / 19.0 |
| Backend | Node.js + Express | 20.x / 4.19 |
| Base de Datos | MySQL (MySQL80 Service) | 8.0 |
| Lenguaje | TypeScript (ESM) | 5.4 / 5.9 |
| Autenticación | JSON Web Tokens (JWT) / ClaveÚnica Sim. | OAuth 2.0 |
| Cifrado | Bcrypt | 2.4 |
| Cliente HTTP | Axios con Interceptores | 1.16 |
| Build Tool | Vite | 5.x |
| Testing | Cypress + Vitest | 13.x / 0.34 |

---

## Entregables Adicionales (Carpeta `/otros`)
Dentro de la carpeta `otros/` en la raíz del proyecto se incluyen los siguientes recursos para la evaluación:
* 📂 **`diagramas/modelo_relacional.png`**: Diagrama de la base de datos relacional MySQL.
* 📄 **`evidencia_pruebas.md`**: Detalle de las respuestas JSON, estructuras de datos y políticas de seguridad aplicadas.
* 📄 **`SaludSD_API_Collection.postman_collection.json`**: Colección de Postman lista para importar y ejecutar pruebas funcionales de todos los endpoints.

---

## Licencia
Proyecto académico — Universidad. Todos los derechos reservados.
