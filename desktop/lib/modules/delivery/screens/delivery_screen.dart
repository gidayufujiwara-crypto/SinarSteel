import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/active_orders_tab.dart';
import '../widgets/history_tab.dart';

class DeliveryScreen extends ConsumerStatefulWidget {
  const DeliveryScreen({super.key});
  @override
  ConsumerState<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends ConsumerState<DeliveryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  @override
  void initState() { super.initState(); _tabController = TabController(length: 2, vsync: this); }
  @override
  void dispose() { _tabController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppColors.bgPanel,
          child: TabBar(
            controller: _tabController,
            labelColor: AppColors.neonBlue,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonBlue,
            indicatorWeight: 2,
            labelStyle: GoogleFonts.rajdhani(fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1),
            tabs: const [Tab(text: 'ORDER AKTIF'), Tab(text: 'RIWAYAT')],
          ),
        ),
        Expanded(child: TabBarView(controller: _tabController, children: const [ActiveOrdersTab(), HistoryTab()])),
      ],
    );
  }
}