import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';
import '../models/inventory.dart';

class WmsState {
  final List<InventoryItem> inventory;
  final List<OpnameRecord> opnameHistory;
  final List<StockMutation> mutations;
  final String searchQuery;
  final String categoryFilter;
  final String mutationTypeFilter;
  final bool isLoading;
  final String? error;

  const WmsState({
    this.inventory = const [],
    this.opnameHistory = const [],
    this.mutations = const [],
    this.searchQuery = '',
    this.categoryFilter = 'All',
    this.mutationTypeFilter = 'All',
    this.isLoading = false,
    this.error,
  });

  WmsState copyWith({
    List<InventoryItem>? inventory,
    List<OpnameRecord>? opnameHistory,
    List<StockMutation>? mutations,
    String? searchQuery,
    String? categoryFilter,
    String? mutationTypeFilter,
    bool? isLoading,
    String? error,
  }) {
    return WmsState(
      inventory: inventory ?? this.inventory,
      opnameHistory: opnameHistory ?? this.opnameHistory,
      mutations: mutations ?? this.mutations,
      searchQuery: searchQuery ?? this.searchQuery,
      categoryFilter: categoryFilter ?? this.categoryFilter,
      mutationTypeFilter: mutationTypeFilter ?? this.mutationTypeFilter,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<InventoryItem> get filteredInventory {
    var list = inventory;
    if (searchQuery.isNotEmpty) {
      final q = searchQuery.toLowerCase();
      list = list
          .where((i) =>
              i.name.toLowerCase().contains(q) ||
              i.code.toLowerCase().contains(q))
          .toList();
    }
    if (categoryFilter != 'All') {
      list = list.where((i) => i.category == categoryFilter).toList();
    }
    return list;
  }

  List<String> get categories =>
      ['All', ...inventory.map((i) => i.category).toSet().toList()];

  List<StockMutation> get filteredMutations {
    if (mutationTypeFilter == 'All') return mutations;
    return mutations.where((m) => m.type == mutationTypeFilter).toList();
  }
}

class WmsNotifier extends StateNotifier<WmsState> {
  final ApiService _api;

  WmsNotifier(this._api) : super(const WmsState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.getProducts(), // inventory
        _api.dio.get('/stock-opname'), // opname history
        _api.dio.get('/stock-mutation'), // mutations
      ]);

      state = state.copyWith(
        inventory: (results[0].data as List)
            .map((j) => InventoryItem.fromJson(j))
            .toList(),
        opnameHistory: (results[1].data as List)
            .map((j) => OpnameRecord.fromJson(j))
            .toList(),
        mutations: (results[2].data as List)
            .map((j) => StockMutation.fromJson(j))
            .toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat data');
    }
  }

  void setSearch(String q) => state = state.copyWith(searchQuery: q);
  void setCategoryFilter(String cat) =>
      state = state.copyWith(categoryFilter: cat);
  void setMutationFilter(String type) =>
      state = state.copyWith(mutationTypeFilter: type);

  Future<String?> submitOpname(
      String productId, int physicalStock, String? note) async {
    try {
      await _api.dio.post('/stock-opname', data: {
        'product_id': productId,
        'physical_stock': physicalStock,
        'note': note ?? '',
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal menyimpan opname';
      return 'Gagal terhubung';
    }
  }
}

final wmsProvider = StateNotifierProvider<WmsNotifier, WmsState>((ref) {
  final api = ref.read(apiServiceProvider);
  return WmsNotifier(api);
});
