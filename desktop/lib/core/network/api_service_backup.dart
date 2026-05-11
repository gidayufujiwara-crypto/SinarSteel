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
      onError: (error, handler) {
        handler.next(error);
      },
    ));
  }

  // Auth
  Future<Response> login(String username, String password) {
    return dio.post('/auth/login', data: {
      'username': username,
      'password': password,
    });
  }

  Future<Response> getMe() {
    return dio.get('/auth/me');
  }

  // Products
  Future<Response> getProducts() => dio.get('/products');
  Future<Response> createProduct(Map<String, dynamic> data) =>
      dio.post('/products', data: data);
  Future<Response> updateProduct(String id, Map<String, dynamic> data) =>
      dio.put('/products/$id', data: data);
  Future<Response> deleteProduct(String id) => dio.delete('/products/$id');

  // Categories
  Future<Response> getCategories() => dio.get('/categories');
  Future<Response> createCategory(Map<String, dynamic> data) =>
      dio.post('/categories', data: data);
  Future<Response> updateCategory(String id, Map<String, dynamic> data) =>
      dio.put('/categories/$id', data: data);
  Future<Response> deleteCategory(String id) => dio.delete('/categories/$id');

  // Units
  Future<Response> getUnits() => dio.get('/units');
  Future<Response> createUnit(Map<String, dynamic> data) =>
      dio.post('/units', data: data);
  Future<Response> updateUnit(String id, Map<String, dynamic> data) =>
      dio.put('/units/$id', data: data);
  Future<Response> deleteUnit(String id) => dio.delete('/units/$id');

  // Suppliers
  Future<Response> getSuppliers() => dio.get('/suppliers');
  Future<Response> createSupplier(Map<String, dynamic> data) =>
      dio.post('/suppliers', data: data);
  Future<Response> updateSupplier(String id, Map<String, dynamic> data) =>
      dio.put('/suppliers/$id', data: data);
  Future<Response> deleteSupplier(String id) => dio.delete('/suppliers/$id');

  // Customers
  Future<Response> getCustomers() => dio.get('/customers');
  Future<Response> createCustomer(Map<String, dynamic> data) =>
      dio.post('/customers', data: data);
  Future<Response> updateCustomer(String id, Map<String, dynamic> data) =>
      dio.put('/customers/$id', data: data);
  Future<Response> deleteCustomer(String id) => dio.delete('/customers/$id');

  // POS Transactions
  Future<Response> createTransaction(Map<String, dynamic> data) =>
      dio.post('/pos/transaksi', data: data);

  // Dashboard
  Future<Response> getDashboardSummary() 
      => dio.get('/dashboard/summary');
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
