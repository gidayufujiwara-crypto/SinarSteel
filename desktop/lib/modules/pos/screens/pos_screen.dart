import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/pos_provider.dart';
import '../widgets/product_card.dart';
import '../widgets/cart_item.dart';

class PosScreen extends ConsumerStatefulWidget {
  const PosScreen({super.key});

  @override
  ConsumerState<PosScreen> createState() => _PosScreenState();
}

class _PosScreenState extends ConsumerState<PosScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showPaymentModal() {
    final posState = ref.read(posProvider);
    if (posState.cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Keranjang masih kosong')),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) => _PaymentDialog(
        total: posState.grandTotal,
        onPay: (method) async {
          Navigator.pop(ctx);
          final error =
              await ref.read(posProvider.notifier).submitTransaction(method);
          if (error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                  content: Text(error), backgroundColor: AppColors.neonOrange),
            );
          } else {
            ref.read(posProvider.notifier).clearCart();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Transaksi berhasil!'),
                backgroundColor: AppColors.neonGreen,
              ),
            );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final posState = ref.watch(posProvider);

    return Row(
      children: [
        // LEFT: Produk
        Expanded(
          flex: 3,
          child: Column(
            children: [
              // Search
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: AppColors.bgPanel,
                  border: Border(
                    bottom: BorderSide(color: AppColors.borderNeon),
                  ),
                ),
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: '🔍 Cari produk... (nama atau kode)',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 14),
                    prefixIcon:
                        const Icon(Icons.search, color: AppColors.neonCyan),
                    filled: true,
                    fillColor: AppColors.bgDark,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.borderNeon),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.borderNeon),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: AppColors.neonCyan),
                    ),
                  ),
                  onChanged: (val) =>
                      ref.read(posProvider.notifier).setSearch(val),
                ),
              ),

              // Product Grid
              Expanded(
                child: posState.filteredProducts.isEmpty
                    ? const Center(
                        child: Text(
                          'Produk tidak ditemukan',
                          style:
                              TextStyle(color: AppColors.textDim, fontSize: 16),
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 4,
                          childAspectRatio: 0.85,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: posState.filteredProducts.length,
                        itemBuilder: (ctx, i) {
                          final product = posState.filteredProducts[i];
                          return ProductCard(
                            product: product,
                            onTap: () => ref
                                .read(posProvider.notifier)
                                .addToCart(product),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),

        // RIGHT: Cart
        Expanded(
          flex: 2,
          child: Container(
            color: AppColors.bgPanel.withOpacity(0.5),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: AppColors.bgPanel,
                    border: Border(
                      bottom: BorderSide(color: AppColors.borderNeon),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shopping_cart,
                          color: AppColors.neonCyan),
                      const SizedBox(width: 8),
                      const Text(
                        'KERANJANG',
                        style: TextStyle(
                          color: AppColors.neonCyan,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '${posState.totalItems} item(s)',
                        style: const TextStyle(
                          color: AppColors.textDim,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

                // Cart Items
                Expanded(
                  child: posState.cart.isEmpty
                      ? const Center(
                          child: Text(
                            'Keranjang kosong\nKlik produk untuk menambahkan',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.textDim,
                              fontSize: 14,
                            ),
                          ),
                        )
                      : ListView.builder(
                          itemCount: posState.cart.length,
                          itemBuilder: (ctx, i) {
                            final item = posState.cart[i];
                            return CartItemWidget(
                              item: item,
                              index: i,
                              onIncrease: () => ref
                                  .read(posProvider.notifier)
                                  .updateQuantity(i, 1),
                              onDecrease: () => ref
                                  .read(posProvider.notifier)
                                  .updateQuantity(i, -1),
                              onRemove: () => ref
                                  .read(posProvider.notifier)
                                  .removeFromCart(i),
                            );
                          },
                        ),
                ),

                // Footer: Total + Pay Button
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: AppColors.bgPanel,
                    border: Border(
                      top: BorderSide(color: AppColors.borderNeon),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Subtotal
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal',
                              style: TextStyle(
                                  color: AppColors.textDim, fontSize: 13)),
                          Text(
                            'Rp ${_formatPrice(posState.subtotalAll)}',
                            style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 14),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Diskon
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Diskon',
                              style: TextStyle(
                                  color: AppColors.textDim, fontSize: 13)),
                          Text(
                            'Rp ${_formatPrice(posState.totalDiscount)}',
                            style: const TextStyle(
                                color: AppColors.neonOrange, fontSize: 14),
                          ),
                        ],
                      ),
                      const Divider(color: AppColors.borderNeon, height: 20),
                      // Grand Total
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'TOTAL',
                            style: TextStyle(
                              color: AppColors.neonCyan,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                          Text(
                            'Rp ${_formatPrice(posState.grandTotal)}',
                            style: const TextStyle(
                              color: AppColors.neonGreen,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Pay Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _showPaymentModal,
                          icon: const Icon(Icons.payment, size: 20),
                          label: const Text(
                            'BAYAR',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.neonGreen,
                            foregroundColor: AppColors.bgDark,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
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
}

// Payment Modal
class _PaymentDialog extends StatelessWidget {
  final double total;
  final void Function(String method) onPay;

  const _PaymentDialog({required this.total, required this.onPay});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: AppColors.borderNeon),
      ),
      title: const Text(
        'PILIH PEMBAYARAN',
        style: TextStyle(
          color: AppColors.neonCyan,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: 1,
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Total: Rp ${total.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
            style: const TextStyle(
              color: AppColors.neonGreen,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 20),
          _PaymentButton(
              icon: Icons.money,
              label: 'CASH / TUNAI',
              color: AppColors.neonGreen,
              onTap: () => onPay('CASH')),
          const SizedBox(height: 8),
          _PaymentButton(
              icon: Icons.account_balance,
              label: 'TRANSFER BANK',
              color: AppColors.neonBlue,
              onTap: () => onPay('TRANSFER')),
          const SizedBox(height: 8),
          _PaymentButton(
              icon: Icons.qr_code,
              label: 'QRIS',
              color: AppColors.neonOrange,
              onTap: () => onPay('QRIS')),
          const SizedBox(height: 8),
          _PaymentButton(
              icon: Icons.receipt_long,
              label: 'CICILAN / TEMPO',
              color: AppColors.neonYellow,
              onTap: () => onPay('CICILAN')),
        ],
      ),
    );
  }
}

class _PaymentButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _PaymentButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, color: color, size: 22),
        label: Text(
          label,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color.withOpacity(0.1),
          foregroundColor: color,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: color.withOpacity(0.4)),
          ),
        ),
      ),
    );
  }
}
