import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/wms_provider.dart';
import '../models/inventory.dart';

class InventoryTab extends ConsumerStatefulWidget {
  const InventoryTab({super.key});

  @override
  ConsumerState<InventoryTab> createState() => _InventoryTabState();
}

class _InventoryTabState extends ConsumerState<InventoryTab> {
  Future<void> _printLabel(InventoryItem item) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat(80 * PdfPageFormat.mm, 50 * PdfPageFormat.mm),
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(8),
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: PdfColors.black, width: 1),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.center,
              children: [
                pw.Text(
                  item.code,
                  style: pw.TextStyle(
                    fontSize: 10,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.SizedBox(height: 4),
                pw.BarcodeWidget(
                  barcode: pw.Barcode.code128(),
                  data: item.code,
                  width: 60,
                  height: 20,
                ),
                pw.SizedBox(height: 4),
                pw.Text(
                  item.name,
                  style: const pw.TextStyle(fontSize: 7),
                  textAlign: pw.TextAlign.center,
                  maxLines: 2,
                ),
                pw.SizedBox(height: 2),
                pw.Text(
                  'Rp ${_formatPrice(item.price)} / ${item.unit}',
                  style: pw.TextStyle(
                    fontSize: 8,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final wmsState = ref.watch(wmsProvider);
    final items = wmsState.filteredInventory;
    final categories = wmsState.categories;

    return Column(
      children: [
        // Toolbar
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: '🔍 Cari produk...',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 13),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide:
                            const BorderSide(color: AppColors.neonGreen)),
                  ),
                  onChanged: (q) => ref.read(wmsProvider.notifier).setSearch(q),
                ),
              ),
              const SizedBox(width: 12),
              DropdownButton<String>(
                value: wmsState.categoryFilter,
                items: categories
                    .map((c) => DropdownMenuItem(
                        value: c,
                        child: Text(c,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))))
                    .toList(),
                onChanged: (v) =>
                    ref.read(wmsProvider.notifier).setCategoryFilter(v!),
                dropdownColor: AppColors.bgCard,
                underline: const SizedBox(),
                icon: const Icon(Icons.filter_list,
                    color: AppColors.neonGreen, size: 18),
                style:
                    const TextStyle(color: AppColors.neonGreen, fontSize: 12),
              ),
            ],
          ),
        ),
        // Table Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: AppColors.bgCard,
          child: const Row(
            children: [
              Expanded(
                  flex: 2,
                  child: Text('Kode',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 3,
                  child: Text('Nama',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Kategori',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 1,
                  child: Text('Stok',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              SizedBox(width: 80),
            ],
          ),
        ),
        // Table Body
        Expanded(
          child: ListView.builder(
            itemCount: items.length,
            itemBuilder: (ctx, i) {
              final item = items[i];
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  border: Border(
                      bottom: BorderSide(
                          color: AppColors.borderNeon.withOpacity(0.5))),
                ),
                child: Row(
                  children: [
                    Expanded(
                        flex: 2,
                        child: Text(item.code,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 3,
                        child: Text(item.name,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(item.category,
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                      flex: 1,
                      child: Text(
                        '${item.stock}',
                        style: TextStyle(
                          color: item.isLowStock
                              ? AppColors.neonOrange
                              : AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 80,
                      child: ElevatedButton.icon(
                        onPressed: () => _printLabel(item),
                        icon: const Icon(Icons.qr_code_2, size: 14),
                        label:
                            const Text('Label', style: TextStyle(fontSize: 10)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.neonCyan.withOpacity(0.15),
                          foregroundColor: AppColors.neonCyan,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 4),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4),
                            side: const BorderSide(
                                color: AppColors.neonCyan, width: 0.5),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        if (wmsState.isLoading)
          const LinearProgressIndicator(color: AppColors.neonGreen),
      ],
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]}.',
        );
  }
}
