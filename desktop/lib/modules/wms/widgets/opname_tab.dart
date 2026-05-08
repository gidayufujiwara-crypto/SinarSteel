import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/wms_provider.dart';

class OpnameTab extends ConsumerStatefulWidget {
  const OpnameTab({super.key});

  @override
  ConsumerState<OpnameTab> createState() => _OpnameTabState();
}

class _OpnameTabState extends ConsumerState<OpnameTab> {
  String? _selectedProductId;
  int _physicalStock = 0;
  final _noteCtrl = TextEditingController();

  @override
  void dispose() {
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitOpname() async {
    if (_selectedProductId == null) return;
    final error = await ref.read(wmsProvider.notifier).submitOpname(
          _selectedProductId!,
          _physicalStock,
          _noteCtrl.text.trim().isEmpty ? null : _noteCtrl.text.trim(),
        );
    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: AppColors.neonOrange),
      );
      return;
    }
    setState(() {
      _selectedProductId = null;
      _physicalStock = 0;
      _noteCtrl.clear();
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Opname berhasil!'),
            backgroundColor: AppColors.neonGreen),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final wmsState = ref.watch(wmsProvider);
    final inventory = wmsState.inventory;
    final opnames = wmsState.opnameHistory;

    return Row(
      children: [
        // Form Opname (40%)
        Expanded(
          flex: 4,
          child: Container(
            color: AppColors.bgPanel,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('STOCK OPNAME',
                    style: TextStyle(
                        color: AppColors.neonGreen,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1)),
                const SizedBox(height: 16),
                // Dropdown Produk
                DropdownButtonFormField<String>(
                  value: _selectedProductId,
                  items: inventory
                      .map((p) => DropdownMenuItem(
                            value: p.id,
                            child: Text(
                                '${p.code} - ${p.name} (Stok: ${p.stock})',
                                style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 12)),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedProductId = v),
                  decoration: _inputDecoration('Pilih Produk'),
                  dropdownColor: AppColors.bgCard,
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                ),
                const SizedBox(height: 16),
                // Stok Sistem (readonly)
                if (_selectedProductId != null)
                  Text(
                    'Stok Sistem: ${inventory.firstWhere((p) => p.id == _selectedProductId).stock}',
                    style:
                        const TextStyle(color: AppColors.textDim, fontSize: 13),
                  ),
                const SizedBox(height: 8),
                // Input Fisik
                TextFormField(
                  initialValue:
                      _physicalStock == 0 ? '' : _physicalStock.toString(),
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                  keyboardType: TextInputType.number,
                  decoration: _inputDecoration('Stok Fisik'),
                  onChanged: (v) {
                    final val = int.tryParse(v) ?? 0;
                    setState(() => _physicalStock = val);
                  },
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _noteCtrl,
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                  maxLines: 2,
                  decoration: _inputDecoration('Catatan'),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _submitOpname,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.neonGreen,
                    foregroundColor: AppColors.bgDark,
                  ),
                  child: const Text('SIMPAN OPNAME'),
                ),
              ],
            ),
          ),
        ),
        const VerticalDivider(width: 1, color: AppColors.borderNeon),
        // Riwayat Opname (60%)
        Expanded(
          flex: 6,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                color: AppColors.bgCard,
                child: const Text('RIWAYAT OPNAME',
                    style: TextStyle(
                        color: AppColors.neonGreen,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                color: AppColors.bgPanel,
                child: const Row(
                  children: [
                    Expanded(
                        flex: 3,
                        child: Text('Produk',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Sistem',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Fisik',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Selisih',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Tanggal',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: opnames.length,
                  itemBuilder: (ctx, i) {
                    final o = opnames[i];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                          border: Border(
                              bottom: BorderSide(
                                  color:
                                      AppColors.borderNeon.withOpacity(0.3)))),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 3,
                              child: Text(o.productName,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 11))),
                          Expanded(
                              flex: 2,
                              child: Text('${o.systemStock}',
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 11))),
                          Expanded(
                              flex: 2,
                              child: Text('${o.physicalStock}',
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 11))),
                          Expanded(
                            flex: 2,
                            child: Text(
                              '${o.difference >= 0 ? "+" : ""}${o.difference}',
                              style: TextStyle(
                                color: o.difference == 0
                                    ? AppColors.textDim
                                    : (o.difference > 0
                                        ? AppColors.neonGreen
                                        : AppColors.neonOrange),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Expanded(
                              flex: 2,
                              child: Text(_formatDate(o.date),
                                  style: const TextStyle(
                                      color: AppColors.textDim, fontSize: 10))),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textDim, fontSize: 11),
        filled: true,
        fillColor: AppColors.bgDark,
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.neonGreen)),
      );

  String _formatDate(String str) {
    if (str.isEmpty) return '-';
    try {
      final dt = DateTime.parse(str);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return str.substring(0, str.length > 10 ? 10 : str.length);
    }
  }
}
