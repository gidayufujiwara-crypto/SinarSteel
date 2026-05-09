import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hr_provider.dart';

class AttendanceTab extends ConsumerWidget {
  const AttendanceTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hrState = ref.watch(hrProvider);
    final attendances = hrState.filteredAttendances;

    return Column(
      children: [
        // Filter
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              const Text('Periode:',
                  style: TextStyle(color: AppColors.textDim, fontSize: 12)),
              const SizedBox(width: 8),
              SizedBox(
                width: 150,
                child: TextField(
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
                  onChanged: (v) => ref
                      .read(hrProvider.notifier)
                      .setAttendanceFilter(v.trim()),
                ),
              ),
              const SizedBox(width: 8),
              if (hrState.attendanceFilterMonth.isNotEmpty)
                TextButton(
                  onPressed: () =>
                      ref.read(hrProvider.notifier).setAttendanceFilter(''),
                  child: const Text('Semua',
                      style:
                          TextStyle(color: AppColors.neonCyan, fontSize: 11)),
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
                  flex: 3,
                  child: Text('Karyawan',
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
        // List
        Expanded(
          child: ListView.builder(
            itemCount: attendances.length,
            itemBuilder: (ctx, i) {
              final a = attendances[i];
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
                        flex: 3,
                        child: Text(a.employeeName,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
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
