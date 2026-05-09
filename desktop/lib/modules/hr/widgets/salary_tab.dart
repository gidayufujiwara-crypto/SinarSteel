import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hr_provider.dart';

class SalaryTab extends ConsumerWidget {
  const SalaryTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hrState = ref.watch(hrProvider);
    final slips = hrState.filteredSalarySlips;

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
                  onChanged: (v) =>
                      ref.read(hrProvider.notifier).setSalaryFilter(v.trim()),
                ),
              ),
              const SizedBox(width: 8),
              if (hrState.salaryFilterMonth.isNotEmpty)
                TextButton(
                  onPressed: () =>
                      ref.read(hrProvider.notifier).setSalaryFilter(''),
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
        // List
        Expanded(
          child: ListView.builder(
            itemCount: slips.length,
            itemBuilder: (ctx, i) {
              final s = slips[i];
              final delta = s.bonus - s.deduction;
              return Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
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
                        child: Text('Rp ${_formatPrice(s.baseSalary)}',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 11))),
                    Expanded(
                      flex: 2,
                      child: Text(
                        delta >= 0
                            ? '+${_formatPrice(delta.toDouble())}'
                            : '-${_formatPrice((-delta).toDouble())}',
                        style: TextStyle(
                            color: delta >= 0
                                ? AppColors.neonGreen
                                : AppColors.neonPink,
                            fontSize: 11,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                    Expanded(
                        flex: 2,
                        child: Text('Rp ${_formatPrice(s.total)}',
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

  String _formatPrice(double price) {
    return price
        .toStringAsFixed(0)
        .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }
}
