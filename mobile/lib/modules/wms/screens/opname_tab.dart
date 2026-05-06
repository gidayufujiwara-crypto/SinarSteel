import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/wms_provider.dart';
import '../../../core/auth_provider.dart';

class OpnameTab extends ConsumerStatefulWidget {
  const OpnameTab({super.key});

  @override
  ConsumerState<OpnameTab> createState() => _OpnameTabState();
}

class _OpnameTabState extends ConsumerState<OpnameTab> {
  List<Map<String, dynamic>> _products = [];
  List<Map<String, dynamic>> _selectedItems = [];
  final _keteranganCtrl = TextEditingController();
  bool _loadingProducts = false;

  Future<void> _loadProducts() async {
    setState(() => _loadingProducts = true);
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.dio.get('/master/produk');
      final List data = res.data;
      final active = data.where((p) => p['is_active'] == true).toList();
      setState(() {
        _products = active.cast<Map<String, dynamic>>();
        _selectedItems = _products.map<Map<String, dynamic>>((p) {
          final stok = (p['stok'] as num?)?.toInt() ?? 0;
          return {
            'produk_id': p['id'],
            'nama': p['nama'] ?? '',
            'sku': p['sku'] ?? '',
            'stok_sistem': stok,
            'qty_fisik': stok, // default = stok sistem
            'selisih': 0,
          };
        }).toList();
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Gagal memuat produk: $e'),
              backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingProducts = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  @override
  void dispose() {
    _keteranganCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // Hanya kirim item yang berbeda dari stok sistem
    final itemsToSubmit = _selectedItems
        .where((item) => item['qty_fisik'] != item['stok_sistem'])
        .map((item) => {
              'produk_id': item['produk_id'],
              'qty_fisik': item['qty_fisik'],
            })
        .toList();

    if (itemsToSubmit.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Tidak ada perubahan stok'),
            backgroundColor: Colors.orange),
      );
      return;
    }

    await ref
        .read(wmsProvider.notifier)
        .submitOpname(itemsToSubmit, _keteranganCtrl.text);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(wmsProvider);

    if (_loadingProducts) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_products.isEmpty) {
      return const Center(child: Text('Tidak ada produk aktif'));
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            controller: _keteranganCtrl,
            decoration: const InputDecoration(
              labelText: 'Keterangan',
              hintText: 'Opsional: alasan atau catatan opname',
              border: OutlineInputBorder(),
            ),
            maxLines: 2,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Daftar Produk',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Text(
                '${_selectedItems.where((i) => i['qty_fisik'] != i['stok_sistem']).length} perubahan',
                style: const TextStyle(color: Colors.orange, fontSize: 12),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _selectedItems.length,
            itemBuilder: (ctx, i) {
              final item = _selectedItems[i];
              final stokSistem = item['stok_sistem'] as int;
              final qtyFisik = item['qty_fisik'] as int;
              final selisih = qtyFisik - stokSistem;
              final hasChanged = selisih != 0;

              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                color: hasChanged ? Colors.orange.withValues(alpha: 0.1) : null,
                child: ListTile(
                  title: Text(
                    item['nama'] as String,
                    style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('SKU: ${item['sku']}  |  Sistem: $stokSistem'),
                      if (hasChanged)
                        Text(
                          'Selisih: ${selisih > 0 ? "+" : ""}$selisih',
                          style: TextStyle(
                            color: selisih > 0 ? Colors.green : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                  trailing: SizedBox(
                    width: 100,
                    child: TextFormField(
                      initialValue: qtyFisik.toString(),
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      decoration: InputDecoration(
                        labelText: 'Fisik',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        filled: true,
                        fillColor: hasChanged
                            ? Colors.orange.withValues(alpha: 0.05)
                            : null,
                      ),
                      onChanged: (v) {
                        final newQty = int.tryParse(v) ?? 0;
                        setState(() {
                          _selectedItems[i]['qty_fisik'] = newQty;
                        });
                      },
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: state.loading ? null : _submit,
              icon: state.loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.save),
              label:
                  Text(state.loading ? 'MENYIMPAN...' : 'SIMPAN STOCK OPNAME'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF88),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
