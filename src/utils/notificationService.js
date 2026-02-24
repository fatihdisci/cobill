import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function updateDebtReminder(frequency, totalDebtAmount) {
    if (!Capacitor.isNativePlatform()) {
        console.log('[NotificationService] Not on native platform. Mocking notifications.');
        return;
    }

    try {
        const permissions = await LocalNotifications.requestPermissions();
        if (permissions.display !== 'granted') {
            console.warn('[NotificationService] Permissions denied.');
            return;
        }

        // Temizle
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

        if (frequency === 'never' || totalDebtAmount <= 0) {
            return;
        }

        let schedule = null;
        if (frequency === 'daily') {
            schedule = { on: { hour: 10, minute: 0 } };
        } else if (frequency === 'weekly') {
            // Monday at 10:00 (1 is Sunday, 2 is Monday in Capacitor)
            schedule = { on: { weekday: 2, hour: 10, minute: 0 } };
        }

        if (schedule) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "Ödenmemiş Borç Hatırlatması",
                        body: `Toplam ${totalDebtAmount.toLocaleString('tr-TR')} ₺ ödenmemiş borcun bulunuyor. Detaylar için CoBill'i açın.`,
                        id: 1,
                        schedule: schedule
                    }
                ]
            });
            console.log(`[NotificationService] Scheduled ${frequency} reminder.`);
        }

    } catch (e) {
        console.error('[NotificationService] Error scheduling notification:', e);
    }
}
