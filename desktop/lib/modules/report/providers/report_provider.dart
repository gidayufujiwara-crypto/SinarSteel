import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_service.dart';

class ReportState {
  final List<Map<String, dynamic>> salesData;
  final List<Map<String, dynamic>> stockData;
  final List<Map<String, dynamic>> deliveryData;
  final List<Map<String, dynamic>> attendanceData;
  final String salesDateFrom;
  final String salesDateTo;
  final String deliveryDateFrom;
  final String deliveryDateTo;
  final String attendanceMonth;
  final bool isLoading;
  final String? error;

  const ReportState({
    this.salesData = const [],
    this.stockData = const [],
    this.deliveryData = const [],
    this.attendanceData = const [],
    this.salesDateFrom = '',
    this.salesDateTo = '',
    this.deliveryDateFrom = '',
    this.deliveryDateTo = '',
    this.attendanceMonth = '',
    this.isLoading = false,
    this.error,
  });

  ReportState copyWith({
    List<Map<String, dynamic>>? salesData,
    List<Map<String, dynamic>>? stockData,
    List<Map<String, dynamic>>? deliveryData,
    List<Map<String, dynamic>>? attendanceData,
    String? salesDateFrom,
    String? salesDateTo,
    String? deliveryDateFrom,
    String? deliveryDateTo,
    String? attendanceMonth,
    bool? isLoading,
    String? error,
  }) {
    return ReportState(
      salesData: salesData ?? this.salesData,
      stockData: stockData ?? this.stockData,
      deliveryData: deliveryData ?? this.deliveryData,
      attendanceData: attendanceData ?? this.attendanceData,
      salesDateFrom: salesDateFrom ?? this.salesDateFrom,
      salesDateTo: salesDateTo ?? this.salesDateTo,
      deliveryDateFrom: deliveryDateFrom ?? this.deliveryDateFrom,
      deliveryDateTo: deliveryDateTo ?? this.deliveryDateTo,
      attendanceMonth: attendanceMonth ?? this.attendanceMonth,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Map<String, dynamic>> get filteredSales {
    if (salesDateFrom.isEmpty) {
      return salesData;
    }
    return salesData.where((s) {
      final date = s['date'] ?? '';
      return date.compareTo(salesDateFrom) >= 0 &&
          date.compareTo(salesDateTo) <= 0;
    }).toList();
  }

  List<Map<String, dynamic>> get filteredDelivery {
    if (deliveryDateFrom.isEmpty) {
      return deliveryData;
    }
    return deliveryData.where((d) {
      final date = d['created_at'] ?? '';
      return date.compareTo(deliveryDateFrom) >= 0 &&
          date.compareTo(deliveryDateTo) <= 0;
    }).toList();
  }

  List<Map<String, dynamic>> get filteredAttendance {
    if (attendanceMonth.isEmpty) {
      return attendanceData;
    }
    return attendanceData.where((a) {
      final date = a['date'] ?? '';
      return date.startsWith(attendanceMonth);
    }).toList();
  }
}

class ReportNotifier extends StateNotifier<ReportState> {
  final ApiService _api;

  ReportNotifier(this._api) : super(const ReportState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.dio.get('/report/sales'),
        _api.dio.get('/report/stock'),
        _api.dio.get('/report/delivery'),
        _api.dio.get('/report/attendance'),
      ]);
      state = state.copyWith(
        salesData: (results[0].data as List).cast<Map<String, dynamic>>(),
        stockData: (results[1].data as List).cast<Map<String, dynamic>>(),
        deliveryData: (results[2].data as List).cast<Map<String, dynamic>>(),
        attendanceData: (results[3].data as List).cast<Map<String, dynamic>>(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat laporan');
    }
  }

  void setSalesFilter(String from, String to) =>
      state = state.copyWith(salesDateFrom: from, salesDateTo: to);
  void setDeliveryFilter(String from, String to) =>
      state = state.copyWith(deliveryDateFrom: from, deliveryDateTo: to);
  void setAttendanceMonth(String month) =>
      state = state.copyWith(attendanceMonth: month);
}

final reportProvider =
    StateNotifierProvider<ReportNotifier, ReportState>((ref) {
  final api = ref.read(apiServiceProvider);
  return ReportNotifier(api);
});
