import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_provider.dart';
//import '../../../core/theme/app_theme.dart';
import '../widgets/sidebar.dart';
import '../../pos/screens/pos_screen.dart';
import '../../master/screens/master_screen.dart';
import '../../wms/screens/wms_screen.dart';
import '../../delivery/screens/delivery_screen.dart';
import '../../hr/screens/hr_screen.dart';
import '../../report/screens/report_screen.dart';
import '../../settings/screens/settings_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  String _currentRoute = '/pos';

  final Map<String, Widget> _pages = {
    '/pos': const PosScreen(),
    '/master': const MasterScreen(),
    '/wms': const WmsScreen(),
    '/delivery': const DeliveryScreen(),
    '/hr': const HrScreen(),
    '/report': const ReportScreen(),
    '/settings': const SettingsScreen(),
  };

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final role = authState.user?.role ?? 'kasir';

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          SizedBox(
            width: 220,
            child: Sidebar(
              role: role,
              currentRoute: _currentRoute,
              onNavigate: (route) {
                setState(() => _currentRoute = route);
              },
              onLogout: () => ref.read(authProvider.notifier).logout(),
              userName: authState.user?.fullName ?? '',
            ),
          ),
          // Konten
          Expanded(
            child: _pages[_currentRoute] ??
                const Center(child: Text('Halaman tidak ditemukan')),
          ),
        ],
      ),
    );
  }
}
