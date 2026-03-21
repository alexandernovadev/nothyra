# Recordatorios con Notificaciones Diarias

## Objetivo
Disparar una notificacion local por cada recordatorio, a una hora especifica, todos los dias.

## Estado actual
La pantalla `app/(tabs)/reminders.tsx` esta en placeholder y no tiene logica de notificaciones ni almacenamiento de recordatorios.

## Dependencia necesaria
- `expo-notifications`

## Modelo recomendado de recordatorio
Cada recordatorio debe guardar:
- `id`
- `title` (ej. "Levotiroxina")
- `hour` (0-23)
- `minute` (0-59)
- `enabled` (boolean)
- `notificationId` (id devuelto por Expo para cancelar/reprogramar)

## Flujo funcional

### 1) Inicializacion
- Solicitar permisos de notificacion.
- En Android, crear canal de notificaciones (por ejemplo: `reminders`).

### 2) Crear recordatorio
- Programar notificacion con `repeats: true`.
- Guardar el `notificationId` retornado.

### 3) Editar recordatorio
- Cancelar la notificacion anterior (`notificationId` viejo).
- Programar una nueva con la nueva hora.
- Guardar el nuevo `notificationId`.

### 4) Desactivar o eliminar
- Cancelar la notificacion programada.
- Limpiar `notificationId`.

## APIs clave (`expo-notifications`)
- `requestPermissionsAsync()`
- `setNotificationChannelAsync()` (Android)
- `scheduleNotificationAsync()`
- `cancelScheduledNotificationAsync()`

## Ejemplo de programacion diaria
```ts
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Recordatorio',
    body: `Es hora de ${reminder.title}`,
    sound: true,
  },
  trigger: {
    hour: reminder.hour,
    minute: reminder.minute,
    repeats: true,
  },
});
```

## Consideraciones importantes
- Si la hora ya paso hoy, con `repeats: true` se ejecutara manana a esa hora.
- Android 13+ requiere permiso runtime para notificaciones.
- Probar en dispositivo real (simuladores pueden comportarse distinto).

## Siguiente paso sugerido
Implementar la pantalla de `Recordatorios` con:
- formulario de hora,
- lista de recordatorios,
- persistencia local,
- alta/edicion/baja sincronizada con programacion/cancelacion de notificaciones.
