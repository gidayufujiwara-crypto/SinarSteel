import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:excel/excel.dart' as excel;
import 'package:path_provider/path_provider.dart';
import 'dart:io' show File;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:html'
    as html; // ignore: avoid_web_libraries_in_flutter, deprecated_member_use
import '../../../core/theme/app_theme.dart';
import '../providers/report_provider.dart';

class SalesReportTab extends ConsumerStatefulWidget {
  const SalesReportTab({super.key});

  @override
  ConsumerState<SalesReportTab> createState() => _SalesReportTabState();
}

class _SalesReportTabState extends ConsumerState<SalesReportTab> {
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();

  @override
  void dispose() {
    _fromCtrl.dispose();
    _toCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref.read(reportProvider.notifier).setSalesFilter(
          _fromCtrl.text.trim(),
          _toCtrl.text.trim(),
        );
  }

  Future<void> _exportExcel() async {
    final data = ref.read(reportProvider).filteredSales;
    final ex = excel.Excel.createExcel();
    final sheet = ex['Penjualan'];
    sheet.appendRow([
      excel.TextCellValue('Tanggal'),
      excel.TextCellValue('No Transaksi'),
      excel.TextCellValue('Pelanggan'),
      excel.TextCellValue('Produk'),
      excel.TextCellValue('Qty'),
      excel.TextCellValue('Total'),
    ]);
    for (var row in data) {
      sheet.appendRow([
        excel.TextCellValue(row['date'] ?? ''),
        excel.TextCellValue(row['order_number'] ?? ''),
        excel.TextCellValue(row['customer'] ?? ''),
        excel.TextCellValue(row['product'] ?? ''),
        excel.TextCellValue(row['quantity']?.toString() ?? '0'),
        excel.TextCellValue((row['total'] ?? 0).toString()),
      ]);
    }
    final bytes = ex.save();
    if (bytes == null) return;

    if (kIsWeb) {
      final blob = html.Blob([bytes],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      final url = html.Url.createObjectUrlFromBlob(blob);
      html.AnchorElement(href: url)
        ..setAttribute('download', 'laporan_penjualan.xlsx')
        ..click();
      html.Url.revokeObjectUrl(url);
    } else {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/laporan_penjualan.xlsx');
      await file.writeAsBytes(bytes);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('File disimpan di ${file.path}'),
              backgroundColor: AppColors.neonGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final reportState = ref.watch(reportProvider);
    final data = reportState.filteredSales;

    double totalRevenue = 0;
    for (var row in data) {
      totalRevenue += (row['total'] ?? 0) as num;
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              Expanded(
                  child: TextField(
                      controller: _fromCtrl,
                      style: const TextStyle(
                          color: AppColors.textPrimary, fontSize: 12),
                      decoration: _filterDecoration('Dari (YYYY-MM-DD)'))),
              const SizedBox(width: 8),
              Expanded(
                  child: TextField(
                      controller: _toCtrl,
                      style: const TextStyle(
                          color: AppColors.textPrimary, fontSize: 12),
                      decoration: _filterDecoration('Sampai (YYYY-MM-DD)'))),
              const SizedBox(width: 8),
              ElevatedButton(
                  onPressed: _applyFilter,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.neonOrange,
                      foregroundColor: AppColors.bgDark,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10)),
                  child: const Text('Filter', style: TextStyle(fontSize: 11))),
              const SizedBox(width: 8),
              IconButton(
                  onPressed: _exportExcel,
                  icon: const Icon(Icons.download, size: 20),
                  color: AppColors.neonGreen,
                  tooltip: 'Export Excel'),
              Text('Total: Rp ${_formatPrice(totalRevenue)}',
                  style: const TextStyle(
                      color: AppColors.neonGreen, fontSize: 13)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: AppColors.bgCard,
          child: const Row(
            children: [
              Expanded(
                  flex: 2,
                  child: Text('Tanggal',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 3,
                  child: Text('No Transaksi',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Pelanggan',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 3,
                  child: Text('Produk',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 1,
                  child: Text('Qty',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Total',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: data.length,
            itemBuilder: (ctx, i) {
              final row = data[i];
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                    border: Border(
                        bottom: BorderSide(
                            color: AppColors.borderNeon.withOpacity(0.3)))),
                child: Row(
                  children: [
                    Expanded(
                        flex: 2,
                        child: Text(row['date'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 3,
                        child: Text(row['order_number'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(row['customer'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 3,
                        child: Text(row['product'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 1,
                        child: Text(row['quantity']?.toString() ?? '0',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(
                            'Rp ${_formatPrice((row['total'] ?? 0).toDouble())}',
                            style: const TextStyle(
                                color: AppColors.neonGreen, fontSize: 11))),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  InputDecoration _filterDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textDim, fontSize: 12),
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        fillColor: AppColors.bgDark,
        filled: true,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(4),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
      );

  String _formatPrice(double price) {
    return price
        .toStringAsFixed(0)
        .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }
}
