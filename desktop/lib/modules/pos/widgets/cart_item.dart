import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/pos_provider.dart';

class CartItemWidget extends StatelessWidget {
  final CartItem item;
  final int index;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;
  final VoidCallback onRemove;

  const CartItemWidget({
    super.key,
    required this.item,
    required this.index,
    required this.onIncrease,
    required this.onDecrease,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppColors.borderNeon),
        ),
      ),
      child: Row(
        children: [
          // Info Produk
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'Rp ${_formatPrice(item.product.price)} / ${item.product.unit}',
                  style: const TextStyle(
                    color: AppColors.textDim,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Quantity Control
          Row(
            children: [
              // Minus
              _QtyButton(
                icon: Icons.remove,
                onPressed: onDecrease,
                color: AppColors.neonPink,
              ),
              const SizedBox(width: 4),
              // Qty
              Container(
                width: 36,
                padding: const EdgeInsets.symmetric(vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.bgDark,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppColors.borderNeon),
                ),
                child: Text(
                  '${item.quantity}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.neonCyan,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              // Plus
              _QtyButton(
                icon: Icons.add,
                onPressed: onIncrease,
                color: AppColors.neonGreen,
              ),
            ],
          ),

          const SizedBox(width: 10),

          // Subtotal
          SizedBox(
            width: 100,
            child: Text(
              'Rp ${_formatPrice(item.subtotal)}',
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.neonGreen,
                fontSize: 14,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),

          const SizedBox(width: 4),

          // Delete
          IconButton(
            icon: const Icon(Icons.delete_outline, size: 18),
            color: AppColors.textDim,
            onPressed: onRemove,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
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

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color color;

  const _QtyButton({
    required this.icon,
    required this.onPressed,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Icon(icon, size: 16, color: color),
      ),
    );
  }
}
