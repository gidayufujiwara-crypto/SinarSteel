import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/pos_provider.dart';
import '../../../core/auth_provider.dart';

class ProductTab extends ConsumerStatefulWidget {
  const ProductTab({super.key});

  @override
  ConsumerState<ProductTab> createState() => _ProductTabState();
}

class _ProductTabState extends ConsumerState<ProductTab> {
  final TextEditingController _searchCtrl = TextEditingController();
  List<dynamic> _products = [];

  Future<void> _search(String query) async {
    final api = ref.read(apiClientProvider);
    final res =
        await api.dio.get('/master/produk', queryParameters: {'search': query});
    setState(() => _products = (res.data as List)
        .where((p) => p['is_active'] == true && p['stok'] > 0)
        .toList());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            controller: _searchCtrl,
            decoration: const InputDecoration(
                labelText: 'Cari produk',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder()),
            onChanged: (v) => _search(v),
          ),
        ),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, childAspectRatio: 1.2),
            itemCount: _products.length,
            itemBuilder: (ctx, i) {
              final p = _products[i];
              return Card(
                child: InkWell(
                  onTap: () => ref.read(posProvider.notifier).addToCart(p),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Column(
                      children: [
                        Text(p['nama'],
                            style: const TextStyle(fontWeight: FontWeight.bold),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                        Text(
                            'Rp ${double.tryParse(p['harga_jual'].toString())?.toStringAsFixed(0) ?? 0}'),
                        Text('Stok: ${p['stok']}'),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
