import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/auth_provider.dart';
import '../../pos/screens/pos_home_screen.dart';
import '../../wms/screens/wms_home_screen.dart';
import '../../delivery/screens/driver_home_screen.dart';
import '../../attendance/screens/home_screen.dart';
import '../../admin/admin_home_screen.dart'; // akan dibuat di langkah 6

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _usernameCtrl = TextEditingController();
  final TextEditingController _passwordCtrl = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      final response = await api.dio.post('/auth/login', data: {
        'username': _usernameCtrl.text,
        'password': _passwordCtrl.text,
      });
      final token = response.data['access_token'];
      await const FlutterSecureStorage().write(key: 'token', value: token);

      final userRes = await api.dio.get('/auth/me');
      final role = userRes.data['role'] as String;
      final userId = userRes.data['id'] as String;
      final fullName = userRes.data['full_name'] as String;

      // Update auth state
      ref.read(authProvider.notifier).setUser(
            token: token,
            userId: userId,
            role: role,
            fullName: fullName,
          );

      if (!mounted) return;

      // Navigasi berdasarkan role
      Widget targetScreen;
      if (role == 'super_admin') {
        targetScreen = const AdminHomeScreen();
      } else if (role == 'kasir') {
        targetScreen = const PosHomeScreen();
      } else if (role == 'checker' || role == 'gudang') {
        targetScreen = const WmsHomeScreen();
      } else if (role == 'supir' || role == 'kernet') {
        targetScreen = DriverHomeScreen(driverId: userId);
      } else {
        // Default ke absensi (karyawan)
        targetScreen = const HomeScreen(karyawanId: '', karyawanNama: '');
      }

      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => targetScreen),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login gagal: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.login, size: 64, color: Color(0xFF00F5FF)),
              const SizedBox(height: 16),
              const Text('Login SinarSteel',
                  style: TextStyle(fontSize: 20, color: Colors.white)),
              const SizedBox(height: 24),
              TextField(
                controller: _usernameCtrl,
                decoration: const InputDecoration(labelText: 'Username'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _login,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00F5FF),
                  foregroundColor: Colors.black,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                ),
                child: const Text('Masuk'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
