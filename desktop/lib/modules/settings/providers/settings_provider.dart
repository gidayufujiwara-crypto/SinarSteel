import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';
import '../models/settings_models.dart';

class SettingsState {
  final List<User> users;
  final StoreSettings store;
  final PrinterSettings printer;
  final List<BankAccount> banks;
  final String userSearch;
  final bool isLoading;
  final String? error;

  const SettingsState({
    this.users = const [],
    this.store =
        const StoreSettings(storeName: '', address: '', phone: '', footer: ''),
    this.printer = const PrinterSettings(type: 'usb'),
    this.banks = const [],
    this.userSearch = '',
    this.isLoading = false,
    this.error,
  });

  SettingsState copyWith({
    List<User>? users,
    StoreSettings? store,
    PrinterSettings? printer,
    List<BankAccount>? banks,
    String? userSearch,
    bool? isLoading,
    String? error,
  }) {
    return SettingsState(
      users: users ?? this.users,
      store: store ?? this.store,
      printer: printer ?? this.printer,
      banks: banks ?? this.banks,
      userSearch: userSearch ?? this.userSearch,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<User> get filteredUsers {
    if (userSearch.isEmpty) {
      return users;
    }
    final q = userSearch.toLowerCase();
    return users
        .where((u) =>
            u.username.toLowerCase().contains(q) ||
            u.fullName.toLowerCase().contains(q))
        .toList();
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  final ApiService _api;

  SettingsNotifier(this._api) : super(const SettingsState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.dio.get('/users'),
        _api.dio.get('/settings'),
      ]);

      final users =
          (results[0].data as List).map((j) => User.fromJson(j)).toList();
      final settingsData = results[1].data;

      state = state.copyWith(
        users: users,
        store: StoreSettings.fromJson(settingsData['store'] ?? {}),
        printer: PrinterSettings.fromJson(settingsData['printer'] ?? {}),
        banks: (settingsData['banks'] as List? ?? [])
            .map((j) => BankAccount.fromJson(j))
            .toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat settings');
    }
  }

  void setUserSearch(String q) => state = state.copyWith(userSearch: q);

  // User CRUD
  Future<String?> addUser(
      String username, String password, String fullName, String role) async {
    try {
      await _api.dio.post('/users', data: {
        'username': username,
        'password': password,
        'full_name': fullName,
        'role': role,
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal tambah user';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> updateUser(String userId,
      {String? fullName, String? role, String? password}) async {
    try {
      final data = <String, dynamic>{};
      if (fullName != null) {
        data['full_name'] = fullName;
      }
      if (role != null) {
        data['role'] = role;
      }
      if (password != null && password.isNotEmpty) {
        data['password'] = password;
      }
      await _api.dio.put('/users/$userId', data: data);
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal update user';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> deleteUser(String userId) async {
    try {
      await _api.dio.delete('/users/$userId');
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal hapus user';
      }
      return 'Gagal terhubung';
    }
  }

  // Store & Printer
  Future<String?> saveStorePrinter(StoreSettings store, PrinterSettings printer,
      {String? logoPath}) async {
    try {
      final data = {
        'store_name': store.storeName,
        'store_address': store.address,
        'store_phone': store.phone,
        'receipt_footer': store.footer,
        'printer_type': printer.type,
        'printer_path': printer.path ?? '',
      };
      final formData = FormData.fromMap(data);
      if (logoPath != null) {
        formData.files.add(MapEntry(
          'logo',
          await MultipartFile.fromFile(logoPath, filename: 'logo.png'),
        ));
      }
      await _api.dio.put('/settings', data: formData);
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal simpan';
      }
      return 'Gagal terhubung';
    }
  }

  // Bank
  Future<String?> addBank(
      String bankName, String accountNumber, String accountHolder,
      {String? qrisUrl}) async {
    try {
      await _api.dio.post('/settings/bank', data: {
        'bank_name': bankName,
        'account_number': accountNumber,
        'account_holder': accountHolder,
        'qris_url': qrisUrl ?? '',
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal tambah bank';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> updateBank(
      String id, String bankName, String accountNumber, String accountHolder,
      {String? qrisUrl}) async {
    try {
      await _api.dio.put('/settings/bank/$id', data: {
        'bank_name': bankName,
        'account_number': accountNumber,
        'account_holder': accountHolder,
        'qris_url': qrisUrl ?? '',
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal update bank';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> deleteBank(String id) async {
    try {
      await _api.dio.delete('/settings/bank/$id');
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal hapus bank';
      }
      return 'Gagal terhubung';
    }
  }
}

final settingsProvider =
    StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  final api = ref.read(apiServiceProvider);
  return SettingsNotifier(api);
});
