import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hr_provider.dart';

class AttendanceTab extends ConsumerWidget {
  const AttendanceTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(hrProvider);
    return Column(
      children: [
        // Pilih Karyawan + Filter bulan/tahun
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: state.selectedKaryawanId,
                  items: state.employees
                      .map((e) => DropdownMenuItem(
                            value: e.id,
                            child: Text(e.fullName,
                                style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13)),
                          ))
                      .toList(),
                  onChanged: (v) =>
                      ref.read(hrProvider.notifier).selectKaryawan(v!),
                  decoration: const InputDecoration(
                    labelText: 'Pilih Karyawan',
                    labelStyle:
                        TextStyle(color: AppColors.textDim, fontSize: 11),
                    filled: true,
                    fillColor: AppColors.bgDark,
                    isDense: true,
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(),
                  ),
                  dropdownColor: AppColors.bgCard,
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 80,
                child: TextField(
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: 'Bulan',
                    hintStyle:
                        TextStyle(color: AppColors.textDim, fontSize: 12),
                    isDense: true,
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    filled: true,
                    fillColor: AppColors.bgDark,
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (v) =>
                      ref.read(hrProvider.notifier).setAttendanceFilterBulan(v),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 80,
                child: TextField(
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: 'Tahun',
                    hintStyle:
                        TextStyle(color: AppColors.textDim, fontSize: 12),
                    isDense: true,
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    filled: true,
                    fillColor: AppColors.bgDark,
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (v) =>
                      ref.read(hrProvider.notifier).setAttendanceFilterTahun(v),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () =>
                    ref.read(hrProvider.notifier).fetchAttendance(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.neonPink,
                  foregroundColor: AppColors.bgDark,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                child: const Text('Lihat', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
        // Header
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
        // List
        Expanded(
          child: ListView.builder(
            itemCount: state.attendances.length,
            itemBuilder: (ctx, i) {
              final a = state.attendances[i];
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
                        child: Text(a.date,
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _statusColor(a.status).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(a.status.toUpperCase(),
                            style: TextStyle(
                                color: _statusColor(a.status),
                                fontSize: 10,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                    Expanded(
                        flex: 2,
                        child: Text(a.checkIn ?? '-',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 2,
                        child: Text(a.checkOut ?? '-',
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
