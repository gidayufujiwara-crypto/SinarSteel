import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/product_tab.dart';
import '../widgets/category_unit_tab.dart';
import '../widgets/supplier_tab.dart';
import '../widgets/customer_tab.dart';

class MasterScreen extends ConsumerStatefulWidget {
  const MasterScreen({super.key});
  @override
  ConsumerState<MasterScreen> createState() => _MasterScreenState();
}

class _MasterScreenState extends ConsumerState<MasterScreen>
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
            labelColor: AppColors.neonCyan,
            unselectedLabelColor: AppColors.textDim,
            indicatorColor: AppColors.neonCyan,
            indicatorWeight: 2,
            labelStyle: GoogleFonts.rajdhani(
                fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1),
            tabs: const [
              Tab(text: 'PRODUK'),
              Tab(text: 'KATEGORI / SATUAN'),
              Tab(text: 'SUPPLIER'),
              Tab(text: 'PELANGGAN')
            ],
          ),
        ),
        Expanded(
            child: TabBarView(controller: _tabController, children: const [
          ProductTab(),
          CategoryUnitTab(),
          SupplierTab(),
          CustomerTab()
        ])),
      ],
    );
  }
}
