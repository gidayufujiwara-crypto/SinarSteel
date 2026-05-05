import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/pos_provider.dart';
import 'product_tab.dart';
import 'cart_tab.dart';

class PosHomeScreen extends ConsumerWidget {
  const PosHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final posState = ref.watch(posProvider);
    final tabs = <Widget>[
      const ProductTab(),
      if (posState.cart.isNotEmpty) const CartTab()
    ];

    return Scaffold(
      body: tabs.length == 2
          ? DefaultTabController(
              length: tabs.length,
              child: Column(
                children: [
                  Expanded(child: TabBarView(children: tabs)),
                ],
              ),
            )
          : const ProductTab(),
      bottomNavigationBar: posState.cart.isNotEmpty
          ? const TabBar(
              tabs: [
                Tab(icon: Icon(Icons.store), text: 'Produk'),
                Tab(icon: Icon(Icons.shopping_cart), text: 'Keranjang'),
              ],
              labelColor: Color(0xFF00F5FF),
            )
          : null,
    );
  }
}
