import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/sales_report_tab.dart';
import '../widgets/stock_report_tab.dart';
import '../widgets/delivery_report_tab.dart';
import '../widgets/attendance_report_tab.dart';

class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({super.key});
  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppColors.bgPanel,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.neonOrange,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonOrange,
            indicatorWeight: 2,
            labelStyle: GoogleFonts.rajdhani(
                fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1),
            tabs: const [
              Tab(text: 'PENJUALAN'),
              Tab(text: 'STOK'),
              Tab(text: 'PENGIRIMAN'),
              Tab(text: 'ABSENSI')
            ],
          ),
        ),
        Expanded(
            child: TabBarView(controller: _tabController, children: const [
          SalesReportTab(),
          StockReportTab(),
          DeliveryReportTab(),
          AttendanceReportTab()
        ])),
      ],
    );
  }
}
