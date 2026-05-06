import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'stock_tab.dart';
import 'opname_tab.dart';
import '../../../core/wms_provider.dart';

class WmsHomeScreen extends ConsumerWidget {
  const WmsHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Tampilkan snackbar jika ada success message
    ref.listen<WmsState>(wmsProvider, (previous, next) {
      if (next.successMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.successMessage!),
            backgroundColor: const Color(0xFF00FF88),
          ),
        );
        ref.read(wmsProvider.notifier).clearMessage();
      }
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: Colors.red,
          ),
        );
        ref.read(wmsProvider.notifier).clearMessage();
      }
    });

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Gudang (WMS)'),
          bottom: const TabBar(
            labelColor: Color(0xFF00F5FF),
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(icon: Icon(Icons.inventory), text: 'Stok'),
              Tab(icon: Icon(Icons.checklist), text: 'Opname'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            StockTab(),
            OpnameTab(),
          ],
        ),
      ),
    );
  }
}
