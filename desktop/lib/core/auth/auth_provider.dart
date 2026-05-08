import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../network/api_service.dart';

class AppUser {
  final String id;
  final String username;
  final String fullName;
  final String role;

  AppUser({
    required this.id,
    required this.username,
    required this.fullName,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      fullName: json['full_name'] ?? json['username'] ?? '',
      role: json['role'] ?? 'kasir',
    );
  }
}

class AuthState {
  final bool isAuthenticated;
  final AppUser? user;
  final String? token;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.isAuthenticated = false,
    this.user,
    this.token,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    AppUser? user,
    String? token,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      token: token ?? this.token,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _api;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._api, this._storage) : super(const AuthState());

  Future<void> login(String username, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _api.login(username, password);
      final token = response.data['access_token'];
      await _storage.write(key: 'token', value: token);

      final userResponse = await _api.getMe();
      final user = AppUser.fromJson(userResponse.data);

      state = state.copyWith(
        isAuthenticated: true,
        user: user,
        token: token,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _getErrorMessage(e),
      );
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
    state = const AuthState();
  }

  String _getErrorMessage(dynamic e) {
    if (e is DioException) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.connectionError) {
        return 'Tidak bisa terhubung ke server';
      }
      if (e.response?.statusCode == 401) {
        return 'Username atau password salah';
      }
      final detail = e.response?.data?['detail'];
      if (detail != null) return detail.toString();
    }
    return 'Gagal login';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final api = ref.read(apiServiceProvider);
  final storage = const FlutterSecureStorage();
  return AuthNotifier(api, storage);
});
