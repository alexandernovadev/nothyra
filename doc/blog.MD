Dado el alcance de la **próxima entrega**:

- **Home**
- **Recetas**
- **Blog**
- **Admin gestiona recetas**

El objetivo aquí es **definir la UI mínima funcional**, los **formularios necesarios** y **cuántas pantallas** se requieren.

---

# 1. Pantallas necesarias

Para esta entrega se pueden identificar **6 pantallas principales**.

| #   | Pantalla          | Tipo    | Descripción               |
| --- | ----------------- | ------- | ------------------------- |
| 1   | Home              | Usuario | Resumen y acceso rápido   |
| 2   | Lista de Recetas  | Usuario | Catálogo de recetas       |
| 3   | Detalle de Receta | Usuario | Ver receta completa       |
| 4   | Lista de Blog     | Usuario | Artículos de salud        |
| 5   | Detalle de Blog   | Usuario | Leer artículo             |
| 6   | Admin Recetas     | Admin   | Crear / editar / eliminar |

**Total:**
**6 pantallas**

---

# 2. UI de Home

La **Home** funciona como un **dashboard ligero**.

### Secciones sugeridas

1. saludo usuario
2. receta destacada
3. recetas rápidas
4. artículos recientes

---

## UI Layout (Home)

```
--------------------------------
Hola, Alex 👋
¿Cómo te sientes hoy?
--------------------------------

🌟 Receta destacada
[ Card receta grande ]

🍽 Recetas rápidas
[ Card ] [ Card ]
[ Card ] [ Card ]

📰 Artículos de salud
[ Card blog ]
[ Card blog ]

--------------------------------
Tabs
Home | Recetas | Blog | Perfil
```

---

## Data usada en Home

```json
{
  "featuredRecipe": {
    "id": 1,
    "title": "Ensalada antiinflamatoria",
    "image": "url",
    "time": 15
  },
  "recipes": [
    {
      "id": 2,
      "title": "Smoothie energético",
      "image": "url",
      "time": 5
    }
  ],
  "articles": [
    {
      "id": 1,
      "title": "Alimentos buenos para la tiroides",
      "image": "url",
      "date": "2026-03-01"
    }
  ]
}
```

---

# 3. UI del Blog

El blog tiene **dos pantallas**:

1. lista de artículos
2. detalle del artículo

---

# 3.1 Pantalla: Lista de Blog

## UI Layout

```
--------------------------------
Blog de Salud
--------------------------------

[ 🔎 Buscar ]

Card Blog
-------------------------
Imagen
Título del artículo
Pequeño resumen
Fecha
Leer más →

Card Blog
-------------------------
Imagen
Título
Resumen
Fecha
Leer más →
```

---

## Datos para card de blog

| Campo   | Tipo   |
| ------- | ------ |
| id      | number |
| title   | string |
| excerpt | string |
| image   | url    |
| date    | date   |
| author  | string |

---

## Ejemplo de data

```json
{
  "id": 10,
  "title": "5 alimentos que ayudan a la tiroides",
  "excerpt": "Algunos alimentos pueden mejorar el funcionamiento hormonal...",
  "image": "url",
  "date": "2026-02-20",
  "author": "Dr. Ana López"
}
```

---

# 3.2 Pantalla: Detalle de Blog

## UI Layout

```
--------------------------------
Imagen portada

Título del artículo

Autor • Fecha

Contenido del artículo
(parrafos)

[ imagen opcional ]

Texto

--------------------------------

Artículos relacionados
[ Card ] [ Card ]
```

---

## Data del artículo completo

```json
{
  "id": 10,
  "title": "5 alimentos que ayudan a la tiroides",
  "image": "url",
  "author": "Dr. Ana López",
  "date": "2026-02-20",
  "content": [
    "La tiroides regula muchas funciones...",
    "Los alimentos ricos en selenio ayudan..."
  ],
  "tags": ["tiroides", "nutrición"]
}
```

---

# 4. Admin – Formulario de Receta

Solo **admin** puede crear / editar.

---

## Campos del formulario

| Campo       | Tipo         |
| ----------- | ------------ |
| title       | text         |
| description | textarea     |
| image       | upload       |
| category    | select       |
| prepTime    | number       |
| servings    | number       |
| difficulty  | select       |
| ingredients | dynamic list |
| steps       | dynamic list |
| status      | toggle       |

---

## UI Form

```
--------------------------------
Nueva Receta
--------------------------------

Título
[________________]

Descripción
[________________]

Imagen
[ Subir imagen ]

Categoría
[ desayuno ▼ ]

Tiempo preparación
[ 20 min ]

Porciones
[ 2 ]

Ingredientes
+ agregar ingrediente

Pasos
+ agregar paso

Estado
( ) Borrador
( ) Publicado

[ Guardar ]
```

---

# 5. Resumen de pantallas

| Área          | Pantallas |
| ------------- | --------- |
| Home          | 1         |
| Recetas       | 2         |
| Blog          | 2         |
| Admin recetas | 1         |

**Total: 6 pantallas**

---

Si quieres, puedo también darte **la arquitectura completa de pantallas tipo mobile app (wireframe profesional)**, que normalmente los profesores piden para proyectos de **UX o desarrollo de apps**.
