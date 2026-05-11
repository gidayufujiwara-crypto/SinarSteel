import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_service.dart';
import '../models/hr_models.dart';

class HrState {
  final List<Employee> employees;
  final List<Attendance> attendances;
  final List<SalarySlip> salarySlips;
  final String employeeSearch;
  final String? selectedKaryawanId;
  final String? attendanceBulan;
  final String? attendanceTahun;
  final String? salaryBulan;
  final String? salaryTahun;
  final bool isLoading;
  final String? error;

  const HrState({
    this.employees = const [],
    this.attendances = const [],
    this.salarySlips = const [],
    this.employeeSearch = '',
    this.selectedKaryawanId,
    this.attendanceBulan,
    this.attendanceTahun,
    this.salaryBulan,
    this.salaryTahun,
    this.isLoading = false,
    this.error,
  });

  HrState copyWith({
    List<Employee>? employees,
    List<Attendance>? attendances,
    List<SalarySlip>? salarySlips,
    String? employeeSearch,
    String? selectedKaryawanId,
    String? attendanceBulan,
    String? attendanceTahun,
    String? salaryBulan,
    String? salaryTahun,
    bool? isLoading,
    String? error,
  }) {
    return HrState(
      employees: employees ?? this.employees,
      attendances: attendances ?? this.attendances,
      salarySlips: salarySlips ?? this.salarySlips,
      employeeSearch: employeeSearch ?? this.employeeSearch,
      selectedKaryawanId: selectedKaryawanId ?? this.selectedKaryawanId,
      attendanceBulan: attendanceBulan ?? this.attendanceBulan,
      attendanceTahun: attendanceTahun ?? this.attendanceTahun,
      salaryBulan: salaryBulan ?? this.salaryBulan,
      salaryTahun: salaryTahun ?? this.salaryTahun,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  List<Employee> get filteredEmployees {
    if (employeeSearch.isEmpty) return employees;
    final q = employeeSearch.toLowerCase();
    return employees
        .where((e) =>
            e.fullName.toLowerCase().contains(q) ||
            e.nip.toLowerCase().contains(q))
        .toList();
  }
}

class HrNotifier extends StateNotifier<HrState> {
  final ApiService _api;

  HrNotifier(this._api) : super(const HrState()) {
    _fetchEmployees();
  }

  Future<void> _fetchEmployees() async {
    state = state.copyWith(isLoading: true);
    try {
      final res = await _api.getEmployees();
      state = state.copyWith(
        employees: (res.data as List).map((j) => Employee.fromJson(j)).toList(),
        isLoading: false,
      );
    } catch (e) {
      state =
          state.copyWith(isLoading: false, error: 'Gagal memuat data karyawan');
    }
  }

  void setEmployeeSearch(String q) => state = state.copyWith(employeeSearch: q);

  Future<void> selectKaryawan(String id) async {
    state = state.copyWith(selectedKaryawanId: id);
    await fetchAttendance();
  }

  Future<void> fetchAttendance() async {
    if (state.selectedKaryawanId == null) return;
    state = state.copyWith(isLoading: true);
    try {
      final int? bulan = state.attendanceBulan != null
          ? int.tryParse(state.attendanceBulan!)
          : null;
      final int? tahun = state.attendanceTahun != null
          ? int.tryParse(state.attendanceTahun!)
          : null;
      final res = await _api.getAttendance(state.selectedKaryawanId!,
          bulan: bulan, tahun: tahun);
      state = state.copyWith(
        attendances:
            (res.data as List).map((j) => Attendance.fromJson(j)).toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat absensi');
    }
  }

  Future<void> fetchSalary() async {
    state = state.copyWith(isLoading: true);
    try {
      final int? bulan =
          state.salaryBulan != null ? int.tryParse(state.salaryBulan!) : null;
      final int? tahun =
          state.salaryTahun != null ? int.tryParse(state.salaryTahun!) : null;
      final res = await _api.getSalary(bulan: bulan, tahun: tahun);
      state = state.copyWith(
        salarySlips:
            (res.data as List).map((j) => SalarySlip.fromJson(j)).toList(),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Gagal memuat slip gaji');
    }
  }

  void setAttendanceFilterBulan(String bulan) =>
      state = state.copyWith(attendanceBulan: bulan);
  void setAttendanceFilterTahun(String tahun) =>
      state = state.copyWith(attendanceTahun: tahun);
  void setSalaryFilterBulan(String bulan) =>
      state = state.copyWith(salaryBulan: bulan);
  void setSalaryFilterTahun(String tahun) =>
      state = state.copyWith(salaryTahun: tahun);

  Future<String?> addEmployee(String nip, String fullName, String position,
      String joinDate, double baseSalary,
      {String? phone}) async {
    try {
      await _api.createEmployee({
        'nip': nip,
        'full_name': fullName,
        'position': position,
        'join_date': joinDate,
        'base_salary': baseSalary,
        'phone': phone ?? '',
      });
      await _fetchEmployees();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal tambah';
      return 'Gagal terhubung';
    }
  }

  Future<String?> updateEmployee(String id, String nip, String fullName,
      String position, double baseSalary,
      {String? phone}) async {
    try {
      await _api.updateEmployee(id, {
        'nip': nip,
        'full_name': fullName,
        'position': position,
        'base_salary': baseSalary,
        'phone': phone ?? '',
      });
      await _fetchEmployees();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal update';
      return 'Gagal terhubung';
    }
  }

  Future<String?> deleteEmployee(String id) async {
    try {
      await _api.deleteEmployee(id);
      await _fetchEmployees();
      return null;
    } catch (e) {
      if (e is DioException)
        return e.response?.data?['detail'] ?? 'Gagal hapus';
      return 'Gagal terhubung';
    }
  }
}

final hrProvider = StateNotifierProvider<HrNotifier, HrState>((ref) {
  final api = ref.read(apiServiceProvider);
  return HrNotifier(api);
});
