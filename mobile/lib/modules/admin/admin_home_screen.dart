import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/auth_provider.dart';
import '../pos/screens/pos_home_screen.dart';
import '../wms/screens/wms_home_screen.dart';
import '../delivery/screens/driver_home_screen.dart';
import '../attendance/screens/home_screen.dart';
import '../finance/screens/finance_home_screen.dart';

class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SinarSteel Admin'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Notifikasi akan segera hadir')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.of(context).pushReplacementNamed('/');
            },
          ),
        ],
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        children: [
          _buildMenuCard(
            context,
            icon: Icons.shopping_cart,
            label: 'POS Kasir',
            color: const Color(0xFF00F5FF),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const PosHomeScreen())),
          ),
          _buildMenuCard(
            context,
            icon: Icons.inventory,
            label: 'WMS Gudang',
            color: const Color(0xFF00FF88),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const WmsHomeScreen())),
          ),
          _buildMenuCard(
            context,
            icon: Icons.local_shipping,
            label: 'Delivery',
            color: const Color(0xFF9D4EDD),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) =>
                      DriverHomeScreen(driverId: auth.userId ?? '')),
            ),
          ),
          _buildMenuCard(
            context,
            icon: Icons.fingerprint,
            label: 'Absensi',
            color: const Color(0xFFFF6B00),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (_) =>
                      const HomeScreen(karyawanId: '', karyawanNama: '')),
            ),
          ),
          _buildMenuCard(
            context,
            icon: Icons.notifications,
            label: 'Notifikasi',
            color: const Color(0xFFFF006E),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Notifikasi push akan segera hadir')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.settings,
            label: 'Pengaturan',
            color: Colors.grey,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Pengaturan mobile akan segera hadir')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.account_balance,
            label: 'Keuangan',
            color: const Color(0xFFFFC107),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const FinanceHomeScreen())),
          ),
          _buildMenuCard(
            context,
            icon: Icons.inventory,
            label: 'WMS Gudang',
            color: const Color(0xFF00FF88),
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const WmsHomeScreen())),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 48, color: color),
              const SizedBox(height: 12),
              Text(
                label,
                style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
