import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/delivery_provider.dart';
import '../models/delivery.dart';

class ActiveOrdersTab extends ConsumerStatefulWidget {
  const ActiveOrdersTab({super.key});

  @override
  ConsumerState<ActiveOrdersTab> createState() => _ActiveOrdersTabState();
}

class _ActiveOrdersTabState extends ConsumerState<ActiveOrdersTab> {
  final _driverIdCtrl = TextEditingController();

  @override
  void dispose() {
    _driverIdCtrl.dispose();
    super.dispose();
  }

  void _showAssignDialog(DeliveryOrder order) {
    _driverIdCtrl.clear();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.borderNeon),
        ),
        title: const Text('Assign Driver',
            style: TextStyle(color: AppColors.neonBlue)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Order: ${order.orderNumber}',
                style: const TextStyle(color: AppColors.textDim, fontSize: 12)),
            const SizedBox(height: 16),
            TextField(
              controller: _driverIdCtrl,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Driver ID',
                labelStyle:
                    const TextStyle(color: AppColors.textDim, fontSize: 11),
                filled: true,
                fillColor: AppColors.bgDark,
                isDense: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: const BorderSide(color: AppColors.borderNeon)),
                focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: const BorderSide(color: AppColors.neonBlue)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child:
                const Text('Batal', style: TextStyle(color: AppColors.textDim)),
          ),
          ElevatedButton(
            onPressed: () async {
              final driverId = _driverIdCtrl.text.trim();
              if (driverId.isEmpty) return;
              Navigator.pop(ctx);
              final error = await ref
                  .read(deliveryProvider.notifier)
                  .assignDriver(order.id, driverId);
              if (error != null && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                      content: Text(error),
                      backgroundColor: AppColors.neonOrange),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.neonBlue,
              foregroundColor: AppColors.bgDark,
            ),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  void _showStatusDialog(DeliveryOrder order) {
    final statuses = ['dikirim', 'selesai', 'batal'];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.borderNeon),
        ),
        title: Text('Update Status #${order.orderNumber}',
            style: const TextStyle(color: AppColors.neonBlue, fontSize: 14)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: statuses
              .map((s) => ListTile(
                    title: Text(
                      s == 'dikirim'
                          ? 'Dikirim'
                          : s == 'selesai'
                              ? 'Selesai'
                              : 'Batal',
                      style: TextStyle(
                        color: s == 'selesai'
                            ? AppColors.neonGreen
                            : s == 'batal'
                                ? AppColors.neonOrange
                                : AppColors.neonBlue,
                      ),
                    ),
                    leading: Icon(
                      s == 'selesai'
                          ? Icons.check_circle
                          : s == 'batal'
                              ? Icons.cancel
                              : Icons.local_shipping,
                      color: s == 'selesai'
                          ? AppColors.neonGreen
                          : s == 'batal'
                              ? AppColors.neonOrange
                              : AppColors.neonBlue,
                    ),
                    onTap: () async {
                      Navigator.pop(ctx);
                      final error = await ref
                          .read(deliveryProvider.notifier)
                          .updateStatus(order.id, s);
                      if (error != null && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                              content: Text(error),
                              backgroundColor: AppColors.neonOrange),
                        );
                      }
                    },
                  ))
              .toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final deliveryState = ref.watch(deliveryProvider);
    final orders = deliveryState.filteredActiveOrders;

    return Column(
      children: [
        // Search
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
            decoration: InputDecoration(
              hintText: '🔍 Cari order...',
              hintStyle:
                  const TextStyle(color: AppColors.textDim, fontSize: 13),
              isDense: true,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              fillColor: AppColors.bgDark,
              filled: true,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: AppColors.borderNeon)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(6),
                  borderSide: const BorderSide(color: AppColors.neonBlue)),
            ),
            onChanged: (q) =>
                ref.read(deliveryProvider.notifier).setActiveSearch(q),
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
                  child: Text('No Order',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 3,
                  child: Text('Customer',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              Expanded(
                  flex: 2,
                  child: Text('Driver',
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
                  child: Text('Total',
                      style: TextStyle(
                          color: AppColors.textDim,
                          fontSize: 11,
                          fontWeight: FontWeight.w600))),
              SizedBox(width: 80),
            ],
          ),
        ),
        // List
        Expanded(
          child: deliveryState.isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.neonBlue))
              : ListView.builder(
                  itemCount: orders.length,
                  itemBuilder: (ctx, i) {
                    final o = orders[i];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                          border: Border(
                              bottom: BorderSide(
                                  color:
                                      AppColors.borderNeon.withOpacity(0.3)))),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 2,
                              child: Text(o.orderNumber,
                                  style: const TextStyle(
                                      color: AppColors.neonCyan,
                                      fontSize: 12))),
                          Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(o.customerName,
                                      style: const TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 12)),
                                  Text(o.address,
                                      style: const TextStyle(
                                          color: AppColors.textDim,
                                          fontSize: 10),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                ],
                              )),
                          Expanded(
                              flex: 2,
                              child: Text(o.driverName ?? '-',
                                  style: TextStyle(
                                      color: o.driverName != null
                                          ? AppColors.textPrimary
                                          : AppColors.textDim,
                                      fontSize: 11))),
                          Expanded(
                            flex: 2,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: (o.status == 'pending'
                                        ? AppColors.neonOrange
                                        : o.status == 'dikirim'
                                            ? AppColors.neonBlue
                                            : AppColors.neonGreen)
                                    .withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(o.statusLabel,
                                  style: TextStyle(
                                    color: o.status == 'pending'
                                        ? AppColors.neonOrange
                                        : o.status == 'dikirim'
                                            ? AppColors.neonBlue
                                            : AppColors.neonGreen,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  )),
                            ),
                          ),
                          Expanded(
                              flex: 2,
                              child: Text('Rp ${_formatPrice(o.totalAmount)}',
                                  style: const TextStyle(
                                      color: AppColors.neonGreen,
                                      fontSize: 11))),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.person_add, size: 16),
                                color: AppColors.neonCyan,
                                tooltip: 'Assign Driver',
                                onPressed: () => _showAssignDialog(o),
                              ),
                              IconButton(
                                icon: const Icon(Icons.edit_note, size: 16),
                                color: AppColors.neonYellow,
                                tooltip: 'Update Status',
                                onPressed: () => _showStatusDialog(o),
                              ),
                            ],
                          ),
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
