import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_service.dart';
import '../models/master_models.dart';

class MasterState {
  final List<Product> products;
  final List<Category> categories;
  final List<Unit> units;
  final List<Supplier> suppliers;
  final List<Customer> customers;
  final String productSearch;
  final String categorySearch;
  final String unitSearch;
  final String supplierSearch;
  final String customerSearch;
  final bool isLoading;
  final String? error;

  const MasterState({
    this.products = const [],
    this.categories = const [],
    this.units = const [],
    this.suppliers = const [],
    this.customers = const [],
    this.productSearch = '',
    this.categorySearch = '',
    this.unitSearch = '',
    this.supplierSearch = '',
    this.customerSearch = '',
    this.isLoading = false,
    this.error,
  });

  MasterState copyWith({
    List<Product>? products,
    List<Category>? categories,
    List<Unit>? units,
    List<Supplier>? suppliers,
    List<Customer>? customers,
    String? productSearch,
    String? categorySearch,
    String? unitSearch,
    String? supplierSearch,
    String? customerSearch,
    bool? isLoading,
    String? error,
  }) {
    return MasterState(
      products: products ?? this.products,
      categories: categories ?? this.categories,
      units: units ?? this.units,
      suppliers: suppliers ?? this.suppliers,
      customers: customers ?? this.customers,
      productSearch: productSearch ?? this.productSearch,
      categorySearch: categorySearch ?? this.categorySearch,
      unitSearch: unitSearch ?? this.unitSearch,
      supplierSearch: supplierSearch ?? this.supplierSearch,
      customerSearch: customerSearch ?? this.customerSearch,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Product> get filteredProducts {
    if (productSearch.isEmpty) return products;
    final q = productSearch.toLowerCase();
    return products
        .where((p) =>
            p.name.toLowerCase().contains(q) ||
            p.code.toLowerCase().contains(q))
        .toList();
  }

  List<Category> get filteredCategories {
    if (categorySearch.isEmpty) return categories;
    final q = categorySearch.toLowerCase();
    return categories.where((c) => c.name.toLowerCase().contains(q)).toList();
  }

  List<Unit> get filteredUnits {
    if (unitSearch.isEmpty) return units;
    final q = unitSearch.toLowerCase();
    return units.where((u) => u.name.toLowerCase().contains(q)).toList();
  }

  List<Supplier> get filteredSuppliers {
    if (supplierSearch.isEmpty) return suppliers;
    final q = supplierSearch.toLowerCase();
    return suppliers
        .where((s) =>
            s.name.toLowerCase().contains(q) ||
            s.code.toLowerCase().contains(q))
        .toList();
  }

  List<Customer> get filteredCustomers {
    if (customerSearch.isEmpty) return customers;
    final q = customerSearch.toLowerCase();
    return customers
        .where((c) =>
            c.name.toLowerCase().contains(q) ||
            c.code.toLowerCase().contains(q))
        .toList();
  }
}

class MasterNotifier extends StateNotifier<MasterState> {
  final ApiService _api;

  MasterNotifier(this._api) : super(const MasterState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.getProducts(),
        _api.getCategories(),
        _api.getUnits(),
        _api.getSuppliers(),
        _api.getCustomers(),
      ]);

      state = state.copyWith(
        products: (results[0].data as List)
            .map((j) => Product(
                  id: j['id']?.toString() ?? '',
                  code: j['code'] ?? '',
                  name: j['name'] ?? '',
                  category: j['category_name'] ?? j['category'] ?? '',
                  unit: j['unit_name'] ?? j['unit'] ?? '',
                  costPrice:
                      (j['cost_price'] ?? j['costPrice'] ?? 0).toDouble(),
                  sellingPrice:
                      (j['selling_price'] ?? j['sellingPrice'] ?? 0).toDouble(),
                  stock: j['stock'] ?? 0,
                ))
            .toList(),
        categories: (results[1].data as List)
            .map((j) => Category(
                  id: j['id']?.toString() ?? '',
                  name: j['name'] ?? '',
                  description: j['description'],
                ))
            .toList(),
        units: (results[2].data as List)
            .map((j) => Unit(
                  id: j['id']?.toString() ?? '',
                  name: j['name'] ?? '',
                  description: j['description'],
                ))
            .toList(),
        suppliers: (results[3].data as List)
            .map((j) => Supplier(
                  id: j['id']?.toString() ?? '',
                  code: j['code'] ?? '',
                  name: j['name'] ?? '',
                  contact: j['contact'],
                  address: j['address'],
                ))
            .toList(),
        customers: (results[4].data as List)
            .map((j) => Customer(
                  id: j['id']?.toString() ?? '',
                  code: j['code'] ?? '',
                  name: j['name'] ?? '',
                  type: j['type'] ?? 'retail',
                  contact: j['contact'],
                  address: j['address'],
                ))
            .toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Gagal memuat data dari server');
    }
  }

  // Search
  void setProductSearch(String q) => state = state.copyWith(productSearch: q);
  void setCategorySearch(String q) => state = state.copyWith(categorySearch: q);
  void setUnitSearch(String q) => state = state.copyWith(unitSearch: q);
  void setSupplierSearch(String q) => state = state.copyWith(supplierSearch: q);
  void setCustomerSearch(String q) => state = state.copyWith(customerSearch: q);

  // Product CRUD
  Future<void> addProduct(Product p) async {
    try {
      final res = await _api.createProduct({
        'code': p.code,
        'name': p.name,
        'category': p.category,
        'unit': p.unit,
        'cost_price': p.costPrice,
        'selling_price': p.sellingPrice,
        'stock': p.stock,
      });
      final newP = Product(
        id: res.data['id']?.toString() ?? DateTime.now().toString(),
        code: p.code,
        name: p.name,
        category: p.category,
        unit: p.unit,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
      );
      state = state.copyWith(products: [...state.products, newP]);
    } catch (_) {
      state = state.copyWith(products: [...state.products, p]);
    }
  }

