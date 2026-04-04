# Nothyra — Guía Técnica de Implementación

> **App:** Nothyra v2.0.3 · **Autor:** NovaAlex Labs  
> **Plataforma:** Android (principal)· Web  
> **Repositorio:** github.com/alexandernovadev/nothyra  
> **Periodo de desarrollo:** Febrero – Abril 2026

---

## Índice general

- [Paso 0 — Análisis de requerimientos](#paso-0--análisis-de-requerimientos)
- [Paso 1 — Configuración del entorno y estructura base](#paso-1--configuración-del-entorno-y-estructura-base)
- [Paso 2 — Autenticación](#paso-2--autenticación)
- [Paso 3 — Módulo Síntomas](#paso-3--módulo-síntomas)
- [Paso 4 — Módulo Recetas y Blog](#paso-4--módulo-recetas-y-blog)
- [Paso 5 — Módulo Recordatorios y Notificaciones](#paso-5--módulo-recordatorios-y-notificaciones)
- [Paso 6 — Home, Alimentación, Más y cierre](#paso-6--home-alimentación-más-y-cierre)

---

---

# Paso 0 — Análisis de requerimientos

> **Fecha:** Finales de febrero 2026  
> **Objetivo:** Determinar qué construir, para quién, con qué tecnología y bajo qué restricciones antes de escribir una sola línea de código.

---

## 0.1 Contexto y problema a resolver

**Nothyra** es una aplicación móvil de acompañamiento de salud orientada a personas con condiciones tiroideas (hipotiroidismo, hipertiroidismo) que necesitan:

- Registro diario de síntomas, niveles de energía y estado de ánimo.
- Recordatorios para no olvidar tomar medicación (ej. Levotiroxina).
- Acceso a recetas de alimentación adaptadas a su condición.
- Artículos y consejos de salud relevantes en español.

El problema: no existe una herramienta unificada, en español, simple y enfocada en este perfil de usuario.

---

## 0.2 Público objetivo

| Perfil            | Descripción                                                           |
| ----------------- | --------------------------------------------------------------------- |
| **Usuario final** | Persona con condición tiroidea. Gestiona su propia medicación y dieta |
| **Administrador** | Equipo de Nothyra. Publica recetas y artículos de salud               |

**Plataformas objetivo:** Android (APK, prioritario) · iOS (soporte futuro) · Web (preview/demo)

---

## 0.3 Módulos y pantallas identificadas

Se identificaron **5 módulos** mapeados a los tabs de navegación. Total: **18 pantallas**.

### Autenticación (sin tab bar)

| #   | Pantalla | Descripción                               |
| --- | -------- | ----------------------------------------- |
| 1   | Login    | Email + contraseña, opción Google Sign-In |
| 2   | Registro | Nombre, email, contraseña                 |

Regla: autenticación **obligatoria**. No hay modo invitado.

---

### Home

| #   | Pantalla | Descripción                                                     |
| --- | -------- | --------------------------------------------------------------- |
| 3   | Home     | Dashboard: saludo, preview de 3 recetas y 2 artículos recientes |

```
Hola, [nombre]
Recetas y lecturas para cuidarte
─────────────────────────────────
🍽 Recetas recientes        [Ver todas]
[ Card ] [ Card ] [ Card ]

📰 Artículos de salud       [Ver todos]
[ Card blog ]
[ Card blog ]
```

---

### Síntomas

| #   | Pantalla        | Descripción                               |
| --- | --------------- | ----------------------------------------- |
| 4   | Lista           | Historial de registros ordenado por fecha |
| 5   | Nuevo registro  | Formulario del día                        |
| 6   | Editar registro | Mismo formulario con datos precargados    |

**Campos del registro:**

| Campo            | Tipo           | Valores                          |
| ---------------- | -------------- | -------------------------------- |
| Fecha            | auto `dateKey` | `YYYY-MM-DD`                     |
| Nivel de energía | selector       | `very_low · low · normal · high` |
| Estado de ánimo  | selector       | `depressed · normal · cheerful`  |
| Síntomas         | multi-select   | 8 síntomas predefinidos          |
| Notas            | textarea       | Texto libre                      |

**Los 8 síntomas predefinidos:**

```
Cansancio extremo · Sensibilidad al frío · Sensibilidad al calor · Piel seca
Ansiedad · Sentimientos de depresión · Dificultad para concentrarse · Problemas para dormir
```

---

### Recordatorios

| #   | Pantalla | Descripción                                   |
| --- | -------- | --------------------------------------------- |
| 7   | Lista    | Recordatorios del usuario, ordenados por hora |
| 8   | Nuevo    | Etiqueta + hora                               |
| 9   | Editar   | Mismo formulario con datos precargados        |

**Flujo funcional definido en el análisis:**

```
Crear   → pedir permisos → programar notificación diaria → guardar ID de notificación
Editar  → cancelar notif anterior → reprogramar → guardar nuevo ID
Activar/Desactivar → cancelar o reprogramar según estado
Eliminar → cancelar notif → borrar registro en base de datos
```

---

### Alimentación (Nutrición)

| #   | Pantalla          | Descripción                        |
| --- | ----------------- | ---------------------------------- |
| 10  | Lista de recetas  | Catálogo filtrable por categoría   |
| 11  | Detalle de receta | Ingredientes, pasos, info completa |
| 12  | Modal de preview  | Vista rápida sin salir de la lista |

**Categorías:** `Desayuno · Almuerzo · Cena · Snack · Postre`

---

### Más (Perfil + Admin)

| #   | Pantalla                       | Disponible para |
| --- | ------------------------------ | --------------- |
| 13  | Hub "Más"                      | Todos           |
| 14  | Editar perfil                  | Todos           |
| 15  | Admin — Lista de recetas       | Solo admin      |
| 16  | Admin — Formulario de receta   | Solo admin      |
| 17  | Admin — Lista de blog          | Solo admin      |
| 18  | Admin — Formulario de artículo | Solo admin      |

---

## 0.4 Formularios identificados

### Login

| Campo    | Validación               |
| -------- | ------------------------ |
| email    | Requerido, formato email |
| password | Requerido                |

### Registro

| Campo    | Validación                     |
| -------- | ------------------------------ |
| name     | Opcional                       |
| email    | Requerido, formato email       |
| password | Requerido, mínimo 6 caracteres |

### Formulario de síntoma

| Campo       | Validación                       |
| ----------- | -------------------------------- |
| dateKey     | Auto-generado                    |
| energyLevel | Requerido, enum de 4 valores     |
| mood        | Requerido, enum de 3 valores     |
| symptoms    | Array, puede estar vacío         |
| notes       | Opcional, máximo 2000 caracteres |

### Formulario de recordatorio

| Campo  | Validación      |
| ------ | --------------- |
| label  | Requerido       |
| hour   | Requerido, 0–23 |
| minute | Requerido, 0–59 |

### Formulario de receta (admin)

| Campo       | Tipo           | Validación                   |
| ----------- | -------------- | ---------------------------- |
| title       | texto          | Requerido                    |
| description | textarea       | Requerido                    |
| imageUrl    | url / upload   | Requerido                    |
| category    | selector       | Enum de 5 valores            |
| prepTime    | número         | Requerido, > 0               |
| servings    | número         | Requerido, > 0               |
| difficulty  | selector       | fácil · media · difícil      |
| ingredients | lista dinámica | Mínimo 1 (nombre + cantidad) |
| steps       | lista dinámica | Mínimo 1                     |
| tags        | etiquetas      | Opcional                     |
| status      | toggle         | borrador · publicado         |

### Formulario de artículo de blog (admin)

| Campo         | Tipo              | Validación           |
| ------------- | ----------------- | -------------------- |
| title         | texto             | Requerido            |
| excerpt       | resumen corto     | Requerido            |
| coverImageUrl | url               | Requerido            |
| author        | texto             | Requerido            |
| content       | lista de párrafos | Mínimo 1             |
| tags          | etiquetas         | Opcional             |
| status        | toggle            | borrador · publicado |

---

## 0.5 Modelo de datos preliminar

Cinco colecciones en la base de datos:

| Colección     | Propietario | Campos principales                                         |
| ------------- | ----------- | ---------------------------------------------------------- |
| `users`       | Sistema     | uid, email, displayName, role, createdAt                   |
| `symptomLogs` | Usuario     | userId, dateKey, energyLevel, mood, symptoms[], notes      |
| `reminders`   | Usuario     | userId, label, hour, minute, enabled, notificationId       |
| `recipes`     | Admin       | title, category, ingredients[], steps[], status, createdBy |
| `blogPosts`   | Admin       | title, excerpt, content[], author, status, createdBy       |

---

## 0.6 Roles de usuario

| Rol     | Capacidades                                                                                 |
| ------- | ------------------------------------------------------------------------------------------- |
| `user`  | Ver recetas/blog publicados, registrar síntomas, gestionar sus recordatorios, editar perfil |
| `admin` | Todo lo anterior + CRUD de recetas y blog, ver borradores, cargar datos semilla             |

El rol se almacena en la base de datos al crear la cuenta. Valor por defecto: `user`. El rol `admin` se asigna manualmente.

---

## 0.7 Reglas de negocio

1. Un usuario solo puede leer y escribir sus propios registros de síntomas y recordatorios.
2. Las recetas y artículos publicados son visibles para cualquier usuario autenticado. Los borradores solo los ve el admin.
3. Solo el admin puede crear, editar y eliminar recetas y artículos.
4. El perfil de usuario se crea automáticamente al primer login. No se puede eliminar desde la app.
5. Todo recordatorio activo tiene su ID de notificación guardado para poder cancelarlo.

---

## 0.8 Stack tecnológico decidido

| Categoría                  | Tecnología            | Justificación                                                        |
| -------------------------- | --------------------- | -------------------------------------------------------------------- |
| Framework                  | React Native + Expo   | Cross-platform iOS/Android/Web con una sola base de código           |
| Lenguaje                   | TypeScript            | Tipado estático para prevenir errores en producción                  |
| Routing                    | Expo Router v6        | Navegación por estructura de carpetas, rutas tipadas automáticamente |
| Base de datos              | Firestore (Firebase)  | Tiempo real, sin servidor propio, escalable                          |
| Autenticación              | Firebase Auth         | Email/contraseña + Google OAuth integrado                            |
| Almacenamiento de imágenes | Firebase Storage      | Imágenes de recetas y blog                                           |
| Formularios                | React Hook Form + Zod | Validación declarativa con tipos, sin código repetitivo              |
| Notificaciones             | expo-notifications    | Alertas diarias recurrentes locales en el dispositivo                |
| Imágenes galería           | expo-image-picker     | Acceso a galería del teléfono para fotos de recetas                  |
| Build y distribución       | EAS Build (Expo)      | Genera APK en la nube sin necesidad de Android Studio local          |

**Descartado:** modo oscuro (complejidad innecesaria en v1), modo invitado, servidor propio (Firebase es suficiente a esta escala).

---

---

# Paso 1 — Configuración del entorno y estructura base

> **Fecha:** 8–10 marzo 2026  
> **Objetivo:** Levantar el proyecto, conectar los servicios externos, definir la arquitectura de carpetas y dejar el entorno listo para desarrollar funcionalidades.

---

## 1.1 Creación del proyecto

El proyecto se generó desde la plantilla oficial de Expo, que entrega de fábrica la estructura de navegación, soporte TypeScript y los scripts de desarrollo. Inmediatamente después se eliminó el contenido de ejemplo para partir desde una base limpia.

---

## 1.2 Estructura de carpetas

La organización de carpetas sigue una separación clara por responsabilidad:

| Carpeta       | Qué contiene                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `app/`        | Todas las pantallas y la navegación. La estructura de subcarpetas define las rutas automáticamente |
| `components/` | Piezas visuales reutilizables, organizadas por módulo                                              |
| `constants/`  | Valores fijos: colores, etiquetas, enumeraciones del dominio                                       |
| `contexts/`   | Estado global compartido (sesión del usuario)                                                      |
| `lib/`        | Lógica de negocio: esquemas de validación, tipos de base de datos, acceso a notificaciones         |
| `data/`       | Archivos JSON con datos de prueba para poblar la base de datos inicial                             |
| `assets/`     | Imágenes, iconos y recursos visuales de la marca                                                   |
| `doc/`        | Esta documentación                                                                                 |

---

## 1.3 Configuración de Firebase

Se creó el proyecto `nothyra-d997e` en Firebase con tres servicios activos:

- **Firebase Auth** — gestión de usuarios y sesiones
- **Firestore** — base de datos principal
- **Firebase Storage** — almacenamiento de imágenes

**Decisión clave — doble configuración por plataforma:** Firebase maneja la persistencia de sesión de forma diferente en web (usa el almacenamiento del navegador) vs nativo (necesita almacenamiento del sistema operativo del teléfono). Se crearon dos archivos de configuración separados y el sistema selecciona automáticamente el correcto según la plataforma al compilar.

---

## 1.4 Sistema de navegación

Se usa Expo Router, que convierte la estructura de carpetas en rutas de navegación automáticamente. La organización de rutas refleja directamente la experiencia del usuario:

```
(auth)/          → Pantallas de login y registro (sin barra de tabs)
(tabs)/          → App principal (con barra de tabs)
  index          → Home
  symptoms/      → Síntomas (pantallas anidadas)
  reminders/     → Recordatorios (pantallas anidadas)
  nutrition      → Alimentación
  more/          → Más (pantallas anidadas con admin)
  recipes/       → Detalle de receta (oculto en la barra)
  blog/          → Detalle de artículo (oculto en la barra)
```

**Decisión clave — rutas ocultas:** `recipes/` y `blog/` viven dentro del grupo de tabs para heredar la barra inferior visualmente, pero no aparecen como botones en ella. Se accede a ellas desde Home y desde Alimentación.

**Redirección automática por sesión:** Al arrancar la app, antes de mostrar cualquier pantalla, el sistema verifica si hay sesión activa. Si no hay sesión → va a Login. Si hay sesión y el usuario intenta ir a Login → va a Home. Esta verificación es invisible para el usuario.

---

## 1.5 Estado global de autenticación

Un único componente central (`AuthContext`) mantiene el estado de la sesión disponible para toda la app. Cualquier pantalla puede saber si hay usuario, cuál es su rol y hacer logout sin pasar datos entre pantallas manualmente.

**Qué gestiona:**

| Dato              | Tipo              | Uso                                      |
| ----------------- | ----------------- | ---------------------------------------- |
| `user`            | objeto Firebase   | Identificación del usuario               |
| `isLoading`       | booleano          | Controla el spinner inicial              |
| `isAuthenticated` | booleano          | Shortcut para verificar sesión           |
| `role`            | `admin` \| `user` | Controla qué funcionalidades se muestran |
| `isAdmin`         | booleano          | Shortcut para verificar rol admin        |
| `logout`          | función           | Cierra sesión desde cualquier pantalla   |

**Flujo de carga del rol:** Al detectar un usuario autenticado, el sistema consulta su perfil en Firestore para obtener el rol asignado. Si el perfil no existe (usuario nuevo o que entró por primera vez con Google), lo crea con rol `user` por defecto.

---

## 1.6 Componentes base

Se construyeron tres componentes reutilizables desde el inicio que se usan en toda la app:

**`Btn`** — botón con vibración táctil al presionar. No tiene color propio: cada pantalla le da el estilo que necesita. La vibración está desactivada en web.

**`FormField`** — campo de texto integrado con el sistema de formularios. Siempre muestra un ícono a la izquierda, soporta agruparse con otros campos (bordes redondeados solo en las esquinas externas) y tiene opción de mostrar/ocultar contraseña.

**`MainLayout`** — envoltorio que aplica el fondo degradado verde (`#a1e1e1 → #bce2d4`) y la imagen decorativa de arbustos en la parte inferior. Todas las pantallas internas (no auth) usan este wrapper para garantizar consistencia visual.

---

## 1.7 Sistema de colores

Todos los colores de la app están definidos en un único archivo de tokens (`palette`). La regla es que ningún componente usa un color hexadecimal directo — siempre usa un token. Esto garantiza consistencia y facilita cambios futuros.

| Grupo              | Uso                                                                        |
| ------------------ | -------------------------------------------------------------------------- |
| `brand.primary`    | Morado `#6d41b0` — acción principal, FABs, chips activos                   |
| `brand.secondary`  | Verde `#299419` — barra de tabs, botones secundarios, encabezados de cards |
| `semantic.error`   | Rojo — mensajes de error                                                   |
| `semantic.warning` | Amarillo — botones de edición                                              |
| `surface.input`    | Crema `#fbfae5` — fondo de campos de texto                                 |
| `text.inverse`     | Blanco — texto sobre fondos oscuros                                        |

---

## 1.8 Perfiles de build

Se configuraron tres perfiles de compilación para Android:

| Perfil        | Uso                                            | Generado por                |
| ------------- | ---------------------------------------------- | --------------------------- |
| `development` | Debug con herramientas de desarrollo activadas | `npm run build:apk:dev`     |
| `preview`     | APK de prueba interna para QA                  | `npm run build:apk:preview` |
| `production`  | APK de distribución final                      | `npm run build:apk:prod`    |

La versión del APK es gestionada automáticamente por EAS en la nube, sin necesidad de incrementarla manualmente.

---

---

# Paso 2 — Autenticación

> **Fecha:** 8–13 marzo 2026  
> **Objetivo:** Implementar el acceso a la app mediante email/contraseña y Google, con validación de formularios y manejo de errores en español.

---

## 2.1 Pantallas implementadas

| Pantalla | Ruta             | Descripción                                              |
| -------- | ---------------- | -------------------------------------------------------- |
| Login    | `(auth)/login`   | Entrada principal con email/contraseña y botón de Google |
| Registro | `(auth)/sign-up` | Creación de nueva cuenta                                 |

Ambas usan el mismo fondo degradado con capas decorativas de imágenes propias de la marca (personaje Nothy, plantas). Las imágenes decorativas son puramente visuales y no capturan interacción del usuario.

---

## 2.2 Validación de formularios

Todos los formularios de la app (no solo auth) usan la misma estrategia:

1. Se define un **esquema de validación** que describe qué campos existen, qué tipo tienen y qué reglas deben cumplir.
2. El formulario se conecta con ese esquema. La validación ocurre automáticamente antes de enviar.
3. Los mensajes de error aparecen en español directamente en el formulario.

Ventaja: los tipos de los datos del formulario se generan automáticamente desde el esquema. No hay duplicación entre "lo que valido" y "lo que proceso".

**Reglas del login:**

| Campo      | Regla                                                                                |
| ---------- | ------------------------------------------------------------------------------------ |
| Email      | Requerido, debe ser un email válido. Se eliminan espacios automáticamente al validar |
| Contraseña | Requerida                                                                            |

**Reglas del registro:**

| Campo      | Regla                                 |
| ---------- | ------------------------------------- |
| Nombre     | Opcional                              |
| Email      | Requerido, email válido, sin espacios |
| Contraseña | Requerida, mínimo 6 caracteres        |

---

## 2.3 Login con email y contraseña

**Flujo:**

```
Usuario llena email + contraseña
  → Validación local del formulario
      → Error de formato → muestra mensaje en el campo correspondiente
      → Datos válidos → llama a Firebase Auth
          → Credenciales incorrectas → "Email o contraseña incorrectos"
          → Usuario no existe → "No existe una cuenta con este correo"
          → Éxito → AuthContext detecta la sesión
                   → Redirección automática a Home
```

Los errores de Firebase (en inglés técnico) se interceptan y se traducen a mensajes comprensibles para el usuario antes de mostrarse.

---

## 2.4 Login con Google

El botón de Google solo aparece en Android e iOS (no en web, donde el SDK de Google Sign-In no está disponible).

**Flujo:**

```
Usuario toca [Google]
  → En Android: verificar que Play Services esté instalado y actualizado
  → Abrir selector de cuenta de Google del sistema operativo
      → Usuario cancela → no pasa nada
      → Usuario elige cuenta → obtener token de identidad de Google
          → Crear credencial de Firebase con ese token
          → Autenticar en Firebase
          → Si el usuario es nuevo: AuthContext crea su perfil en Firestore con rol "user"
          → Redirección automática a Home
```

---

## 2.5 Registro de nueva cuenta

**Flujo:**

```
Usuario llena nombre + email + contraseña
  → Validación local
  → Crear usuario en Firebase Auth
  → Si se proporcionó nombre: actualizar el perfil de Auth
  → Crear documento de perfil en Firestore con rol "user"
  → Redirección automática a Home
```

**Decisión:** El documento de perfil en Firestore se crea en el momento del registro (y no después) para que el nombre introducido en el formulario quede guardado inmediatamente. `AuthContext` también crea el perfil si por alguna razón no existe, como salvaguarda.

**Comportamiento del botón Atrás en Android:** En la pantalla de registro, el botón de retroceso del sistema está bloqueado. Esto evita que el usuario vuelva accidentalmente a Login mientras se está procesando la creación de cuenta.

---

## 2.6 Manejo del teclado en Android

En Android, el teclado virtual puede tapar los campos de entrada. Se implementó un mecanismo de scroll automático: cuando un campo recibe foco, la pantalla hace scroll hasta el final para asegurarse de que el campo quede visible por encima del teclado. Este comportamiento está activo en login, registro y todos los formularios que tienen campos en la parte inferior de la pantalla.

---

## 2.7 Flujo completo de autenticación

```
App arranca → muestra spinner
  → Firebase verifica si hay sesión guardada en el dispositivo
      → Sin sesión → Login
      → Con sesión → consultar rol en Firestore → Home

Desde Login:
  ├─ Email/contraseña → Firebase Auth
  ├─ Google → GoogleSignin → Firebase Auth
  └─ "Crear cuenta" → ir a Registro

Desde Registro:
  → Crear cuenta → actualizar perfil → guardar en Firestore → Home

Logout (desde tab Más):
  → Firebase cierra sesión
  → AuthContext limpia el estado
  → Redirección automática a Login
```

---

---

# Paso 3 — Módulo Síntomas

> **Fecha:** 19 marzo 2026  
> **Objetivo:** Implementar el registro diario de síntomas con historial, edición y borrado. Es el módulo más personal de la app: cada usuario solo ve sus propios registros.

---

## 3.1 Pantallas y componentes

| Elemento              | Tipo             | Responsabilidad                                                |
| --------------------- | ---------------- | -------------------------------------------------------------- |
| Lista de síntomas     | Pantalla         | Historial completo del usuario, en tiempo real                 |
| Formulario de síntoma | Componente       | Crear y editar registros (un solo componente para ambos casos) |
| Card de síntoma       | Componente       | Resumen visual de un registro en la lista                      |
| Nueva entrada         | Pantalla wrapper | Abre el formulario en modo creación                            |
| Editar entrada        | Pantalla wrapper | Abre el formulario en modo edición con datos precargados       |

---

## 3.2 Dominio del módulo

Se centralizaron todos los valores del dominio en un único archivo de constantes:

**Niveles de energía** (con ícono asociado para la UI):

| ID         | Etiqueta | Ícono              |
| ---------- | -------- | ------------------ |
| `very_low` | Muy baja | batería vacía      |
| `low`      | Baja     | batería a la mitad |
| `normal`   | Normal   | línea plana        |
| `high`     | Alta     | rayo               |

**Estados de ánimo:**

| ID          | Etiqueta  | Ícono       |
| ----------- | --------- | ----------- |
| `depressed` | Deprimido | cara triste |
| `normal`    | Normal    | círculo     |
| `cheerful`  | Alegre    | cara feliz  |

**8 síntomas predefinidos:** cansancio extremo, sensibilidad al frío, sensibilidad al calor, piel seca, ansiedad, sentimientos de depresión, dificultad para concentrarse, problemas para dormir.

---

## 3.3 Lista en tiempo real

La lista de síntomas está conectada en tiempo real a Firestore. Esto significa que cualquier cambio (crear, editar, borrar un registro) se refleja automáticamente en la lista sin necesidad de recargar la pantalla.

**Decisiones de diseño:**

- **Límite de 100 registros** por consulta: una app personal de síntomas raramente supera esa cantidad, y el límite protege contra descargas masivas accidentales.
- **Ordenación en el dispositivo** (no en la base de datos): combinar filtro por usuario y ordenación por fecha en Firestore requiere configurar un índice especial. Ordenar en el dispositivo evita esa dependencia de infraestructura.
- **Compatibilidad con registros legacy:** Los registros más antiguos no tenían timestamp exacto de creación, solo la fecha en formato texto. El sistema de ordenación detecta esto y usa la fecha texto como fallback.

---

## 3.4 Formulario único para crear y editar

Se tomó la decisión de usar un único componente de formulario para ambos casos (crear y editar), determinado por si recibe o no el ID del registro a editar.

**Modo creación:**

- La fecha se fija automáticamente al día de hoy.
- El formulario arranca con valores por defecto (energía normal, ánimo normal, sin síntomas).
- Al guardar, se crea un nuevo documento en Firestore con ID generado automáticamente.

**Modo edición:**

- Se carga el registro existente desde Firestore al abrir la pantalla.
- Se verifica que el registro pertenezca al usuario actual (seguridad en cliente, además de las reglas en el servidor).
- Al guardar, se actualiza el documento existente sin tocar la fecha de creación original.

**Carga al recuperar el foco:** El formulario recarga los datos cada vez que la pantalla vuelve a estar visible (no solo al abrirse). Esto garantiza que si el usuario navega a otra parte y vuelve, ve los datos más actuales.

---

## 3.5 Selección de campos no-texto

Los campos de energía, ánimo y síntomas no usan campos de texto tradicionales sino chips/botones presionables. El estado seleccionado se gestiona directamente a través del sistema de formularios, manteniéndolo sincronizado con la validación sin necesidad de lógica adicional.

Los chips de síntomas funcionan como checkboxes: tocar uno lo añade a la lista, volver a tocarlo lo elimina.

---

## 3.6 Card de resumen

La card en la lista muestra la información más relevante de forma compacta:

- Fecha del registro (formato corto: "15 mar 2026") y hora de creación si está disponible.
- Píldoras de energía y ánimo con su ícono correspondiente.
- Chips de síntomas: máximo 4 visibles. Si hay más, se muestra `+N`.
- Notas: máximo 2 líneas con texto truncado.
- Botones de editar y borrar con confirmación antes de eliminar.

---

## 3.7 Flujo del módulo

```
Lista (actualización automática activa)
  │
  ├─ [+ Nuevo] → Formulario en modo creación
  │                  → Guardar → nuevo registro en Firestore
  │                  → La lista se actualiza sola
  │
  ├─ [✏️ Editar] → Formulario en modo edición
  │                  → Carga datos del registro
  │                  → Guardar → actualiza registro en Firestore
  │                  → La lista se actualiza sola
  │
  └─ [🗑 Borrar] → Alerta de confirmación
                     → Confirmar → elimina de Firestore
                     → La lista se actualiza sola
```

---

---

# Paso 4 — Módulo Recetas y Blog

> **Fecha:** 19–20 marzo 2026  
> **Objetivo:** Implementar la gestión de contenido de la app: recetas de alimentación y artículos de blog. El admin crea y publica el contenido; los usuarios lo consumen.

---

## 4.1 Arquitectura del contenido

Tanto recetas como blog siguen el mismo modelo de dos capas:

| Capa                  | Pantallas                             | Acceso                          |
| --------------------- | ------------------------------------- | ------------------------------- |
| **Pública (usuario)** | Lista + Detalle + Modal de preview    | Todos los usuarios autenticados |
| **Administración**    | Lista admin + Formulario crear/editar | Solo rol admin                  |

Las pantallas de administración viven dentro del tab **Más** (acceso restringido). Las pantallas públicas viven en rutas propias (`/recipes/`, `/blog/`) accesibles desde Home y Alimentación.

---

## 4.2 Estados de publicación

Cada receta y cada artículo de blog tiene un estado:

| Estado      | Visible para usuario | Visible para admin |
| ----------- | -------------------- | ------------------ |
| `published` | ✅ Sí                | ✅ Sí              |
| `draft`     | ❌ No                | ✅ Sí              |

El admin puede ver todos los contenidos. El usuario solo ve los publicados. Esta separación se refuerza en dos niveles: en la consulta a la base de datos (filtro por estado) y en las reglas de seguridad del servidor.

---

## 4.3 Formulario de recetas (admin)

El formulario de receta es el más complejo de la app por tener listas dinámicas de ingredientes y pasos.

**Listas dinámicas:** Tanto ingredientes como pasos se pueden añadir y eliminar en tiempo real dentro del formulario. Cada ingrediente tiene dos campos: nombre y cantidad. Cada paso es un texto libre. El sistema de validación garantiza que haya al menos un ingrediente y un paso antes de guardar.

**Gestión de imágenes:** El admin puede subir una foto de la receta desde la galería del teléfono. El flujo es:

```
Seleccionar imagen de galería
  → Solicitar permiso de acceso a fotos (si no se ha concedido)
      → Permiso denegado → guía al usuario a la configuración del sistema
      → Permiso concedido → seleccionar imagen → subir a Firebase Storage
          → Obtener URL pública → guardar en el formulario
```

La imagen se sube a Firebase Storage y solo se guarda la URL en Firestore. Esto mantiene la base de datos ligera.

**Modo crear vs editar:** Al igual que en síntomas, un único formulario sirve para ambos casos. En edición, los datos de la receta existente se cargan y precompletan todos los campos, incluyendo los ingredientes y pasos dinámicos.

---

## 4.4 Formulario de blog (admin)

Similar al de recetas, con las diferencias propias del contenido editorial:

- En lugar de ingredientes y pasos, tiene **párrafos** de contenido (lista dinámica de textos).
- En lugar de imagen desde galería, la imagen de portada se introduce como URL directamente.
- Tiene un campo de **autor** y un **resumen** (excerpt) que se muestra en las cards de la lista.

---

## 4.5 Vista pública — Lista con modal de preview

La lista pública de recetas (tab Alimentación) y la lista en la sección de blog ofrecen dos formas de acceder al contenido:

- **Modal de preview:** toca "Resumen" en la card → abre un modal con los datos principales sin salir de la lista. Útil para ojear rápidamente.
- **Detalle completo:** toca "Ver" → navega a la pantalla de detalle con toda la información.

El modal se cierra antes de navegar al detalle para evitar que quede apilado en la navegación.

---

## 4.6 Seeding de datos iniciales

Para poblar la base de datos con contenido inicial, se implementó una funcionalidad de carga masiva visible solo para el admin en el tab Más. Esta herramienta lee archivos JSON incluidos en la app (`data/recipes.json`, `data/blog.json`, `data/syntom.json`) y los sube a Firestore con una confirmación previa.

Esta funcionalidad fue usada para cargar el contenido inicial de la app y quedó desactivada (comentada) en producción para que no sea accidentalmente ejecutada más de una vez.

---

## 4.7 Flujos del módulo

**Admin — gestión de recetas:**

```
Tab Más → Recetas
  ├─ [+ Nueva] → Formulario vacío → guardar → aparece en la lista
  ├─ [✏️ Editar] → Formulario precargado → guardar → actualiza en la lista
  └─ [🗑 Borrar] → Confirmación → elimina → la lista se actualiza
```

**Usuario — consumo de recetas:**

```
Tab Alimentación
  ├─ Filtrar por categoría (chips horizontales)
  ├─ [Resumen] → Modal de preview
  └─ [Ver] → Pantalla de detalle completo
       (también accesible desde Home → "Ver todas")
```

---

---

# Paso 5 — Módulo Recordatorios y Notificaciones

> **Fecha:** 29 marzo 2026  
> **Objetivo:** Permitir al usuario crear alarmas diarias recurrentes para su medicación. Las notificaciones se disparan localmente en el dispositivo a la hora configurada, todos los días.

---

## 5.1 Pantallas implementadas

| Pantalla               | Descripción                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| Lista de recordatorios | Todos los recordatorios del usuario, ordenados por hora de menor a mayor |
| Nuevo recordatorio     | Formulario con etiqueta y hora                                           |
| Editar recordatorio    | Mismo formulario con datos precargados                                   |

---

## 5.2 Modelo de un recordatorio

| Campo          | Tipo        | Descripción                                             |
| -------------- | ----------- | ------------------------------------------------------- |
| label          | texto       | Nombre del recordatorio (ej: "Levotiroxina")            |
| hour           | número 0–23 | Hora de disparo                                         |
| minute         | número 0–59 | Minuto de disparo                                       |
| enabled        | booleano    | Si la notificación está programada actualmente          |
| notificationId | texto       | ID devuelto por el sistema al programar la notificación |

El `notificationId` es el campo más crítico del módulo: sin él, no es posible cancelar una notificación ya programada.

---

## 5.3 Notificaciones locales

Las notificaciones de Nothyra son **locales** (generadas por la propia app en el dispositivo) y no remotas (enviadas desde un servidor). Esto simplifica enormemente la arquitectura: no se necesita infraestructura de backend para enviar notificaciones.

**Configuración en Android:** Se crea un canal de notificaciones llamado "Recordatorios" con prioridad alta, vibración y sonido. Android 13+ requiere permiso explícito del usuario para mostrar notificaciones; la app lo solicita la primera vez que se crea un recordatorio.

**Programación:** Cada recordatorio activo tiene una notificación diaria recurrente programada. El sistema operativo se encarga de dispararla a la hora configurada, todos los días, incluso si la app está cerrada.

---

## 5.4 Ciclo de vida de una notificación

```
Crear recordatorio
  → Solicitar permiso de notificaciones (si no se tiene)
      → Denegado → el recordatorio se guarda pero queda desactivado
      → Concedido → programar notificación diaria recurrente
          → Sistema devuelve un notificationId
          → Guardar recordatorio en Firestore con ese notificationId y enabled: true

Activar (estaba desactivado)
  → Programar nueva notificación → obtener nuevo notificationId
  → Actualizar en Firestore: enabled: true, notificationId: nuevo

Desactivar (estaba activo)
  → Cancelar la notificación usando el notificationId guardado
  → Actualizar en Firestore: enabled: false, notificationId: null

Editar (hora o etiqueta)
  → Cancelar la notificación anterior
  → Programar nueva notificación con los datos actualizados
  → Actualizar en Firestore con el nuevo notificationId

Eliminar
  → Cancelar la notificación si estaba activa
  → Borrar el documento de Firestore
```

---

## 5.5 Lista en tiempo real

Al igual que síntomas, la lista de recordatorios usa una conexión en tiempo real con Firestore. Los cambios (crear, editar, activar/desactivar, borrar) se reflejan automáticamente.

La lista se ordena por hora de menor a mayor (cronológicamente dentro del día), lo que es más natural para el usuario que ver los recordatorios en orden de creación.

---

## 5.6 Toggle de activar/desactivar

Cada card de recordatorio muestra un chip "Activo" / "Desactivado" que el usuario puede presionar directamente desde la lista sin entrar al formulario de edición. Esto permite activar y desactivar recordatorios con un solo toque.

Si al activar no se pueden programar las notificaciones (permiso denegado), se muestra un mensaje indicando cómo habilitarlas desde la configuración del sistema.

---

---

# Paso 6 — Home, Alimentación, Más y cierre

> **Fecha:** 19–29 marzo 2026 + 4 abril 2026  
> **Objetivo:** Completar los módulos restantes, integrar todo en una experiencia cohesiva y preparar la app para distribución.

---

## 6.1 Home — dashboard de bienvenida

La pantalla de inicio funciona como portal de entrada al contenido de la app.

**Qué muestra:**

- Saludo personalizado con el nombre del usuario.
- Las 3 recetas más recientes publicadas, con acceso directo al detalle.
- Los 2 artículos de blog más recientes publicados, con acceso directo al detalle.
- Botones "Ver todas" / "Ver todos" que llevan a las listas completas.

**Comportamiento:**

- Carga el contenido al entrar y al hacer pull-to-refresh (deslizar hacia abajo).
- Si no hay contenido publicado todavía, muestra mensajes de estado vacío.
- Si hay un error de red, muestra el mensaje correspondiente.

**Decisión de diseño:** Home hace dos consultas en paralelo (recetas y blog simultáneamente) para reducir el tiempo de carga total.

---

## 6.2 Alimentación — catálogo de recetas con filtros

La pantalla de Alimentación es la vista pública del catálogo de recetas, con una experiencia de filtrado por categoría.

**Funcionalidades:**

- **Chips de categoría** horizontales y deslizables: Todas · Desayuno · Almuerzo · Cena · Snack · Postre.
- Al seleccionar una categoría, la lista se filtra instantáneamente sin consultar de nuevo la base de datos (el filtrado es local sobre los datos ya cargados).
- Modal de preview para ojear rápido sin salir de la lista.
- Navegación al detalle completo de cada receta.

**Decisión:** La app descarga hasta 120 recetas al entrar (todas las publicadas) y filtra localmente. Esto da una experiencia de filtrado instantáneo sin latencia de red en cada cambio de categoría.

---

## 6.3 Más — hub de configuración y administración

El tab Más centraliza las funcionalidades de cuenta y administración en un diseño de lista de ajustes.

**Sección de perfil (todos los usuarios):**

- Card con iniciales del usuario, nombre, email y rol en una píldora visual.
- Acceso a editar el nombre visible. El email y el rol son de solo lectura.

**Sección admin (solo para usuarios con rol admin):**

- Acceso directo a la gestión de recetas.
- Acceso directo a la gestión del blog.

**Cerrar sesión:** Botón de logout con color rojo semántico. Cierra la sesión en Firebase y redirige automáticamente a Login.

**Versión de la app:** Se muestra en la parte inferior del tab.

---

## 6.4 Edición de perfil

El usuario puede cambiar únicamente su nombre visible. El email y el rol son de solo lectura y se muestran en un bloque informativo.

Al guardar, el nombre se actualiza en dos lugares simultáneamente: en el sistema de autenticación de Firebase y en el documento de perfil en Firestore. El botón de guardar está desactivado hasta que el usuario modifique algo.

---

## 6.5 Reglas de seguridad de Firestore

La seguridad de los datos se implementa en el servidor con reglas declarativas. Resumen de las reglas aplicadas:

| Colección     | Leer                                           | Crear                     | Editar/Borrar             |
| ------------- | ---------------------------------------------- | ------------------------- | ------------------------- |
| `users/{uid}` | Solo el propio usuario                         | Solo el propio usuario    | Solo el propio usuario    |
| `symptomLogs` | Solo si `userId` coincide                      | Solo si `userId` coincide | Solo si `userId` coincide |
| `reminders`   | Solo si `userId` coincide                      | Solo si `userId` coincide | Solo si `userId` coincide |
| `recipes`     | Autenticados (solo publicadas) o admin (todas) | Solo admin                | Solo admin                |
| `blogPosts`   | Autenticados (solo publicadas) o admin (todas) | Solo admin                | Solo admin                |
| Resto         | ❌ Denegado                                    | ❌ Denegado               | ❌ Denegado               |

La función `isAdmin()` en las reglas consulta el rol del usuario en `users/{uid}` para cada operación protegida.

---

## 6.6 Soporte web

En la última etapa de desarrollo se añadió soporte para abrir la app en un navegador, principalmente para demos y revisiones sin necesidad de instalar el APK.

La estrategia: en web, la app se renderiza dentro de un contenedor de 375px de ancho centrado en pantalla, con fondo gris alrededor. Esto simula un viewport móvil y evita que la interfaz se estire a pantalla completa en un escritorio.

Algunas funcionalidades no están disponibles en web por limitaciones de las plataformas:

- Google Sign-In no funciona en web (el botón se oculta automáticamente).
- Las notificaciones locales no funcionan en web.

---

## 6.7 Versionado de la app

El versionado siguió el esquema semántico a lo largo del desarrollo:

| Versión | Fecha       | Hito                                                      |
| ------- | ----------- | --------------------------------------------------------- |
| 1.3.3   | 13 mar 2026 | Primera versión estable con auth completa                 |
| 1.7.7   | 20 mar 2026 | Síntomas, recetas, blog y home feed                       |
| 2.0.3   | 29 mar 2026 | Recordatorios con notificaciones, filtros de alimentación |

---

## 6.8 Resumen del producto final

Al terminar el desarrollo, Nothyra incluye:

| Módulo              | Funcionalidades                                                             |
| ------------------- | --------------------------------------------------------------------------- |
| **Autenticación**   | Email/contraseña, Google Sign-In, registro, logout                          |
| **Home**            | Feed personalizado con recetas y artículos recientes                        |
| **Síntomas**        | Registro diario con historial, edición y borrado                            |
| **Recordatorios**   | Alarmas diarias con notificaciones locales, activar/desactivar              |
| **Alimentación**    | Catálogo filtrable de recetas con preview y detalle                         |
| **Recetas (admin)** | CRUD completo con subida de imágenes y lista dinámica de ingredientes/pasos |
| **Blog (admin)**    | CRUD completo de artículos con contenido en párrafos                        |
| **Perfil**          | Edición de nombre visible                                                   |
| **Web**             | Demo en navegador con viewport móvil simulado                               |

---

_Guía técnica de implementación de Nothyra · Versión 2.0.3_
