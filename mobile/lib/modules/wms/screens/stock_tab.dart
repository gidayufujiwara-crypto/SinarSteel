import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/wms_provider.dart';

class StockTab extends ConsumerStatefulWidget {
  const StockTab({super.key});

  @override
  ConsumerState<StockTab> createState() => _StockTabState();
}

class _StockTabState extends ConsumerState<StockTab> {
  final TextEditingController _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(wmsProvider.notifier).fetchStock());
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(wmsProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            controller: _searchCtrl,
            decoration: const InputDecoration(
              labelText: 'Cari produk',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
              suffixIcon: Icon(Icons.clear),
            ),
            onChanged: (v) {
              ref.read(wmsProvider.notifier).fetchStock(search: v);
            },
          ),
        ),
        if (state.loading)
          const Expanded(child: Center(child: CircularProgressIndicator()))
        else if (state.stockList.isEmpty)
          const Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('Tidak ada data stok',
                      style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          )
        else
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => ref.read(wmsProvider.notifier).fetchStock(),
              child: ListView.builder(
                itemCount: state.stockList.length,
                itemBuilder: (ctx, i) {
                  final p = state.stockList[i];
                  final stok = (p['stok'] as num?)?.toInt() ?? 0;
                  final min = (p['stok_minimum'] as num?)?.toInt() ?? 0;
                  final isLow = stok <= min;
                  final hargaJual = (p['harga_jual'] as num?)?.toDouble() ?? 0;

                  return Card(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isLow
                            ? Colors.orange.withValues(alpha: 0.2)
                            : Colors.cyan.withValues(alpha: 0.2),
                        child: Icon(
                          isLow ? Icons.warning : Icons.inventory,
                          color: isLow ? Colors.orange : Colors.cyan,
                        ),
                      ),
                      title: Text(
                        p['nama'] ?? 'Tanpa Nama',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('SKU: ${p['sku'] ?? '-'}'),
                          Row(
                            children: [
                              Text(
                                'Stok: $stok',
                                style: TextStyle(
                                  color: isLow ? Colors.orange : Colors.white,
                                  fontWeight: isLow
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text('(Min: $min)'),
                            ],
                          ),
                        ],
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Rp ${hargaJual.toStringAsFixed(0)}',
                            style: const TextStyle(
                              color: Color(0xFF00F5FF),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (isLow)
                            const Text(
                              '⚠️ KRITIS',
                              style:
                                  TextStyle(color: Colors.orange, fontSize: 10),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}
