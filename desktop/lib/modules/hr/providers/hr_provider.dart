import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';
import '../models/hr_models.dart';

class HrState {
  final List<Employee> employees;
  final List<Attendance> attendances;
  final List<SalarySlip> salarySlips;
  final String employeeSearch;
  final String attendanceFilterMonth; // "YYYY-MM"
  final String salaryFilterMonth; // "YYYY-MM"
  final bool isLoading;
  final String? error;

  const HrState({
    this.employees = const [],
    this.attendances = const [],
    this.salarySlips = const [],
    this.employeeSearch = '',
    this.attendanceFilterMonth = '',
    this.salaryFilterMonth = '',
    this.isLoading = false,
    this.error,
  });

  HrState copyWith({
    List<Employee>? employees,
    List<Attendance>? attendances,
    List<SalarySlip>? salarySlips,
    String? employeeSearch,
    String? attendanceFilterMonth,
    String? salaryFilterMonth,
    bool? isLoading,
    String? error,
  }) {
    return HrState(
      employees: employees ?? this.employees,
      attendances: attendances ?? this.attendances,
      salarySlips: salarySlips ?? this.salarySlips,
      employeeSearch: employeeSearch ?? this.employeeSearch,
      attendanceFilterMonth:
          attendanceFilterMonth ?? this.attendanceFilterMonth,
      salaryFilterMonth: salaryFilterMonth ?? this.salaryFilterMonth,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Employee> get filteredEmployees {
    if (employeeSearch.isEmpty) {
      return employees;
    }
    final q = employeeSearch.toLowerCase();
    return employees
        .where((e) =>
            e.fullName.toLowerCase().contains(q) ||
            e.nip.toLowerCase().contains(q))
        .toList();
  }

  List<Attendance> get filteredAttendances {
    if (attendanceFilterMonth.isEmpty) {
      return attendances;
    }
    return attendances
        .where((a) => a.date.startsWith(attendanceFilterMonth))
        .toList();
  }

  List<SalarySlip> get filteredSalarySlips {
    if (salaryFilterMonth.isEmpty) {
      return salarySlips;
    }
    return salarySlips.where((s) => s.period == salaryFilterMonth).toList();
  }
}

class HrNotifier extends StateNotifier<HrState> {
  final ApiService _api;

  HrNotifier(this._api) : super(const HrState()) {
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    state = state.copyWith(isLoading: true);
    try {
      final results = await Future.wait([
        _api.dio.get('/employees'),
        _api.dio.get('/attendance'),
        _api.dio.get('/salary'),
      ]);

      state = state.copyWith(
        employees:
            (results[0].data as List).map((j) => Employee.fromJson(j)).toList(),
        attendances: (results[1].data as List)
            .map((j) => Attendance.fromJson(j))
            .toList(),
        salarySlips: (results[2].data as List)
            .map((j) => SalarySlip.fromJson(j))
            .toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat data HR');
    }
  }

  void setEmployeeSearch(String q) => state = state.copyWith(employeeSearch: q);
  void setAttendanceFilter(String month) =>
      state = state.copyWith(attendanceFilterMonth: month);
  void setSalaryFilter(String month) =>
      state = state.copyWith(salaryFilterMonth: month);

  Future<String?> addEmployee(String nip, String fullName, String position,
      String joinDate, double baseSalary,
      {String? phone}) async {
    try {
      await _api.dio.post('/employees', data: {
        'nip': nip,
        'full_name': fullName,
        'position': position,
        'join_date': joinDate,
        'base_salary': baseSalary,
        'phone': phone ?? '',
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal tambah';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> updateEmployee(String id, String nip, String fullName,
      String position, double baseSalary,
      {String? phone}) async {
    try {
      await _api.dio.put('/employees/$id', data: {
        'nip': nip,
        'full_name': fullName,
        'position': position,
        'base_salary': baseSalary,
        'phone': phone ?? '',
      });
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal update';
      }
      return 'Gagal terhubung';
    }
  }

  Future<String?> deleteEmployee(String id) async {
    try {
      await _api.dio.delete('/employees/$id');
      await _fetchAll();
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['detail'] ?? 'Gagal hapus';
      }
      return 'Gagal terhubung';
    }
  }
}

final hrProvider = StateNotifierProvider<HrNotifier, HrState>((ref) {
  final api = ref.read(apiServiceProvider);
  return HrNotifier(api);
});
