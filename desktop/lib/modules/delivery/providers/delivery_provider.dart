import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';
import '../models/delivery.dart';

class DeliveryState {
  final List<DeliveryOrder> activeOrders;
  final List<DeliveryOrder> historyOrders;
  final String activeSearch;
  final String historySearch;
  final String historyStatusFilter;
  final bool isLoading;
  final String? error;

  const DeliveryState({
    this.activeOrders = const [],
    this.historyOrders = const [],
    this.activeSearch = '',
    this.historySearch = '',
    this.historyStatusFilter = 'All',
    this.isLoading = false,
    this.error,
  });

  DeliveryState copyWith({
    List<DeliveryOrder>? activeOrders,
    List<DeliveryOrder>? historyOrders,
    String? activeSearch,
    String? historySearch,
    String? historyStatusFilter,
    bool? isLoading,
    String? error,
  }) {
    return DeliveryState(
      activeOrders: activeOrders ?? this.activeOrders,
      historyOrders: historyOrders ?? this.historyOrders,
      activeSearch: activeSearch ?? this.activeSearch,
      historySearch: historySearch ?? this.historySearch,
      historyStatusFilter: historyStatusFilter ?? this.historyStatusFilter,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<DeliveryOrder> get filteredActiveOrders {
    if (activeSearch.isEmpty) return activeOrders;
    final q = activeSearch.toLowerCase();
    return activeOrders
        .where((o) =>
            o.orderNumber.toLowerCase().contains(q) ||
            o.customerName.toLowerCase().contains(q))
        .toList();
  }

  List<DeliveryOrder> get filteredHistoryOrders {
    var list = historyOrders;
    if (historySearch.isNotEmpty) {
      final q = historySearch.toLowerCase();
      list = list
          .where((o) =>
              o.orderNumber.toLowerCase().contains(q) ||
              o.customerName.toLowerCase().contains(q))
          .toList();
    }
    if (historyStatusFilter != 'All') {
      list = list.where((o) => o.status == historyStatusFilter).toList();
    }
    return list;
  }
}

class DeliveryNotifier extends StateNotifier<DeliveryState> {
  final ApiService _api;

  DeliveryNotifier(this._api) : super(const DeliveryState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.getDeliveryOrders(status: 'pending,dikirim'),
        _api.getDeliveryOrders(status: 'selesai,batal'),
      ]);

      state = state.copyWith(
        activeOrders: (results[0].data as List)
            .map((j) => DeliveryOrder.fromJson(j))
            .toList(),
        historyOrders: (results[1].data as List)
            .map((j) => DeliveryOrder.fromJson(j))
            .toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Gagal memuat data pengiriman');
    }
  }

  void setActiveSearch(String q) => state = state.copyWith(activeSearch: q);
  void setHistorySearch(String q) => state = state.copyWith(historySearch: q);
  void setHistoryStatusFilter(String s) =>
      state = state.copyWith(historyStatusFilter: s);

  Future<String?> assignDriver(String orderId, String driverId) async {
    try {
      await _api.assignDriver(orderId, driverId);
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal assign driver';
      return 'Gagal terhubung';
    }
  }

  Future<String?> updateStatus(String orderId, String newStatus) async {
    try {
      await _api.updateDeliveryStatus(orderId, newStatus);
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal update status';
      return 'Gagal terhubung';
    }
  }
}

final deliveryProvider =
    StateNotifierProvider<DeliveryNotifier, DeliveryState>((ref) {
  final api = ref.read(apiServiceProvider);
  return DeliveryNotifier(api);
});
