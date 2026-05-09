import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:excel/excel.dart' as excel;
import 'package:path_provider/path_provider.dart';
import 'dart:io' show File;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:html' as html; // ignore: avoid_web_libraries_in_flutter, deprecated_member_use
import '../../../core/theme/app_theme.dart';
import '../providers/report_provider.dart';

class DeliveryReportTab extends ConsumerStatefulWidget {
  const DeliveryReportTab({super.key});

  @override
  ConsumerState<DeliveryReportTab> createState() => _DeliveryReportTabState();
}

class _DeliveryReportTabState extends ConsumerState<DeliveryReportTab> {
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();

  @override
  void dispose() {
    _fromCtrl.dispose();
    _toCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref.read(reportProvider.notifier).setDeliveryFilter(
      _fromCtrl.text.trim(),
      _toCtrl.text.trim(),
    );
  }

  Future<void> _exportExcel(List<Map<String, dynamic>> data) async {
    final ex = excel.Excel.createExcel();
    final sheet = ex['Pengiriman'];
    sheet.appendRow([
      excel.TextCellValue('No Order'),
      excel.TextCellValue('Customer'),
      excel.TextCellValue('Driver'),
      excel.TextCellValue('Status'),
      excel.TextCellValue('Total'),
      excel.TextCellValue('Tanggal'),
    ]);
    for (var row in data) {
      sheet.appendRow([
        excel.TextCellValue(row['order_number'] ?? ''),
        excel.TextCellValue(row['customer_name'] ?? ''),
        excel.TextCellValue(row['driver_name'] ?? ''),
        excel.TextCellValue(row['status'] ?? ''),
        excel.TextCellValue((row['total_amount'] ?? 0).toString()),
        excel.TextCellValue(row['created_at'] ?? ''),
      ]);
    }
    final bytes = ex.save();
    if (bytes == null) return;

    if (kIsWeb) {
      final blob = html.Blob([bytes], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      final url = html.Url.createObjectUrlFromBlob(blob);
      html.AnchorElement(href: url)
        ..setAttribute('download', 'laporan_pengiriman.xlsx')
        ..click();
      html.Url.revokeObjectUrl(url);
    } else {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/laporan_pengiriman.xlsx');
      await file.writeAsBytes(bytes);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('File disimpan di ${file.path}'), backgroundColor: AppColors.neonGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final reportState = ref.watch(reportProvider);
    final data = reportState.filteredDelivery;

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              Expanded(child: TextField(controller: _fromCtrl, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12), decoration: _filterDecoration('Dari (YYYY-MM-DD)'))),
              const SizedBox(width: 8),
              Expanded(child: TextField(controller: _toCtrl, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12), decoration: _filterDecoration('Sampai (YYYY-MM-DD)'))),
              const SizedBox(width: 8),
              ElevatedButton(onPressed: _applyFilter, style: ElevatedButton.styleFrom(backgroundColor: AppColors.neonOrange, foregroundColor: AppColors.bgDark, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10)), child: const Text('Filter', style: TextStyle(fontSize: 11))),
              const SizedBox(width: 8),
              IconButton(onPressed: () => _exportExcel(data), icon: const Icon(Icons.download, size: 20), color: AppColors.neonGreen, tooltip: 'Export Excel'),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: AppColors.bgCard,
          child: const Row(
            children: [
              Expanded(flex: 2, child: Text('No Order', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 3, child: Text('Customer', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Driver', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Status', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Total', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Tanggal', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: data.length,
            itemBuilder: (ctx, i) {
              final row = data[i];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderNeon.withOpacity(0.3)))),
                child: Row(
                  children: [
                    Expanded(flex: 2, child: Text(row['order_number'] ?? '', style: const TextStyle(color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(flex: 3, child: Text(row['customer_name'] ?? '', style: const TextStyle(color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(flex: 2, child: Text(row['driver_name'] ?? '-', style: const TextStyle(color: AppColors.textDim, fontSize: 11))),
                    Expanded(flex: 2, child: Text(row['status'] ?? '', style: const TextStyle(color: AppColors.textDim, fontSize: 11))),
                    Expanded(flex: 2, child: Text('Rp ${_formatPrice((row['total_amount'] ?? 0).toDouble())}', style: const TextStyle(color: AppColors.neonGreen, fontSize: 11))),
                    Expanded(flex: 2, child: Text(_formatDate(row['created_at'] ?? ''), style: const TextStyle(color: AppColors.textDim, fontSize: 10))),
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
    hintText: hint, hintStyle: const TextStyle(color: AppColors.textDim, fontSize: 12),
    isDense: true, contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
    fillColor: AppColors.bgDark, filled: true,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: const BorderSide(color: AppColors.borderNeon)),
  );

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }

  String _formatDate(String str) {
    if (str.isEmpty) return '-';
    try { final dt = DateTime.parse(str); return '${dt.day}/${dt.month}/${dt.year}'; } catch (_) { return str.length > 10 ? str.substring(0, 10) : str; }
  }
}