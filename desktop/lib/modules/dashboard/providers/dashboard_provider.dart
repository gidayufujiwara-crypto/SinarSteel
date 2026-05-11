import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';

class DashboardState {
  final double salesToday;
  final int transactionsToday;
  final int lowStockCount;
  final int pendingDeliveryCount;
  final List<Map<String, dynamic>> revenueSeries;
  final List<Map<String, dynamic>> topProducts;
  final List<Map<String, dynamic>> recentOrders;
  final List<Map<String, dynamic>> alerts;
  final bool isLoading;
  final String? error;

  const DashboardState({
    this.salesToday = 0,
    this.transactionsToday = 0,
    this.lowStockCount = 0,
    this.pendingDeliveryCount = 0,
    this.revenueSeries = const [],
    this.topProducts = const [],
    this.recentOrders = const [],
    this.alerts = const [],
    this.isLoading = false,
    this.error,
  });

  DashboardState copyWith({
    double? salesToday,
    int? transactionsToday,
    int? lowStockCount,
    int? pendingDeliveryCount,
    List<Map<String, dynamic>>? revenueSeries,
    List<Map<String, dynamic>>? topProducts,
    List<Map<String, dynamic>>? recentOrders,
    List<Map<String, dynamic>>? alerts,
    bool? isLoading,
    String? error,
  }) {
    return DashboardState(
      salesToday: salesToday ?? this.salesToday,
      transactionsToday: transactionsToday ?? this.transactionsToday,
      lowStockCount: lowStockCount ?? this.lowStockCount,
      pendingDeliveryCount: pendingDeliveryCount ?? this.pendingDeliveryCount,
      revenueSeries: revenueSeries ?? this.revenueSeries,
      topProducts: topProducts ?? this.topProducts,
      recentOrders: recentOrders ?? this.recentOrders,
      alerts: alerts ?? this.alerts,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final ApiService _api;

  DashboardNotifier(this._api) : super(const DashboardState()) {
    _fetch();
  }

  Future<void> _fetch() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _api.getDashboardSummary();
      final data = res.data;
      state = state.copyWith(
        salesToday: (data['sales_today'] ?? 0).toDouble(),
        transactionsToday: data['transactions_today'] ?? 0,
        lowStockCount: data['low_stock_count'] ?? 0,
        pendingDeliveryCount: data['pending_delivery_count'] ?? 0,
        revenueSeries:
            (data['revenue_series'] as List?)?.cast<Map<String, dynamic>>() ??
                [],
        topProducts:
            (data['top_products'] as List?)?.cast<Map<String, dynamic>>() ?? [],
        recentOrders:
            (data['recent_orders'] as List?)?.cast<Map<String, dynamic>>() ??
                [],
        alerts: (data['alerts'] as List?)?.cast<Map<String, dynamic>>() ?? [],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat dashboard');
    }
  }

  Future<void> refresh() => _fetch();
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final api = ref.read(apiServiceProvider);
  return DashboardNotifier(api);
});
