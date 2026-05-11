import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:excel/excel.dart' as excel;
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/export_helper.dart';
import '../providers/report_provider.dart';

class AttendanceReportTab extends ConsumerStatefulWidget {
  const AttendanceReportTab({super.key});
  @override
  ConsumerState<AttendanceReportTab> createState() =>
      _AttendanceReportTabState();
}

class _AttendanceReportTabState extends ConsumerState<AttendanceReportTab> {
  final _monthCtrl = TextEditingController();

  @override
  void dispose() {
    _monthCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref
        .read(reportProvider.notifier)
        .setAttendanceMonth(_monthCtrl.text.trim());
  }

  Future<void> _exportExcel(List<Map<String, dynamic>> data) async {
    final ex = excel.Excel.createExcel();
    final sheet = ex['Absensi'];
    sheet.appendRow([
      excel.TextCellValue('Nama'),
      excel.TextCellValue('Tanggal'),
      excel.TextCellValue('Status'),
      excel.TextCellValue('Check In'),
      excel.TextCellValue('Check Out'),
    ]);
    for (var row in data) {
      sheet.appendRow([
        excel.TextCellValue(row['employee_name'] ?? ''),
        excel.TextCellValue(row['date'] ?? ''),
        excel.TextCellValue(row['status'] ?? ''),
        excel.TextCellValue(row['check_in'] ?? ''),
        excel.TextCellValue(row['check_out'] ?? ''),
      ]);
    }
    final bytes = ex.save();
    if (bytes != null) {
      saveExcel(bytes, 'laporan_absensi.xlsx');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('File Excel disimpan'),
              backgroundColor: AppColors.neonGreen),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final reportState = ref.watch(reportProvider);
    final data = reportState.filteredAttendance;
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              SizedBox(
                width: 150,
                child: TextField(
                  controller: _monthCtrl,
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 12),
                  decoration: InputDecoration(
                    hintText: 'YYYY-MM',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 12),
                    isDense: true,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(4),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                  onPressed: _applyFilter,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.neonOrange,
                      foregroundColor: AppColors.bgDark,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10)),
                  child: const Text('Filter', style: TextStyle(fontSize: 11))),
              const Spacer(),
              IconButton(
                onPressed: () => _exportExcel(data),
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
                  flex: 3,
                  child: Text('Nama',
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
              Expanded(
                  flex: 2,
                  child: Text('Status',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Check In',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Check Out',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
            ],
          ),
        ),
        Expanded(
          child: data.isEmpty
              ? const Center(
                  child: Text('Belum ada data absensi',
                      style: TextStyle(color: AppColors.textDim)))
              : ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (ctx, i) {
                    final row = data[i];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                          border: Border(
                              bottom: BorderSide(
                                  color:
                                      AppColors.borderNeon.withOpacity(0.3)))),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 3,
                              child: Text(row['employee_name'] ?? '',
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12))),
                          Expanded(
                              flex: 2,
                              child: Text(row['date'] ?? '',
                                  style: const TextStyle(
                                      color: AppColors.textDim, fontSize: 11))),
                          Expanded(
                              flex: 2,
                              child: Text(row['status'] ?? '',
                                  style: TextStyle(
                                      color: _statusColor(row['status'] ?? ''),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600))),
                          Expanded(
                              flex: 2,
                              child: Text(row['check_in'] ?? '-',
                                  style: const TextStyle(
                                      color: AppColors.textDim, fontSize: 11))),
                          Expanded(
                              flex: 2,
                              child: Text(row['check_out'] ?? '-',
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

  Color _statusColor(String status) {
    switch (status) {
      case 'hadir':
        return AppColors.neonGreen;
      case 'izin':
        return AppColors.neonYellow;
      case 'sakit':
        return AppColors.neonCyan;
      case 'alpha':
        return AppColors.neonPink;
      default:
        return AppColors.textDim;
    }
  }
}
