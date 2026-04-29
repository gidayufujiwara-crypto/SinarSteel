import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/auth_provider.dart'; // untuk apiClientProvider
import 'home_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _pinController = TextEditingController();
  String? errorText;
  bool _loading = false;

  Future<void> _login() async {
    final pin = _pinController.text;
    if (pin.length != 6) {
      setState(() => errorText = 'PIN harus 6 digit');
      return;
    }

    setState(() => _loading = true);
    try {
      final api = ref.read(apiClientProvider);
      // 1. Login ke backend
      final response = await api.dio.post('/auth/login', data: {
        'username': 'karyawan1',
        'password': 'karyawan123',
      });
      final token = response.data['access_token'];
      // Simpan token langsung
      const storage = FlutterSecureStorage();
      await storage.write(key: 'token', value: token);

      // 2. Ambil data karyawan
      final karyawanRes = await api.dio.get('/hr/me');
      final karyawanId = karyawanRes.data['id'];
      final karyawanNama = karyawanRes.data['nama'];

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => HomeScreen(
            karyawanId: karyawanId,
            karyawanNama: karyawanNama,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => errorText = 'Login gagal: ${e.toString()}');
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
              const Icon(Icons.fingerprint, size: 64, color: Color(0xFF00F5FF)),
              const SizedBox(height: 16),
              const Text('Masukkan PIN',
                  style: TextStyle(fontSize: 20, color: Colors.white)),
              const SizedBox(height: 24),
              TextField(
                controller: _pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                maxLength: 6,
                style: const TextStyle(fontSize: 24, letterSpacing: 8),
                decoration: const InputDecoration(hintText: '------'),
                textAlign: TextAlign.center,
              ),
              if (errorText != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(errorText!,
                      style: const TextStyle(color: Colors.red)),
                ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loading ? null : _login,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00F5FF),
                  foregroundColor: Colors.black,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                ),
                child: const Text('Masuk', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
