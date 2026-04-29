import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(apiClientProvider));
});

class AuthState {
  final bool isAuthenticated;
  final String? token;
  final String? karyawanId;
  final String? fullName;

  AuthState({this.isAuthenticated = false, this.token, this.karyawanId, this.fullName});
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient api;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier(this.api) : super(AuthState());

  Future<void> login(String pin) async {
    try {
      // Untuk simulasi: validasi PIN statis 6 digit '123456'
      if (pin != '123456') {
        throw Exception('PIN salah');
      }
      // Lakukan login ke backend dengan karyawan tertentu (bisa diatur)
      final response = await api.dio.post('/auth/login', data: {
        'username': 'karyawan1', // seharusnya dari mapping PIN
        'password': 'karyawan123',
      });
      final token = response.data['access_token'];
      await _storage.write(key: 'token', value: token);
      // Simpan data user
      final userRes = await api.dio.get('/auth/me');
      state = AuthState(
        isAuthenticated: true,
        token: token,
        karyawanId: userRes.data['id'],
        fullName: userRes.data['full_name'],
      );
    } catch (e) {
      throw Exception('Gagal login');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    state = AuthState();
  }
}