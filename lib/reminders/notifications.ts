import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDERS_CHANNEL_ID = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let readyPromise: Promise<boolean> | null = null;

export async function ensureRemindersNotificationsReady(): Promise<boolean> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const current = await Notifications.getPermissionsAsync();
      let status = current.status;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') {
        return false;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(REMINDERS_CHANNEL_ID, {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 100, 200],
          lightColor: '#7A2EA8',
          sound: 'default',
        });
      }
      return true;
    })();
  }
  return readyPromise;
}

export async function scheduleReminderNotification(input: {
  label: string;
  hour: number;
  minute: number;
}): Promise<string> {
  const ready = await ensureRemindersNotificationsReady();
  if (!ready) {
    throw new Error('No hay permiso para enviar notificaciones.');
  }

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: input.hour,
    minute: input.minute,
  };

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hola, Nothyra te recuerda !',
      body: input.label,
      sound: 'default',
    },
    trigger,
  });
}

export async function cancelReminderNotification(
  notificationId?: string | null,
): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('[ReminderNotifications] cancel:', e);
  }
}
