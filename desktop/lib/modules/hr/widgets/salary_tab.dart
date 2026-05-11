import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hr_provider.dart';

class SalaryTab extends ConsumerWidget {
  const SalaryTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(hrProvider);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
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
                      ref.read(hrProvider.notifier).setSalaryFilterBulan(v),
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
                      ref.read(hrProvider.notifier).setSalaryFilterTahun(v),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: () => ref.read(hrProvider.notifier).fetchSalary(),
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
                  child: Text('Periode',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Gaji Pokok',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Bonus/Denda',
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
            itemCount: state.salarySlips.length,
            itemBuilder: (ctx, i) {
              final s = state.salarySlips[i];
              final delta = s.bonus - s.deduction;
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
                        child: Text(s.employeeName,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                        flex: 2,
                        child: Text(s.period,
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 2,
                        child: Text('Rp ${_fmt(s.baseSalary)}',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 11))),
                    Expanded(
                      flex: 2,
                      child: Text(
                        delta >= 0 ? '+${_fmt(delta)}' : '-${_fmt(-delta)}',
                        style: TextStyle(
                            color: delta >= 0
                                ? AppColors.neonGreen
                                : AppColors.neonPink,
                            fontSize: 11),
                      ),
                    ),
                    Expanded(
                        flex: 2,
                        child: Text('Rp ${_fmt(s.total)}',
                            style: const TextStyle(
                                color: AppColors.neonGreen,
                                fontSize: 12,
                                fontWeight: FontWeight.w600))),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _fmt(double v) => v
      .toStringAsFixed(0)
      .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
}
