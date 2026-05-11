import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:excel/excel.dart' as excel;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/export_helper.dart';
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
      excel.TextCellValue('Total'),
      excel.TextCellValue('Pembayaran'),
    ]);
    for (var row in data) {
      final total = _parseNum(row['total']);
      sheet.appendRow([
        excel.TextCellValue(row['tanggal'] ?? ''),
        excel.TextCellValue(row['no_transaksi'] ?? ''),
        excel.TextCellValue(row['pelanggan'] ?? ''),
        excel.TextCellValue(total.toString()),
        excel.TextCellValue(row['jenis_pembayaran'] ?? ''),
      ]);
    }
    final bytes = ex.save();
    if (bytes != null) {
      saveExcel(bytes, 'laporan_penjualan.xlsx');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('File Excel disimpan'),
              backgroundColor: AppColors.neonGreen),
        );
      }
    }
  }

  double _parseNum(dynamic val) {
    if (val == null) return 0;
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0;
  }

  @override
  Widget build(BuildContext context) {
    final reportState = ref.watch(reportProvider);
    final data = reportState.filteredSales;

    double totalRevenue = 0;
    for (var row in data) {
      totalRevenue += _parseNum(row['total']);
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
                  flex: 2,
                  child: Text('Total',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Pembayaran',
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
              final total = _parseNum(row['total']);
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
                        child: Text(row['tanggal'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 3,
                        child: Text(row['no_transaksi'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(row['pelanggan'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 2,
                        child: Text('Rp ${_formatPrice(total)}',
                            style: const TextStyle(
                                color: AppColors.neonGreen, fontSize: 11))),
                    Expanded(
                        flex: 2,
                        child: Text(row['jenis_pembayaran'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
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
