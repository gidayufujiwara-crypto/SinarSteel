import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_service.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;
  double discount;
  CartItem({required this.product, this.quantity = 1, this.discount = 0});
  double get subtotal => (product.price * quantity) - discount;
}

class PosState {
  final List<Product> products;
  final List<CartItem> cart;
  final String searchQuery;
  final bool isLoading;
  final String? error;

  const PosState({
    this.products = const [],
    this.cart = const [],
    this.searchQuery = '',
    this.isLoading = false,
    this.error,
  });

  PosState copyWith({
    List<Product>? products,
    List<CartItem>? cart,
    String? searchQuery,
    bool? isLoading,
    String? error,
  }) {
    return PosState(
      products: products ?? this.products,
      cart: cart ?? this.cart,
      searchQuery: searchQuery ?? this.searchQuery,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Product> get filteredProducts {
    if (searchQuery.isEmpty) return products;
    return products
        .where((p) =>
            p.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();
  }

  int get totalItems => cart.fold(0, (sum, item) => sum + item.quantity);
  double get subtotalAll => cart.fold(0, (sum, item) => sum + item.subtotal);
  double get totalDiscount => cart.fold(0, (sum, item) => sum + item.discount);
  double get grandTotal => subtotalAll;
}

class PosNotifier extends StateNotifier<PosState> {
  final ApiService _api;

  PosNotifier(this._api) : super(const PosState()) {
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _api.getProducts();
      final List<Product> products =
          (res.data as List).map((json) => Product.fromJson(json)).toList();
      state = state.copyWith(products: products, isLoading: false, error: null);
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Gagal memuat produk dari server');
    }
  }

  void setSearch(String query) => state = state.copyWith(searchQuery: query);

  void addToCart(Product product) {
    final existingIndex =
        state.cart.indexWhere((item) => item.product.id == product.id);
    if (existingIndex >= 0) {
      final updatedCart = [...state.cart];
      updatedCart[existingIndex].quantity += 1;
      state = state.copyWith(cart: updatedCart);
    } else {
      state = state.copyWith(cart: [...state.cart, CartItem(product: product)]);
    }
  }

  void removeFromCart(int index) {
    final updatedCart = [...state.cart];
    updatedCart.removeAt(index);
    state = state.copyWith(cart: updatedCart);
  }

  void updateQuantity(int index, int delta) {
    final updatedCart = [...state.cart];
    updatedCart[index].quantity += delta;
    if (updatedCart[index].quantity <= 0) {
      updatedCart.removeAt(index);
    }
    state = state.copyWith(cart: updatedCart);
  }

  void clearCart() => state = state.copyWith(cart: []);

  Future<String?> submitTransaction(String paymentMethod) async {
    if (state.cart.isEmpty) return 'Keranjang kosong';
    try {
      final items = state.cart
          .map((item) => {
                'product_id': item.product.id,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'unit_price': item.product.price,
                'discount': item.discount,
                'subtotal': item.subtotal,
              })
          .toList();
      await _api.createTransaction({
        'payment_method': paymentMethod,
        'total_amount': state.grandTotal,
        'items': items,
      });
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail']?.toString() ??
            'Gagal menyimpan transaksi';
      }
      return 'Gagal terhubung ke server';
    }
  }
}

final posProvider = StateNotifierProvider<PosNotifier, PosState>((ref) {
  final api = ref.read(apiServiceProvider);
  return PosNotifier(api);
});
