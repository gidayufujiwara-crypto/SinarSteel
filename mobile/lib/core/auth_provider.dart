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
  final String? userId;
  final String? role;
  final String? fullName;
  AuthState(
      {this.isAuthenticated = false,
      this.token,
      this.userId,
      this.role,
      this.fullName});
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient api;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthNotifier(this.api) : super(AuthState());

  Future<void> login(String username, String password) async {
    final response = await api.dio.post('/auth/login',
        data: {'username': username, 'password': password});
    final token = response.data['access_token'];
    await _storage.write(key: 'token', value: token);
    final userRes = await api.dio.get('/auth/me');
    state = AuthState(
      isAuthenticated: true,
      token: token,
      userId: userRes.data['id'],
      role: userRes.data['role'],
      fullName: userRes.data['full_name'],
    );
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    state = AuthState();
  }
}
