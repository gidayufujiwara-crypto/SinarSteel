import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';
import 'api_client.dart';

final wmsProvider = StateNotifierProvider<WmsNotifier, WmsState>((ref) {
  return WmsNotifier(ref.read(apiClientProvider));
});

class WmsState {
  final List<Map<String, dynamic>> stockList;
  final List<Map<String, dynamic>> opnameList;
  final bool loading;
  final String? error;
  final String? successMessage;

  WmsState({
    this.stockList = const [],
    this.opnameList = const [],
    this.loading = false,
    this.error,
    this.successMessage,
  });

  WmsState copyWith({
    List<Map<String, dynamic>>? stockList,
    List<Map<String, dynamic>>? opnameList,
    bool? loading,
    String? error,
    String? successMessage,
  }) {
    return WmsState(
      stockList: stockList ?? this.stockList,
      opnameList: opnameList ?? this.opnameList,
      loading: loading ?? this.loading,
      error: error,
      successMessage: successMessage,
    );
  }
}

class WmsNotifier extends StateNotifier<WmsState> {
  final ApiClient api;

  WmsNotifier(this.api) : super(WmsState());

  Future<void> fetchStock({String? search}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await api.dio
          .get('/wms/inventory', queryParameters: {'search': search ?? ''});
      final List data = res.data;
      state = state.copyWith(
          stockList: data.cast<Map<String, dynamic>>(), loading: false);
    } catch (e) {
      state = state.copyWith(
          loading: false, error: 'Gagal memuat stok: ${e.toString()}');
    }
  }

  Future<void> fetchOpname() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final res = await api.dio.get('/wms/opname');
      final List data = res.data;
      state = state.copyWith(
          opnameList: data.cast<Map<String, dynamic>>(), loading: false);
    } catch (e) {
      state = state.copyWith(
          loading: false, error: 'Gagal memuat opname: ${e.toString()}');
    }
  }

  Future<void> submitOpname(
      List<Map<String, dynamic>> items, String? keterangan) async {
    state = state.copyWith(loading: true, error: null, successMessage: null);
    try {
      await api.dio.post('/wms/opname', data: {
        'items': items,
        'keterangan': keterangan ?? '',
      });
      state = state.copyWith(
          loading: false, successMessage: 'Stok opname berhasil disimpan');
      await fetchOpname();
      await fetchStock();
    } catch (e) {
      state = state.copyWith(
          loading: false, error: 'Gagal menyimpan opname: ${e.toString()}');
    }
  }

  void printLabel(String produkId) {
    // Stub untuk print label – hanya tampilkan pesan
    // Nanti bisa diganti dengan panggilan ke API cetak
    state = state.copyWith(
        successMessage: 'Label untuk produk $produkId sedang dicetak...');
  }

  void clearMessage() {
    state = state.copyWith(successMessage: null, error: null);
  }
}
