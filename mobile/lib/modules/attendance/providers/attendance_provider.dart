import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api_client.dart';
import '../../../core/auth_provider.dart';

final attendanceProvider =
    StateNotifierProvider<AttendanceNotifier, Map<String, dynamic>>((ref) {
  return AttendanceNotifier(ref.read(apiClientProvider));
});

class AttendanceNotifier extends StateNotifier<Map<String, dynamic>> {
  final ApiClient api;
  AttendanceNotifier(this.api) : super({});

  Future<void> absenMasuk({
    required String karyawanId,
    required double lat,
    required double lon,
    required String fotoUrl,
  }) async {
    final today = DateTime.now();
    final data = {
      'tanggal':
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}',
      'jam_masuk':
          '${today.hour.toString().padLeft(2, '0')}:${today.minute.toString().padLeft(2, '0')}',
      'lat_masuk': lat,
      'lon_masuk': lon,
      'foto_masuk_url': fotoUrl,
      'status_hadir': 'hadir',
    };
    final response = await api.dio.post('/hr/absensi/$karyawanId', data: data);
    state = response.data;
  }

  Future<void> absenPulang({
    required String karyawanId,
    required double lat,
    required double lon,
    required String fotoUrl,
  }) async {
    final today = DateTime.now();
    final data = {
      'tanggal':
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}',
      'jam_pulang':
          '${today.hour.toString().padLeft(2, '0')}:${today.minute.toString().padLeft(2, '0')}',
      'lat_pulang': lat,
      'lon_pulang': lon,
      'foto_pulang_url': fotoUrl,
    };
    // Untuk absen pulang, gunakan PUT atau POST? Di backend kita pakai metode PUT?
    // Saya sarankan gunakan POST sementara (kita belum buat PUT di router, tapi bisa diperbaiki).
    // Di sini kita pakai POST untuk menyimpan update, padahal backend kita belum ada PUT.
    // Untuk sementara, kita bisa buat endpoint PUT di langkah selanjutnya, atau cukup POST dengan parameter yang tepat.
    // Namun agar tidak bingung, kita akan gunakan POST saja untuk membuat record baru.
    // Jika backend mengizinkan POST untuk pulang dengan mengupdate record, silakan memodifikasi router.
    // Untuk sekarang, kita anggap backend menerima POST dan melakukan update.
    final response = await api.dio.post('/hr/absensi/$karyawanId', data: data);
    state = response.data;
  }

  Future<List<dynamic>> getHistory() async {
    final response = await api.dio.get('/hr/absensi/me');
    return response.data;
  }
}
