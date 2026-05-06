import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final pushServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});

class PushNotificationService {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // 1. Minta izin notifikasi
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus != AuthorizationStatus.authorized) return;

    // 2. Ambil token FCM (bisa dikirim ke backend oleh pemanggil)
    // token dapat diakses via getToken()

    // 3. Inisialisasi notifikasi lokal (API versi 16.x)
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    const initSettings = InitializationSettings(
      android: androidInit,
      iOS: iosInit,
    );

    // **** Perbaikan: gunakan named parameter 'settings' ****
    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (response) {
        // Tindak lanjut ketika notifikasi diklik
      },
    );

    // 4. Tangani pesan saat aplikasi di foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      _showLocalNotification(
        id: 0,
        title: message.notification?.title ?? 'Notifikasi',
        body: message.notification?.body ?? '',
      );
    });
  }

  /// Menampilkan notifikasi lokal (heads‑up)
  Future<void> _showLocalNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'sinarsteel_channel',
      'SinarSteel Notifications',
      importance: Importance.max,
      priority: Priority.high,
    );
    const details = NotificationDetails(android: androidDetails);

    // API show() versi 16.x: semua parameter bernama
    await _localNotifications.show(
      id: id,
      title: title,
      body: body,
      notificationDetails: details,
    );
  }

  /// Mengambil token FCM untuk dikirim ke backend
  Future<String?> getToken() => _fcm.getToken();
}