  Future<void> updateProduct(int index, Product p) async {
    try {
      await _api.updateProduct(state.products[index].id, {
        'code': p.code,
        'name': p.name,
        'category': p.category,
        'unit': p.unit,
        'cost_price': p.costPrice,
        'selling_price': p.sellingPrice,
        'stock': p.stock,
      });
    } catch (_) {}
    final list = [...state.products];
    list[index] = p;
    state = state.copyWith(products: list);
  }

  Future<void> deleteProduct(int index) async {
    try {
      await _api.deleteProduct(state.products[index].id);
    } catch (_) {}
    final list = [...state.products];
    list.removeAt(index);
    state = state.copyWith(products: list);
  }

  // Category CRUD
  Future<void> addCategory(Category c) async {
    try {
      final res = await _api
          .createCategory({'name': c.name, 'description': c.description ?? ''});
      state = state.copyWith(categories: [
        ...state.categories,
        Category(
            id: res.data['id']?.toString() ?? c.id,
            name: c.name,
            description: c.description)
      ]);
    } catch (_) {
      state = state.copyWith(categories: [...state.categories, c]);
    }
  }

  Future<void> updateCategory(int index, Category c) async {
    try {
      await _api.updateCategory(state.categories[index].id,
          {'name': c.name, 'description': c.description ?? ''});
    } catch (_) {}
    final list = [...state.categories];
    list[index] = c;
    state = state.copyWith(categories: list);
  }

  Future<void> deleteCategory(int index) async {
    try {
      await _api.deleteCategory(state.categories[index].id);
    } catch (_) {}
    final list = [...state.categories];
    list.removeAt(index);
    state = state.copyWith(categories: list);
  }

  // Unit CRUD
  Future<void> addUnit(Unit u) async {
    try {
      final res = await _api
          .createUnit({'name': u.name, 'description': u.description ?? ''});
      state = state.copyWith(units: [
        ...state.units,
        Unit(
            id: res.data['id']?.toString() ?? u.id,
            name: u.name,
            description: u.description)
      ]);
    } catch (_) {
      state = state.copyWith(units: [...state.units, u]);
    }
  }

  Future<void> updateUnit(int index, Unit u) async {
    try {
      await _api.updateUnit(state.units[index].id,
          {'name': u.name, 'description': u.description ?? ''});
    } catch (_) {}
    final list = [...state.units];
    list[index] = u;
    state = state.copyWith(units: list);
  }

  Future<void> deleteUnit(int index) async {
    try {
      await _api.deleteUnit(state.units[index].id);
    } catch (_) {}
    final list = [...state.units];
    list.removeAt(index);
    state = state.copyWith(units: list);
  }

  // Supplier CRUD
  Future<void> addSupplier(Supplier s) async {
    try {
      final res = await _api.createSupplier({
        'code': s.code,
        'name': s.name,
        'contact': s.contact ?? '',
        'address': s.address ?? ''
      });
      state = state.copyWith(suppliers: [
        ...state.suppliers,
        Supplier(
            id: res.data['id']?.toString() ?? s.id,
            code: s.code,
            name: s.name,
            contact: s.contact,
            address: s.address)
      ]);
    } catch (_) {
      state = state.copyWith(suppliers: [...state.suppliers, s]);
    }
  }

  Future<void> updateSupplier(int index, Supplier s) async {
    try {
      await _api.updateSupplier(state.suppliers[index].id, {
        'code': s.code,
        'name': s.name,
        'contact': s.contact ?? '',
        'address': s.address ?? ''
      });
    } catch (_) {}
    final list = [...state.suppliers];
    list[index] = s;
    state = state.copyWith(suppliers: list);
  }

  Future<void> deleteSupplier(int index) async {
    try {
      await _api.deleteSupplier(state.suppliers[index].id);
    } catch (_) {}
    final list = [...state.suppliers];
    list.removeAt(index);
    state = state.copyWith(suppliers: list);
  }

  // Customer CRUD
  Future<void> addCustomer(Customer c) async {
    try {
      final res = await _api.createCustomer({
        'code': c.code,
        'name': c.name,
        'type': c.type,
        'contact': c.contact ?? '',
        'address': c.address ?? ''
      });
      state = state.copyWith(customers: [
        ...state.customers,
        Customer(
            id: res.data['id']?.toString() ?? c.id,
            code: c.code,
            name: c.name,
            type: c.type,
            contact: c.contact,
            address: c.address)
      ]);
    } catch (_) {
      state = state.copyWith(customers: [...state.customers, c]);
    }
  }

  Future<void> updateCustomer(int index, Customer c) async {
    try {
      await _api.updateCustomer(state.customers[index].id, {
        'code': c.code,
        'name': c.name,
        'type': c.type,
        'contact': c.contact ?? '',
        'address': c.address ?? ''
      });
    } catch (_) {}
    final list = [...state.customers];
    list[index] = c;
    state = state.copyWith(customers: list);
  }

  Future<void> deleteCustomer(int index) async {
    try {
      await _api.deleteCustomer(state.customers[index].id);
    } catch (_) {}
    final list = [...state.customers];
    list.removeAt(index);
    state = state.copyWith(customers: list);
  }
}

final masterProvider =
    StateNotifierProvider<MasterNotifier, MasterState>((ref) {
  final api = ref.read(apiServiceProvider);
  return MasterNotifier(api);
});
