import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/wms_provider.dart';

class MutationTab extends ConsumerWidget {
  const MutationTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wmsState = ref.watch(wmsProvider);
    final mutations = wmsState.filteredMutations;

    return Column(
      children: [
        // Filter
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              const Text('Filter:',
                  style: TextStyle(color: AppColors.textDim, fontSize: 12)),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: wmsState.mutationTypeFilter,
                items: const [
                  DropdownMenuItem(
                      value: 'All',
                      child: Text('Semua',
                          style: TextStyle(
                              color: AppColors.textPrimary, fontSize: 12))),
                  DropdownMenuItem(
                      value: 'in',
                      child: Text('Masuk',
                          style: TextStyle(
                              color: AppColors.textPrimary, fontSize: 12))),
                  DropdownMenuItem(
                      value: 'out',
                      child: Text('Keluar',
                          style: TextStyle(
                              color: AppColors.textPrimary, fontSize: 12))),
                  DropdownMenuItem(
                      value: 'opname',
                      child: Text('Opname',
                          style: TextStyle(
                              color: AppColors.textPrimary, fontSize: 12))),
                ],
                onChanged: (v) =>
                    ref.read(wmsProvider.notifier).setMutationFilter(v!),
                dropdownColor: AppColors.bgCard,
                underline: const SizedBox(),
                icon: const Icon(Icons.filter_list,
                    color: AppColors.neonGreen, size: 16),
                style:
                    const TextStyle(color: AppColors.neonGreen, fontSize: 12),
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
                  child: Text('Produk',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Tipe',
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
                  child: Text('Ref',
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
            ],
          ),
        ),
        // List
        Expanded(
          child: ListView.builder(
            itemCount: mutations.length,
            itemBuilder: (ctx, i) {
              final m = mutations[i];
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
                        child: Text(m.productName,
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 12))),
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: m.type == 'in'
                              ? AppColors.neonGreen.withOpacity(0.15)
                              : (m.type == 'out'
                                  ? AppColors.neonPink.withOpacity(0.15)
                                  : AppColors.neonYellow.withOpacity(0.15)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          m.type.toUpperCase(),
                          style: TextStyle(
                            color: m.type == 'in'
                                ? AppColors.neonGreen
                                : (m.type == 'out'
                                    ? AppColors.neonPink
                                    : AppColors.neonYellow),
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 1,
                      child: Text(
                        '${m.qty >= 0 ? "+" : ""}${m.qty}',
                        style: TextStyle(
                          color: m.qty >= 0
                              ? AppColors.neonGreen
                              : AppColors.neonPink,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Expanded(
                        flex: 2,
                        child: Text(m.reference ?? '-',
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                        flex: 2,
                        child: Text(_formatDate(m.date),
                            style: const TextStyle(
                                color: AppColors.textDim, fontSize: 10))),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _formatDate(String str) {
    if (str.isEmpty) return '-';
    try {
      final dt = DateTime.parse(str);
      return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute}';
    } catch (_) {
      return str.length > 16 ? str.substring(0, 16) : str;
    }
  }
}
