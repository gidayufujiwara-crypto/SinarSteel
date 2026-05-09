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

class StockReportTab extends ConsumerWidget {
  const StockReportTab({super.key});

  Future<void> _exportExcel(
      List<Map<String, dynamic>> data, BuildContext context) async {
    final ex = excel.Excel.createExcel();
    final sheet = ex['Stok'];
    sheet.appendRow([
      excel.TextCellValue('Kode'),
      excel.TextCellValue('Nama'),
      excel.TextCellValue('Kategori'),
      excel.TextCellValue('Unit'),
      excel.TextCellValue('Stok'),
      excel.TextCellValue('Harga Jual'),
      excel.TextCellValue('Nilai Stok'),
    ]);
    for (var row in data) {
      final qty = (row['stock'] ?? 0) as num;
      final price = (row['selling_price'] ?? 0) as num;
      sheet.appendRow([
        excel.TextCellValue(row['code'] ?? ''),
        excel.TextCellValue(row['name'] ?? ''),
        excel.TextCellValue(row['category'] ?? ''),
        excel.TextCellValue(row['unit'] ?? ''),
        excel.TextCellValue(qty.toString()),
        excel.TextCellValue(price.toString()),
        excel.TextCellValue((qty * price).toString()),
      ]);
    }
    final bytes = ex.save();
    if (bytes == null) return;

    if (kIsWeb) {
      final blob = html.Blob([bytes],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      final url = html.Url.createObjectUrlFromBlob(blob);
      html.AnchorElement(href: url)
        ..setAttribute('download', 'laporan_stok.xlsx')
        ..click();
      html.Url.revokeObjectUrl(url);
    } else {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/laporan_stok.xlsx');
      await file.writeAsBytes(bytes);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('File disimpan di ${file.path}'),
              backgroundColor: AppColors.neonGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stockData = ref.watch(reportProvider).stockData;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              const Text('Ringkasan Stok',
                  style: TextStyle(color: AppColors.neonOrange, fontSize: 14)),
              const Spacer(),
              IconButton(
                onPressed: () => _exportExcel(stockData, context),
                icon: const Icon(Icons.download, size: 20),
                color: AppColors.neonGreen,
                tooltip: 'Export Excel',
              ),
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
              Expanded(
                  flex: 2,
                  child: Text('Harga',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: stockData.length,
            itemBuilder: (ctx, i) {
              final row = stockData[i];
              final stock = (row['stock'] ?? 0) as num;
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
                        child: Text(row['code'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 3,
                        child: Text(row['name'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(row['category'] ?? '',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 1,
                        child: Text(stock.toString(),
                            style: TextStyle(
                                color: stock <= 10
                                    ? AppColors.neonOrange
                                    : AppColors.textPrimary,
                                fontSize: 12,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text(
                            'Rp ${_formatPrice((row['selling_price'] ?? 0).toDouble())}',
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

  String _formatPrice(double price) {
    return price
        .toStringAsFixed(0)
        .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }
}
