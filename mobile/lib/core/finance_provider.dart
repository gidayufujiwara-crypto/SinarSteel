import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_client.dart';
import 'auth_provider.dart';

final financeProvider =
    StateNotifierProvider<FinanceNotifier, FinanceState>((ref) {
  return FinanceNotifier(ref.read(apiClientProvider));
});

class FinanceState {
  final List<Map<String, dynamic>> journals;
  final List<Map<String, dynamic>> cashList;
  final List<Map<String, dynamic>> profitLoss;
  final bool loading;
  final String? error;

  FinanceState({
    this.journals = const [],
    this.cashList = const [],
    this.profitLoss = const [],
    this.loading = false,
    this.error,
  });

  FinanceState copyWith({
    List<Map<String, dynamic>>? journals,
    List<Map<String, dynamic>>? cashList,
    List<Map<String, dynamic>>? profitLoss,
    bool? loading,
    String? error,
  }) {
    return FinanceState(
      journals: journals ?? this.journals,
      cashList: cashList ?? this.cashList,
      profitLoss: profitLoss ?? this.profitLoss,
      loading: loading ?? this.loading,
      error: error,
    );
  }
}

class FinanceNotifier extends StateNotifier<FinanceState> {
  final ApiClient api;

  FinanceNotifier(this.api) : super(FinanceState());

  Future<void> fetchJournals() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await api.dio.get('/finance/journals');
      state = state.copyWith(
          journals: List<Map<String, dynamic>>.from(res.data), loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Gagal memuat jurnal');
    }
  }

  Future<void> fetchCash() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await api.dio.get('/finance/cash');
      state = state.copyWith(
          cashList: List<Map<String, dynamic>>.from(res.data), loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Gagal memuat kas');
    }
  }

  Future<void> fetchProfitLoss(int bulan, int tahun) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await api.dio.get('/finance/profit-loss',
          queryParameters: {'bulan': bulan, 'tahun': tahun});
      state = state.copyWith(
          profitLoss: List<Map<String, dynamic>>.from(res.data),
          loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Gagal memuat laporan');
    }
  }
}
