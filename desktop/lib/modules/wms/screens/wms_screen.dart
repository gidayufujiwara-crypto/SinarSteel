import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/inventory_tab.dart';
import '../widgets/opname_tab.dart';
import '../widgets/mutation_tab.dart';

class WmsScreen extends ConsumerStatefulWidget {
  const WmsScreen({super.key});

  @override
  ConsumerState<WmsScreen> createState() => _WmsScreenState();
}

class _WmsScreenState extends ConsumerState<WmsScreen>
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
            labelColor: AppColors.neonGreen,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonGreen,
            indicatorWeight: 2,
            labelStyle: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 12,
              letterSpacing: 1,
            ),
            tabs: const [
              Tab(text: 'INVENTORY'),
              Tab(text: 'STOCK OPNAME'),
              Tab(text: 'MUTASI'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [
              InventoryTab(),
              OpnameTab(),
              MutationTab(),
            ],
          ),
        ),
      ],
    );
  }
}
