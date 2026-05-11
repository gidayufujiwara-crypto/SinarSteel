import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';

class ReportState {
  final List<Map<String, dynamic>> salesData;
  final String salesDateFrom;
  final String salesDateTo;
  final bool isLoading;
  final String? error;

  // Properti dummy untuk menjaga kompatibilitas widget (tidak digunakan)
  List<Map<String, dynamic>> get stockData => [];
  List<Map<String, dynamic>> get deliveryData => [];
  List<Map<String, dynamic>> get attendanceData => [];
  List<Map<String, dynamic>> get filteredDelivery => [];
  List<Map<String, dynamic>> get filteredAttendance => [];

  const ReportState({
    this.salesData = const [],
    this.salesDateFrom = '',
    this.salesDateTo = '',
    this.isLoading = false,
    this.error,
  });

  ReportState copyWith({
    List<Map<String, dynamic>>? salesData,
    String? salesDateFrom,
    String? salesDateTo,
    bool? isLoading,
    String? error,
  }) {
    return ReportState(
      salesData: salesData ?? this.salesData,
      salesDateFrom: salesDateFrom ?? this.salesDateFrom,
      salesDateTo: salesDateTo ?? this.salesDateTo,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Map<String, dynamic>> get filteredSales {
    if (salesDateFrom.isEmpty) return salesData;
    return salesData.where((s) {
      final date = s['date'] ?? '';
      return date.compareTo(salesDateFrom) >= 0 &&
          date.compareTo(salesDateTo) <= 0;
    }).toList();
  }
}

class ReportNotifier extends StateNotifier<ReportState> {
  final ApiService _api;

  ReportNotifier(this._api) : super(const ReportState()) {
    _fetchSales();
  }

  Future<void> _fetchSales() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _api.getReport('sales');
      state = state.copyWith(
        salesData: (res.data as List).cast<Map<String, dynamic>>(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: 'Gagal memuat laporan penjualan');
    }
  }

  void setSalesFilter(String from, String to) =>
      state = state.copyWith(salesDateFrom: from, salesDateTo: to);
  void setDeliveryFilter(String from, String to) {} // tidak digunakan
  void setAttendanceMonth(String month) {} // tidak digunakan
}

final reportProvider =
    StateNotifierProvider<ReportNotifier, ReportState>((ref) {
  final api = ref.read(apiServiceProvider);
  return ReportNotifier(api);
});
