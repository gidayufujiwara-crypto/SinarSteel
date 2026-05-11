import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  final Dio dio;
  final FlutterSecureStorage _storage;

  ApiService(this.dio, this._storage) {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) => handler.next(error),
    ));
  }

  // Auth
  Future<Response> login(String username, String password) => dio
      .post('/auth/login', data: {'username': username, 'password': password});
  Future<Response> getMe() => dio.get('/auth/me');

  // Master — Produk
  Future<Response> getProducts() => dio.get('/master/produk');
  Future<Response> createProduct(Map<String, dynamic> d) =>
      dio.post('/master/produk', data: d);
  Future<Response> updateProduct(String id, Map<String, dynamic> d) =>
      dio.put('/master/produk/$id', data: d);
  Future<Response> deleteProduct(String id) => dio.delete('/master/produk/$id');

  // Master — Kategori
  Future<Response> getCategories() => dio.get('/master/kategori');
  Future<Response> createCategory(Map<String, dynamic> d) =>
      dio.post('/master/kategori', data: d);
  Future<Response> updateCategory(String id, Map<String, dynamic> d) =>
      dio.put('/master/kategori/$id', data: d);
  Future<Response> deleteCategory(String id) =>
      dio.delete('/master/kategori/$id');

  // Master — Satuan
  Future<Response> getUnits() => dio.get('/master/satuan');
  Future<Response> createUnit(Map<String, dynamic> d) =>
      dio.post('/master/satuan', data: d);
  Future<Response> updateUnit(String id, Map<String, dynamic> d) =>
      dio.put('/master/satuan/$id', data: d);
  Future<Response> deleteUnit(String id) => dio.delete('/master/satuan/$id');

  // Master — Supplier
  Future<Response> getSuppliers() => dio.get('/master/supplier');
  Future<Response> createSupplier(Map<String, dynamic> d) =>
      dio.post('/master/supplier', data: d);
  Future<Response> updateSupplier(String id, Map<String, dynamic> d) =>
      dio.put('/master/supplier/$id', data: d);
  Future<Response> deleteSupplier(String id) =>
      dio.delete('/master/supplier/$id');

  // Master — Pelanggan
  Future<Response> getCustomers() => dio.get('/master/pelanggan');
  Future<Response> createCustomer(Map<String, dynamic> d) =>
      dio.post('/master/pelanggan', data: d);
  Future<Response> updateCustomer(String id, Map<String, dynamic> d) =>
      dio.put('/master/pelanggan/$id', data: d);
  Future<Response> deleteCustomer(String id) =>
      dio.delete('/master/pelanggan/$id');

  // POS
  Future<Response> createTransaction(Map<String, dynamic> d) =>
      dio.post('/pos/transaksi', data: d);

  // WMS
  Future<Response> getInventory() => dio.get('/wms/inventory');
  Future<Response> getStockOpname() => dio.get('/wms/opname');
  Future<Response> submitStockOpname(Map<String, dynamic> d) =>
      dio.post('/wms/opname', data: d);
  Future<Response> getStockMutation() => dio.get('/wms/mutation');

  // Delivery
  Future<Response> getDeliveryOrders({String? status}) {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    return dio.get('/delivery/orders',
        queryParameters: params.isNotEmpty ? params : null);
  }

  Future<Response> assignDriver(String id, String driverId) =>
      dio.put('/delivery/orders/$id/assign',
          queryParameters: {'driver_id': driverId});
  Future<Response> updateDeliveryStatus(String id, String status) =>
      dio.put('/delivery/orders/$id/status', data: {'status': status});

  // HR — Karyawan
  Future<Response> getEmployees() => dio.get('/hr/karyawan');
  Future<Response> createEmployee(Map<String, dynamic> d) =>
      dio.post('/hr/karyawan', data: d);
  Future<Response> updateEmployee(String id, Map<String, dynamic> d) =>
      dio.put('/hr/karyawan/$id', data: d);
  Future<Response> deleteEmployee(String id) => dio.delete('/hr/karyawan/$id');

  // HR — Absensi (per karyawan)
  Future<Response> getAttendance(String karyawanId, {int? bulan, int? tahun}) {
    final params = <String, dynamic>{};
    if (bulan != null) params['bulan'] = bulan;
    if (tahun != null) params['tahun'] = tahun;
    return dio.get('/hr/absensi/$karyawanId',
        queryParameters: params.isNotEmpty ? params : null);
  }

  // HR — Gaji
  Future<Response> getSalary({int? bulan, int? tahun}) {
    final params = <String, dynamic>{};
    if (bulan != null) params['bulan'] = bulan;
    if (tahun != null) params['tahun'] = tahun;
    return dio.get('/hr/gaji',
        queryParameters: params.isNotEmpty ? params : null);
  }

  // HR — User Management
  Future<Response> getUsers() => dio.get('/hr/users');
  Future<Response> createUser(Map<String, dynamic> d) =>
      dio.post('/hr/users', data: d);
  Future<Response> deleteUser(String id) => dio.delete('/hr/users/$id');

  // Report
  Future<Response> getReport(String type) => dio.get('/report/$type');
  Future<Response> getDashboardSummary() =>
      dio.get('/report/dashboard/summary');

  // Settings
  Future<Response> getSettings() => dio.get('/settings/');
  Future<Response> updateSettings(FormData d) => dio.put('/settings/', data: d);
  Future<Response> addBank(Map<String, dynamic> d) =>
      dio.post('/settings/bank', data: d);
  Future<Response> updateBank(String id, Map<String, dynamic> d) =>
      dio.put('/settings/bank/$id', data: d);
  Future<Response> deleteBank(String id) => dio.delete('/settings/bank/$id');
}

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: 'http://127.0.0.1:8000',
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));
  final storage = const FlutterSecureStorage();
  return ApiService(dio, storage);
});
