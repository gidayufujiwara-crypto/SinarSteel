import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/sidebar.dart';
import '../widgets/stat_card.dart';
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
  String _currentRoute = '/dashboard';

  final Map<String, Widget> _pages = {
    '/dashboard': const _DashboardContent(),
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
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: GridPainter(),
              child: CustomPaint(painter: ScanlinePainter()),
            ),
          ),
          Row(
            children: [
              Sidebar(
                role: role,
                currentRoute: _currentRoute,
                onNavigate: (route) => setState(() => _currentRoute = route),
                onLogout: () => ref.read(authProvider.notifier).logout(),
                userName: authState.user?.fullName ?? '',
              ),
              Expanded(
                child: _pages[_currentRoute] ??
                    const Center(child: Text('Halaman tidak ditemukan')),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DashboardContent extends ConsumerWidget {
  const _DashboardContent();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Topbar dengan brand "SINAR STEEL"
          _Topbar(),
          const SizedBox(height: 24),

          // Stat Cards
          GridView.count(
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 3.0,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              StatCard(
                label: 'PENJUALAN HARI INI',
                value: 'Rp ${_fmt(state.salesToday)}',
                delta: '',
                icon: Icons.trending_up,
                color: AppColors.neonCyan,
              ),
              StatCard(
                label: 'TRANSAKSI',
                value: '${state.transactionsToday}',
                delta: '',
                icon: Icons.receipt_long,
                color: AppColors.neonOrange,
              ),
              StatCard(
                label: 'STOK KRITIS',
                value: '${state.lowStockCount}',
                delta: 'produk',
                icon: Icons.warning_amber_rounded,
                color: AppColors.neonPink,
              ),
              StatCard(
                label: 'DELIVERY PENDING',
                value: '${state.pendingDeliveryCount}',
                delta: '',
                icon: Icons.local_shipping,
                color: AppColors.neonYellow,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Chart
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderNeon),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'REVENUE 8 BULAN TERAKHIR',
                  style: GoogleFonts.orbitron(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 16),
                if (state.revenueSeries.isEmpty)
                  SizedBox(
                    height: 200,
                    child: Center(
                      child: Text(
                        'Belum ada data penjualan',
                        style: GoogleFonts.rajdhani(
                          color: AppColors.textDim,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  )
                else
                  SizedBox(
                    height: 200,
                    child: BarChart(
                      BarChartData(
                        maxY: (state.revenueSeries
                                    .map(
                                        (e) => (e['revenue'] as num).toDouble())
                                    .reduce((a, b) => a > b ? a : b) *
                                1.2)
                            .clamp(1.0, double.infinity),
                        barGroups:
                            List.generate(state.revenueSeries.length, (i) {
                          final rev = (state.revenueSeries[i]['revenue'] ?? 0)
                              .toDouble();
                          return BarChartGroupData(
                            x: i,
                            barRods: [
                              BarChartRodData(
                                toY: rev,
                                color: AppColors.neonCyan,
                                width: 16,
                                borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(4),
                                ),
                              ),
                            ],
                          );
                        }),
                        titlesData: FlTitlesData(
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 60,
                              getTitlesWidget: (v, m) => Text(
                                '${(v / 1000000).toStringAsFixed(0)}M',
                                style: const TextStyle(
                                    color: AppColors.textDim, fontSize: 10),
                              ),
                            ),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (v, m) {
                                final i = v.toInt();
                                if (i < state.revenueSeries.length) {
                                  return Text(
                                    state.revenueSeries[i]['month'] ?? '',
                                    style: const TextStyle(
                                        color: AppColors.textDim, fontSize: 9),
                                  );
                                }
                                return const SizedBox();
                              },
                            ),
                          ),
                          topTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                          rightTitles: const AxisTitles(
                              sideTitles: SideTitles(showTitles: false)),
                        ),
                        gridData: FlGridData(show: false),
                        borderData: FlBorderData(show: false),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Top Products + Recent Orders
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderNeon),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TOP PRODUK',
                        style: GoogleFonts.orbitron(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...state.topProducts.take(5).map(
                            (p) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      p['nama'] ?? '',
                                      style: const TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 12),
                                    ),
                                  ),
                                  Text(
                                    '${p['total_qty']}x  Rp${_fmt((p['total_revenue'] ?? 0).toDouble())}',
                                    style: const TextStyle(
                                        color: AppColors.neonGreen,
                                        fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderNeon),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ORDER TERBARU',
                        style: GoogleFonts.orbitron(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...state.recentOrders.take(5).map(
                            (o) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      o['order_number'] ?? '',
                                      style: const TextStyle(
                                          color: AppColors.neonCyan,
                                          fontSize: 11),
                                    ),
                                  ),
                                  Text(
                                    'Rp ${_fmt((o['total'] ?? 0).toDouble())}',
                                    style: const TextStyle(
                                        color: AppColors.neonGreen,
                                        fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Alerts
          if (state.alerts.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderNeon),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'NOTIFIKASI',
                    style: GoogleFonts.orbitron(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...state.alerts.map(
                    (a) => _AlertItem(
                      type: a['type'] ?? 'info',
                      message: a['message'] ?? '',
                      time: a['time'] ?? '',
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _fmt(dynamic v) {
    final numVal =
        (v is num) ? v.toDouble() : double.tryParse(v.toString()) ?? 0;
    if (numVal >= 1e6) return '${(numVal / 1e6).toStringAsFixed(1)}jt';
    return numVal.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }
}

class _Topbar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 64,
      child: Row(
        children: [
          // Brand "SINAR STEEL"
          Text.rich(
            TextSpan(
              style: GoogleFonts.orbitron(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                letterSpacing: 3,
              ),
              children: [
                TextSpan(
                  text: 'SINAR',
                  style: TextStyle(
                    color: AppColors.neonCyan,
                    shadows: [
                      Shadow(
                        color: AppColors.neonCyan.withOpacity(0.6),
                        blurRadius: 20,
                      ),
                    ],
                  ),
                ),
                TextSpan(text: ' '),
                TextSpan(
                  text: 'STEEL',
                  style: TextStyle(
                    color: AppColors.neonOrange,
                    shadows: [
                      Shadow(
                        color: AppColors.neonOrange.withOpacity(0.6),
                        blurRadius: 20,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Spacer(),
          // Search bar
          SizedBox(
            width: 350,
            child: TextField(
              style:
                  const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Cari produk, kode SKU, atau supplier…',
                hintStyle:
                    const TextStyle(color: AppColors.textDim, fontSize: 14),
                prefixIcon: const Icon(Icons.search,
                    color: AppColors.textDim, size: 18),
                filled: true,
                fillColor: AppColors.neonCyan.withOpacity(0.04),
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                  borderSide: BorderSide(
                    color: AppColors.neonCyan.withOpacity(0.2),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                  borderSide: BorderSide(
                    color: AppColors.neonCyan.withOpacity(0.2),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: AppColors.neonCyan),
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          // Notification bell
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.neonPink.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.neonPink.withOpacity(0.3)),
            ),
            child: Stack(
              children: [
                const Center(
                  child: Icon(Icons.notifications,
                      color: AppColors.neonPink, size: 16),
                ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: AppColors.neonPink,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: AppColors.neonPink, blurRadius: 6)
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Avatar
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1A2A4A), Color(0xFF0E3A6A)],
              ),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.neonCyan.withOpacity(0.4)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.neonCyan.withOpacity(0.15),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Center(
              child: Text(
                'MM',
                style: GoogleFonts.orbitron(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.neonCyan,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AlertItem extends StatelessWidget {
  final String type;
  final String message;
  final String time;

  const _AlertItem({
    required this.type,
    required this.message,
    required this.time,
  });

  Color get _color => type == 'critical'
      ? AppColors.neonPink
      : type == 'warning'
          ? AppColors.neonOrange
          : AppColors.neonCyan;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 4),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _color,
              boxShadow: [BoxShadow(color: _color, blurRadius: 8)],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(message, style: TextStyle(color: _color, fontSize: 13)),
          ),
          const SizedBox(width: 8),
          Text(
            time,
            style: GoogleFonts.rajdhani(fontSize: 11, color: AppColors.textDim),
          ),
        ],
      ),
    );
  }
}
