import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/employee_tab.dart';
import '../widgets/attendance_tab.dart';
import '../widgets/salary_tab.dart';

class HrScreen extends ConsumerStatefulWidget {
  const HrScreen({super.key});
  @override
  ConsumerState<HrScreen> createState() => _HrScreenState();
}

class _HrScreenState extends ConsumerState<HrScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
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
            labelColor: AppColors.neonPink,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonPink,
            indicatorWeight: 2,
            labelStyle: GoogleFonts.rajdhani(
                fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1),
            tabs: const [
              Tab(text: 'KARYAWAN'),
              Tab(text: 'ABSENSI'),
              Tab(text: 'SLIP GAJI')
            ],
          ),
        ),
        Expanded(
            child: TabBarView(
                controller: _tabController,
                children: const [EmployeeTab(), AttendanceTab(), SalaryTab()])),
      ],
    );
  }
}
