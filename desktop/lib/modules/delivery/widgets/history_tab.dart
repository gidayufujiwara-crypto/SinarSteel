import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/delivery_provider.dart';

class HistoryTab extends ConsumerWidget {
  const HistoryTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deliveryState = ref.watch(deliveryProvider);
    final orders = deliveryState.filteredHistoryOrders;

    return Column(
      children: [
        // Search + Filter
        Container(
          padding: const EdgeInsets.all(12),
          color: AppColors.bgPanel,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: '🔍 Cari order...',
                    hintStyle: const TextStyle(color: AppColors.textDim, fontSize: 13),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppColors.borderNeon)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppColors.neonBlue)),
                  ),
                  onChanged: (q) => ref.read(deliveryProvider.notifier).setHistorySearch(q),
                ),
              ),
              const SizedBox(width: 12),
              DropdownButton<String>(
                value: deliveryState.historyStatusFilter,
                items: const [
                  DropdownMenuItem(value: 'All', child: Text('Semua', style: TextStyle(color: AppColors.textPrimary, fontSize: 12))),
                  DropdownMenuItem(value: 'selesai', child: Text('Selesai', style: TextStyle(color: AppColors.textPrimary, fontSize: 12))),
                  DropdownMenuItem(value: 'batal', child: Text('Batal', style: TextStyle(color: AppColors.textPrimary, fontSize: 12))),
                ],
                onChanged: (v) => ref.read(deliveryProvider.notifier).setHistoryStatusFilter(v!),
                dropdownColor: AppColors.bgCard,
                underline: const SizedBox(),
                icon: const Icon(Icons.filter_list, color: AppColors.neonBlue, size: 18),
                style: const TextStyle(color: AppColors.neonBlue, fontSize: 12),
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
              Expanded(flex: 2, child: Text('No Order', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 3, child: Text('Customer', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Driver', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Status', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Total', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
              Expanded(flex: 2, child: Text('Tanggal', style: TextStyle(color: AppColors.textDim, fontSize: 11, fontWeight: FontWeight.w600))),
            ],
          ),
        ),
        // List
        Expanded(
          child: ListView.builder(
            itemCount: orders.length,
            itemBuilder: (ctx, i) {
              final o = orders[i];
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.borderNeon.withOpacity(0.3)))),
                child: Row(
                  children: [
                    Expanded(flex: 2, child: Text(o.orderNumber, style: const TextStyle(color: AppColors.neonCyan, fontSize: 12))),
                    Expanded(flex: 3, child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(o.customerName, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12)),
                        Text(o.address, style: const TextStyle(color: AppColors.textDim, fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    )),
                    Expanded(flex: 2, child: Text(o.driverName ?? '-', style: const TextStyle(color: AppColors.textDim, fontSize: 11))),
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: (o.status == 'selesai' ? AppColors.neonGreen : AppColors.neonPink).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(o.statusLabel, style: TextStyle(
                          color: o.status == 'selesai' ? AppColors.neonGreen : AppColors.neonPink,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        )),
                      ),
                    ),
                    Expanded(flex: 2, child: Text('Rp ${_formatPrice(o.totalAmount)}', style: const TextStyle(color: AppColors.neonGreen, fontSize: 11))),
                    Expanded(flex: 2, child: Text(_formatDate(o.updatedAt ?? o.createdAt), style: const TextStyle(color: AppColors.textDim, fontSize: 10))),
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
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }

  String _formatDate(String str) {
    if (str.isEmpty) return '-';
    try {
      final dt = DateTime.parse(str);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return str.length > 10 ? str.substring(0, 10) : str;
    }
  }
}