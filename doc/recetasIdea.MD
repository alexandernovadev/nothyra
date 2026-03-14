Para el requerimiento **“Gestión de recetas (Admin) – Publicación y edición de recetas”**, normalmente necesitas **dos partes principales en la UI**:

1. **Formulario (Form) para crear / editar recetas**
2. **Cards para mostrar recetas publicadas**

A continuación te dejo una estructura clara de **qué datos incluir** y **cómo podría verse la UI**. 🍽️

---

# 1. Formulario de Recetas (Crear / Editar)

El formulario debe permitir **crear y modificar una receta**.

## Campos recomendados

| Campo                 | Tipo de input   | Descripción                    |
| --------------------- | --------------- | ------------------------------ |
| Título                | Text            | Nombre de la receta            |
| Descripción           | Textarea        | Resumen corto de la receta     |
| Imagen                | Upload          | Foto del plato                 |
| Categoría             | Select          | Ej: desayuno, almuerzo, postre |
| Tiempo de preparación | Number / Select | Minutos                        |
| Porciones             | Number          | Cantidad de personas           |
| Dificultad            | Select          | Fácil / Media / Difícil        |
| Ingredientes          | Lista dinámica  | Agregar múltiples ingredientes |
| Pasos de preparación  | Lista dinámica  | Paso 1, paso 2, etc            |
| Etiquetas             | Tags input      | vegano, rápido, saludable      |
| Estado                | Toggle          | Publicado / Borrador           |

---

## UI sugerida del Form

**Layout simple:**

```
---------------------------------
Crear / Editar Receta
---------------------------------

Título
[________________________]

Descripción
[________________________]
[________________________]

Imagen
[ Subir imagen ]

Categoría  [Desayuno ▼]
Tiempo     [30 min]
Porciones  [4]

Dificultad
(o) Fácil  ( ) Media  ( ) Difícil

Ingredientes
+ Agregar ingrediente
[ harina ] [ 200g ]  (x)
[ azúcar ] [ 50g ]   (x)

Pasos
1. [________________]
2. [________________]
+ Agregar paso

Etiquetas
[vegano] [rápido] + añadir

Estado
[ Publicado ⬤ ]  [ Borrador ]

[ Guardar ]   [ Cancelar ]
```

---

# 2. UI de las Cards de Recetas

Las **cards** sirven para mostrar las recetas en el panel de administración.

## Datos que debería mostrar la Card

- Imagen
- Título
- Categoría
- Tiempo de preparación
- Dificultad
- Estado (Publicado / Borrador)
- Botones de acción

---

## Ejemplo de Card UI

```
┌─────────────────────────┐
│        Imagen           │
│                         │
├─────────────────────────┤
│ Pasta Alfredo           │
│ 🍽️ Cena                 │
│ ⏱️ 25 min   ⭐ Fácil     │
│                         │
│ Estado: Publicado       │
│                         │
│ [Editar] [Eliminar]     │
└─────────────────────────┘
```

---

## Versión más completa (recomendada)

```
┌────────────────────────────┐
│           Imagen           │
├────────────────────────────┤
│ Tacos Mexicanos            │
│ 🌮 Almuerzo                │
│ ⏱️ 20 min   ⭐ Fácil       │
│ 👥 3 porciones             │
│                            │
│ 🟢 Publicado               │
│                            │
│ ✏️ Editar   🗑 Eliminar    │
└────────────────────────────┘
```

---

# 3. Acciones del Admin

Las cards deberían permitir:

- ✏️ **Editar receta**
- 🗑 **Eliminar receta**
- 👁 **Ver receta**
- 🔄 **Cambiar estado (publicado / borrador)**

---

# 4. Modelo de datos simple (Backend)

Ejemplo de estructura:

```json
{
  "id": "123",
  "title": "Pasta Alfredo",
  "description": "Pasta cremosa italiana",
  "image": "url",
  "category": "Cena",
  "prepTime": 25,
  "servings": 2,
  "difficulty": "Fácil",
  "ingredients": [
    { "name": "Pasta", "quantity": "200g" },
    { "name": "Crema", "quantity": "100ml" }
  ],
  "steps": ["Hervir pasta", "Preparar salsa", "Mezclar"],
  "tags": ["italiano", "rápido"],
  "status": "published"
}
```

---

✅ Si quieres, también puedo mostrarte:

- **Un diseño UI moderno tipo dashboard (como UberEats / Notion)**
- **Un ejemplo en React / Angular del formulario y las cards**
- **Un wireframe visual de toda la pantalla de admin**.
