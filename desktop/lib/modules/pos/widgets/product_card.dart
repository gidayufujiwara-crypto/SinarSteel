import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../models/product.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isLowStock = product.stock <= 10;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isLowStock
                ? AppColors.neonOrange.withOpacity(0.3)
                : AppColors.borderNeon,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Code & Stock
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  product.code,
                  style: const TextStyle(
                    color: AppColors.textDim,
                    fontSize: 9,
                  ),
                ),
                if (isLowStock)
                  Text(
                    'STOK: ${product.stock}',
                    style: const TextStyle(
                      color: AppColors.neonOrange,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            // Name
            Text(
              product.name,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                height: 1.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            // Price
            Text(
              'Rp ${_formatPrice(product.price)}',
              style: const TextStyle(
                color: AppColors.neonGreen,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
            Text(
              '/ ${product.unit}',
              style: const TextStyle(
                color: AppColors.textDim,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatPrice(double price) {
    return price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]}.',
    );
  }
}