import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'auth_provider.dart';
import 'api_client.dart'; // ← tambahkan ini

final posProvider = StateNotifierProvider<PosNotifier, PosState>((ref) {
  return PosNotifier(ref.read(apiClientProvider));
});

class CartItem {
  final String produkId;
  final String sku;
  final String nama;
  final double hargaJual;
  int qty;
  CartItem(
      {required this.produkId,
      required this.sku,
      required this.nama,
      required this.hargaJual,
      this.qty = 1});
}

class PosState {
  final List<CartItem> cart;
  final bool loading;
  final String? error;
  PosState({this.cart = const [], this.loading = false, this.error});

  PosState copyWith({List<CartItem>? cart, bool? loading, String? error}) =>
      PosState(
          cart: cart ?? this.cart,
          loading: loading ?? this.loading,
          error: error);
}

class PosNotifier extends StateNotifier<PosState> {
  final ApiClient api;
  PosNotifier(this.api) : super(PosState());

  void addToCart(dynamic product) {
    final existing =
        state.cart.indexWhere((item) => item.produkId == product.id);
    if (existing != -1) {
      state.cart[existing].qty++;
      state = state.copyWith(cart: [...state.cart]);
    } else {
      state = state.copyWith(cart: [
        ...state.cart,
        CartItem(
          produkId: product.id,
          sku: product.sku,
          nama: product.nama,
          hargaJual: double.tryParse(product.harga_jual.toString()) ?? 0,
        )
      ]);
    }
  }

  void updateQty(String produkId, int qty) {
    final index = state.cart.indexWhere((item) => item.produkId == produkId);
    if (index != -1) {
      if (qty <= 0) {
        state.cart.removeAt(index);
      } else {
        state.cart[index].qty = qty;
      }
      state = state.copyWith(cart: [...state.cart]);
    }
  }

  void removeItem(String produkId) {
    state = state.copyWith(
        cart: state.cart.where((item) => item.produkId != produkId).toList());
  }

  double get grandTotal =>
      state.cart.fold(0, (sum, item) => sum + (item.hargaJual * item.qty));

  Future<void> submitTransaction(String jenisPembayaran,
      {double? bayar, Map<String, dynamic>? delivery}) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final payload = {
        'jenis_pembayaran': jenisPembayaran,
        'items': state.cart
            .map((item) => {
                  'produk_id': item.produkId,
                  'qty': item.qty,
                  'diskon_per_item': 0
                })
            .toList(),
        'bayar': bayar,
        'delivery': delivery,
      };
      await api.dio.post('/pos/transaksi', data: payload);
      state = state.copyWith(cart: [], loading: false);
    } catch (e) {
      state =
          state.copyWith(loading: false, error: 'Gagal menyimpan transaksi');
    }
  }
}
