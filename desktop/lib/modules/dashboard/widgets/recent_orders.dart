import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class RecentOrders extends StatelessWidget {
  final List<Map<String, dynamic>> orders;
  final List<Map<String, dynamic>> topProducts;

  const RecentOrders({
    super.key,
    required this.orders,
    required this.topProducts,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top 5 Produk
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderNeon),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('TOP 5 PRODUK',
                    style: TextStyle(
                        color: AppColors.neonGreen,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1)),
                const SizedBox(height: 12),
                ...topProducts.take(5).map((p) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                              child: Text(p['name'] ?? '',
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12),
                                  overflow: TextOverflow.ellipsis)),
                          Text('${p['sold'] ?? 0}x',
                              style: const TextStyle(
                                  color: AppColors.neonGreen,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600)),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        // Order Terbaru
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderNeon),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ORDER TERBARU',
                    style: TextStyle(
                        color: AppColors.neonOrange,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1)),
                const SizedBox(height: 12),
                ...orders.take(5).map((o) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(o['order_number'] ?? '',
                                    style: const TextStyle(
                                        color: AppColors.neonCyan,
                                        fontSize: 11)),
                                Text(o['customer'] ?? '',
                                    style: const TextStyle(
                                        color: AppColors.textDim,
                                        fontSize: 10)),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                  'Rp ${_formatPrice((o['total'] ?? 0).toDouble())}',
                                  style: const TextStyle(
                                      color: AppColors.neonGreen,
                                      fontSize: 11)),
                              Text(o['time'] ?? '',
                                  style: const TextStyle(
                                      color: AppColors.textDim, fontSize: 9)),
                            ],
                          ),
                        ],
                      ),
                    )),
              ],
            ),
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
