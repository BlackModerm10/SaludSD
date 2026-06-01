# Evidencia de Pruebas y Seguridad — SaludSD (EP2)

Este documento detalla las evidencias de las pruebas funcionales, la documentación de los endpoints de la API y las medidas de seguridad implementadas en el backend de la plataforma SaludSD.

---

## 1. Documentación de Endpoints y Respuestas JSON

La API de SaludSD está montada en el puerto `5000` bajo el prefijo `/api`. A continuación se documenta el comportamiento de los endpoints principales probados localmente.

### A. Autenticación (`/api/auth`)

#### 1. POST `/api/auth/register` (Registro Local de Pacientes)
* **Descripción:** Registra un nuevo paciente en la base de datos MySQL. Cifra la contraseña con bcrypt y genera un token JWT.
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
      "nombre": "Juan Martínez López",
      "rut": "15.678.234-3",
      "email": "juan.martinez@email.com",
      "password": "123456",
      "region": "Valparaíso",
      "comuna": "Santo Domingo"
  }
  ```
* **Respuesta Exitosa (HTTP 201 Created):**
  ```json
  {
      "message": "Usuario registrado exitosamente.",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
          "id": "e44c21ad-467f-4b05-b1a7-5509d73d40cb",
          "nombre": "Juan Martínez López",
          "rut": "15.678.234-3",
          "email": "juan.martinez@email.com",
          "role": "paciente"
      }
  }
  ```
* **Respuesta RUT Repetido (HTTP 400 Bad Request):**
  ```json
  {
      "error": "El RUT ya se encuentra registrado."
  }
  ```

#### 2. POST `/api/auth/login` (Inicio de Sesión Local)
* **Descripción:** Autentica a un usuario y le proporciona un token JWT.
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
      "rut": "12.345.678-5",
      "password": "123456"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
      "message": "Autenticación exitosa.",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
          "id": "a90df21f-829d-4742-bd09-6bc28c9b3294",
          "nombre": "María González Pérez",
          "rut": "12.345.678-5",
          "email": "maria.gonzalez@email.com",
          "role": "paciente"
      }
  }
  ```

#### 3. GET `/api/auth/me` (Obtener Perfil Protegido)
* **Descripción:** Obtiene los datos del usuario actualmente autenticado mediante el JWT de las cabeceras.
* **Cabecera Requerida:** `Authorization: Bearer <token_jwt>`
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
      "user": {
          "id": "a90df21f-829d-4742-bd09-6bc28c9b3294",
          "nombre": "María González Pérez",
          "rut": "12.345.678-5",
          "email": "maria.gonzalez@email.com",
          "role": "paciente",
          "region": "Valparaíso",
          "comuna": "Santo Domingo"
      }
  }
  ```

---

### B. Listas de Espera (`/api/waitlist`)

#### 1. GET `/api/waitlist`
* **Descripción:** Obtiene las derivaciones en lista de espera.
  * Si el token corresponde a un **Paciente**, devuelve exclusivamente sus registros.
  * Si corresponde a un **Funcionario (Admin)**, retorna todos los registros de la comuna con capacidad de paginado y búsqueda.
* **Cabecera Requerida:** `Authorization: Bearer <token_jwt>`
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  [
      {
          "id": "673f4fae-128a-40df-b210-449e7b23cf44",
          "paciente_id": "a90df21f-829d-4742-bd09-6bc28c9b3294",
          "especialidad": "Cardiología",
          "centro_id": "hc1",
          "fecha_solicitud": "2026-02-15",
          "prioridad": "normal",
          "estado": "en_espera",
          "tiempo_estimado_dias": 45,
          "posicion": 12,
          "centro_nombre": "CESFAM Santo Domingo"
      }
  ]
  ```

#### 2. POST `/api/waitlist`
* **Descripción:** Agrega una nueva solicitud de interconsulta para el paciente en sesión. Calcula la posición en base al número actual de pacientes en la misma especialidad y centro.
* **Cabecera Requerida:** `Authorization: Bearer <token_jwt>`
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
      "especialidad": "Cardiología",
      "centro_id": "hc1",
      "prioridad": "normal"
  }
  ```
* **Respuesta Exitosa (HTTP 201 Created):**
  ```json
  {
      "message": "Agregado exitosamente a la lista de espera.",
      "entry": {
          "id": "2b83ef4a-a92c-474d-847e-fc773952f440",
          "paciente_id": "a90df21f-829d-4742-bd09-6bc28c9b3294",
          "especialidad": "Cardiología",
          "centro_id": "hc1",
          "fecha_solicitud": "2026-06-01",
          "prioridad": "normal",
          "estado": "en_espera",
          "tiempo_estimado_dias": 30,
          "posicion": 13
      }
  }
  ```

#### 3. PUT `/api/waitlist/:id` (Solo Administradores)
* **Descripción:** Permite a un funcionario del SOME derivar de centro, actualizar prioridad o estado de una interconsulta.
* **Cabecera Requerida:** `Authorization: Bearer <token_jwt_admin>`
* **Cuerpo de Solicitud (JSON):**
  ```json
  {
      "prioridad": "alta",
      "estado": "programada",
      "centro_id": "hc1"
  }
  ```
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
      "message": "Registro de lista de espera actualizado con éxito."
  }
  ```

