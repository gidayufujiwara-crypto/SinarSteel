import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/user_management_tab.dart';
import '../widgets/store_printer_tab.dart';
import '../widgets/bank_qris_tab.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen>
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
            labelColor: AppColors.neonYellow,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonYellow,
            indicatorWeight: 2,
            labelStyle: const TextStyle(
                fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1),
            tabs: const [
              Tab(text: 'USER'),
              Tab(text: 'TOKO & PRINTER'),
              Tab(text: 'BANK & QRIS'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [
              UserManagementTab(),
              StorePrinterTab(),
              BankQrisTab(),
            ],
          ),
        ),
      ],
    );
  }
}
