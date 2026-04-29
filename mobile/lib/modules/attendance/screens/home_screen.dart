import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/auth_provider.dart';
import '../providers/attendance_provider.dart';
import 'history_screen.dart';
import 'schedule_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  final String karyawanId;
  final String karyawanNama;
  const HomeScreen({
    super.key,
    required this.karyawanId,
    required this.karyawanNama,
  });

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _isLoading = false;

  Future<Position> _getCurrentPosition() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Layanan lokasi tidak aktif');
    }
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Izin lokasi ditolak');
      }
    }
    if (permission == LocationPermission.deniedForever) {
      throw Exception('Izin lokasi ditolak permanen');
    }
    return await Geolocator.getCurrentPosition();
  }

  Future<String?> _takePicture() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      return image.path; // Mengembalikan path file foto
    }
    return null;
  }

  Future<void> _absen({required bool isMasuk}) async {
    setState(() => _isLoading = true);
    try {
      final position = await _getCurrentPosition();
      // Ganti koordinat berikut dengan koordinat kantor Anda
      final distance = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        -6.200000, // latitude kantor
        106.816666, // longitude kantor
      );
      if (distance > 200) {
        throw Exception(
            'Anda berada di luar radius kantor (${distance.toStringAsFixed(0)}m)');
      }

      // Ambil foto selfie
      final fotoPath = await _takePicture();
      if (fotoPath == null) {
        throw Exception('Foto tidak berhasil diambil');
      }

      final provider = ref.read(attendanceProvider.notifier);
      if (isMasuk) {
        await provider.absenMasuk(
          karyawanId: widget.karyawanId,
          lat: position.latitude,
          lon: position.longitude,
          fotoUrl: fotoPath,
        );
      } else {
        await provider.absenPulang(
          karyawanId: widget.karyawanId,
          lat: position.latitude,
          lon: position.longitude,
          fotoUrl: fotoPath,
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Absensi berhasil')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Absensi - ${widget.karyawanNama}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ScheduleScreen()),
            ),
            tooltip: 'Jadwal Shift',
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HistoryScreen()),
            ),
            tooltip: 'Riwayat Absensi',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.of(context).pushReplacementNamed('/');
            },
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              onPressed: _isLoading ? null : () => _absen(isMasuk: true),
              icon: const Icon(Icons.login),
              label: const Text('Absen Masuk'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF88),
                foregroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _isLoading ? null : () => _absen(isMasuk: false),
              icon: const Icon(Icons.logout),
              label: const Text('Absen Pulang'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00F5FF),
                foregroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
