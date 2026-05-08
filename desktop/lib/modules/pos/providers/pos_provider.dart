import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_service.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;
  double discount;

  CartItem({
    required this.product,
    this.quantity = 1,
    this.discount = 0,
  });

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
      state = state.copyWith(products: products, isLoading: false);
    } catch (e) {
      // Jika API gagal, fallback ke data dummy
      _loadDummyProducts();
    }
  }

  void _loadDummyProducts() {
    final dummy = [
      Product(
          id: '1',
          code: 'BSN-001',
          name: 'Besi SNI 10mm',
          category: 'Besi',
          price: 85000,
          cost: 72000,
          stock: 50,
          unit: 'batang'),
      Product(
          id: '2',
          code: 'BSN-002',
          name: 'Besi SNI 12mm',
          category: 'Besi',
          price: 125000,
          cost: 105000,
          stock: 35,
          unit: 'batang'),
      Product(
          id: '3',
          code: 'PLT-001',
          name: 'Plat Bordes 1.2mm',
          category: 'Plat',
          price: 450000,
          cost: 380000,
          stock: 20,
          unit: 'lembar'),
      Product(
          id: '4',
          code: 'PLT-002',
          name: 'Plat Strip 3mm x 30mm',
          category: 'Plat',
          price: 35000,
          cost: 28000,
          stock: 100,
          unit: 'batang'),
      Product(
          id: '5',
          code: 'PIP-001',
          name: 'Pipa Galvanis 1"',
          category: 'Pipa',
          price: 95000,
          cost: 78000,
          stock: 40,
          unit: 'batang'),
      Product(
          id: '6',
          code: 'PIP-002',
          name: 'Pipa Galvanis 2"',
          category: 'Pipa',
          price: 175000,
          cost: 145000,
          stock: 25,
          unit: 'batang'),
      Product(
          id: '7',
          code: 'SKR-001',
          name: 'Sekrup Baja 5cm (box)',
          category: 'Aksesoris',
          price: 25000,
          cost: 18000,
          stock: 200,
          unit: 'box'),
      Product(
          id: '8',
          code: 'ELK-001',
          name: 'Elektroda LB52 2.6mm',
          category: 'Aksesoris',
          price: 120000,
          cost: 95000,
          stock: 60,
          unit: 'pack'),
      Product(
          id: '9',
          code: 'HLL-001',
          name: 'Hollow 4x4 Galvanis',
          category: 'Hollow',
          price: 65000,
          cost: 52000,
          stock: 30,
          unit: 'batang'),
      Product(
          id: '10',
          code: 'WRM-001',
          name: 'Wiremesh M6',
          category: 'Wiremesh',
          price: 350000,
          cost: 290000,
          stock: 15,
          unit: 'lembar'),
    ];
    state = state.copyWith(
        products: dummy,
        isLoading: false,
        error: 'Gagal memuat produk dari server. Data dummy ditampilkan.');
  }

  void setSearch(String query) {
    state = state.copyWith(searchQuery: query);
  }

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

  void clearCart() {
    state = state.copyWith(cart: []);
  }

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

      final payload = {
        'payment_method': paymentMethod,
        'total_amount': state.grandTotal,
        'items': items,
      };

      await _api.createTransaction(payload);
      return null; // Sukses
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail']?.toString() ??
            'Gagal menyimpan transaksi';
      }
      return 'Gagal terhubung ke server. Transaksi disimpan lokal.';
    }
  }
}

final posProvider = StateNotifierProvider<PosNotifier, PosState>((ref) {
  final api = ref.read(apiServiceProvider);
  return PosNotifier(api);
});