#### 4. DELETE `/api/waitlist/:id` (Solo Administradores)
* **Descripción:** Remueve una interconsulta de la base de datos de manera permanente.
* **Cabecera Requerida:** `Authorization: Bearer <token_jwt_admin>`
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
      "message": "Registro eliminado exitosamente."
  }
  ```

---

### C. Estadísticas del Dashboard (`/api/stats`)

#### 1. GET `/api/stats`
* **Descripción:** Proporciona datos agregados para el tablero principal del SOME. Es consumido por el frontend para renderizar gráficos de barras y KPIs.
* **Respuesta Exitosa (HTTP 200 OK):**
  ```json
  {
      "totalPacientesEspera": 6,
      "tiempoPromedioEspera": 40,
      "citasHoy": 0,
      "citasSemana": 0,
      "especialidadMasDemandada": "Ginecología",
      "centroMasSaturado": "Posta Rural San Enrique",
      "tendencia": "estable",
      "porEspecialidad": [
          { "nombre": "Ginecología", "cantidad": 1, "promedioDias": 35 },
          { "nombre": "Cardiología", "cantidad": 1, "promedioDias": 45 }
      ],
      "porCentro": [
          { "nombre": "CESFAM Santo Domingo", "ocupacion": 87, "enEspera": 4 },
          { "nombre": "Posta Rural San Enrique", "ocupacion": 95, "enEspera": 2 }
      ]
  }
  ```

---

## 2. Evidencia de Implementación de Seguridad (EP 2.6)

### A. Validación de Inputs
Tanto en el registro como en el login del backend (`auth.routes.ts`), se realizan validaciones exhaustivas:
* **Campos Requeridos:** Rechazo con `HTTP 400` ante la ausencia de campos obligatorios.
* **Algoritmo RUT:** Se aplica la fórmula del Módulo 11 chileno para verificar el dígito verificador. Si es incorrecto, retorna `El RUT ingresado no es válido.` antes de realizar consultas.
* **Largo de Contraseñas:** Se exige una longitud mínima de 6 caracteres.

### B. Encriptación con Bcrypt
Las contraseñas de los usuarios locales nunca se almacenan en texto plano en MySQL:
* Se generan llaves de encriptación seguras usando un factor de costo (`salt`) de 10: `bcrypt.genSaltSync(10)`.
* Se almacena el hash irreversible en la columna `password_hash`: `bcrypt.hashSync(password, salt)`.
* Para la autenticación se utiliza `bcrypt.compareSync` garantizando que no se puedan revertir las contraseñas ni siquiera en caso de filtración de la base de datos.

### C. Protección Contra Inyección SQL
Todas las transacciones de datos se gestionan mediante **consultas preparadas parametrizadas**. El módulo de conexión `db.ts` encapsula las peticiones al motor utilizando placeholders (`$1`, `$2` en sintaxis genérica y traduciéndolas a `?` para MySQL):
```typescript
const [rows] = await pool.query(mysqlText, params);
```
Esto asegura que el driver de MySQL trate los parámetros provistos por el usuario estrictamente como datos literales y no como código ejecutable, neutralizando ataques de inyección SQL en todos los endpoints de la aplicación.

### D. Interceptores de Sesión en el Frontend
* **Inyección de JWT:** El interceptor de solicitudes de Axios adjunta dinámicamente el token almacenado:
  ```javascript
  config.headers.Authorization = `Bearer ${token}`;
  ```
* **Manejo de Expiración (401):** Si el token JWT expira o es revocado, el backend responde con un código `HTTP 401 Unauthorized`. El interceptor de respuestas del frontend lo captura, limpia el `localStorage` de manera limpia y redirige automáticamente al usuario al `/login`.

---

## 3. Evidencias de Pruebas Funcionales (Capturas y Logs)
Las pruebas fueron validadas satisfactoriamente usando herramientas de consola de desarrollo de node:
1. El script de inicialización borra, estructura y siembra las tablas en MySQL de forma transaccional libre de fallas.
2. Los tokens JWT se firman exitosamente con el secreto `JWT_SECRET` y expiran de forma controlada según el parámetro `JWT_EXPIRES_IN=7d`.
3. Intentar acceder a rutas administrativas con un token de Paciente retorna un código `HTTP 403 Forbidden` bloqueando el acceso al SOME no autorizado.
