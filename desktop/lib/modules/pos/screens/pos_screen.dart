import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
            if (!mounted) return;
            if (error != null) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(error),
                    backgroundColor: AppColors.neonOrange),
              );
            } else {
              ref.read(posProvider.notifier).clearCart();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Transaksi berhasil!'),
                    backgroundColor: AppColors.neonGreen),
              );
            }
          }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final posState = ref.watch(posProvider);
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                color: AppColors.bgPanel,
                child: TextField(
                  controller: _searchController,
                  style: GoogleFonts.rajdhani(
                      color: AppColors.textPrimary, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: '🔍 Cari produk...',
                    hintStyle: GoogleFonts.rajdhani(
                        color: AppColors.textDim, fontSize: 14),
                    prefixIcon: const Icon(Icons.search,
                        color: AppColors.neonCyan, size: 18),
                    filled: true,
                    fillColor: AppColors.bgDark,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide:
                            const BorderSide(color: AppColors.neonCyan)),
                  ),
                  onChanged: (q) => ref.read(posProvider.notifier).setSearch(q),
                ),
              ),
              Expanded(
                child: posState.filteredProducts.isEmpty
                    ? Center(
                        child: Text('Produk tidak ditemukan',
                            style: GoogleFonts.rajdhani(
                                color: AppColors.textDim, fontSize: 16)))
                    : GridView.builder(
                        padding: const EdgeInsets.all(12),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 4,
                                childAspectRatio: 0.85,
                                crossAxisSpacing: 10,
                                mainAxisSpacing: 10),
                        itemCount: posState.filteredProducts.length,
                        itemBuilder: (ctx, i) => ProductCard(
                            product: posState.filteredProducts[i],
                            onTap: () => ref
                                .read(posProvider.notifier)
                                .addToCart(posState.filteredProducts[i])),
                      ),
              ),
            ],
          ),
        ),
        Expanded(
          flex: 2,
          child: Container(
            color: AppColors.bgPanel.withOpacity(0.5),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  color: AppColors.bgPanel,
                  child: Row(
                    children: [
                      const Icon(Icons.shopping_cart,
                          color: AppColors.neonCyan, size: 18),
                      const SizedBox(width: 8),
                      Text('KERANJANG',
                          style: GoogleFonts.orbitron(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.neonCyan,
                              letterSpacing: 1)),
                      const Spacer(),
                      Text('${posState.totalItems} item',
                          style: GoogleFonts.rajdhani(
                              color: AppColors.textDim, fontSize: 12)),
                    ],
                  ),
                ),
                Expanded(
                  child: posState.cart.isEmpty
                      ? Center(
                          child: Text('Keranjang kosong',
                              style: GoogleFonts.rajdhani(
                                  color: AppColors.textDim)))
                      : ListView.builder(
                          itemCount: posState.cart.length,
                          itemBuilder: (ctx, i) => CartItemWidget(
                            item: posState.cart[i],
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
                          ),
                        ),
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  color: AppColors.bgPanel,
                  child: Column(
                    children: [
                      Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subtotal',
                                style: GoogleFonts.rajdhani(
                                    color: AppColors.textDim, fontSize: 13)),
                            Text('Rp ${_fmt(posState.subtotalAll)}',
                                style: GoogleFonts.robotoMono(
                                    color: AppColors.textPrimary,
                                    fontSize: 13)),
                          ]),
                      const SizedBox(height: 4),
                      Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Diskon',
                                style: GoogleFonts.rajdhani(
                                    color: AppColors.textDim, fontSize: 13)),
                            Text('-Rp ${_fmt(posState.totalDiscount)}',
                                style: GoogleFonts.robotoMono(
                                    color: AppColors.neonOrange, fontSize: 13)),
                          ]),
                      const Divider(color: AppColors.borderNeon, height: 16),
                      Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('TOTAL',
                                style: GoogleFonts.orbitron(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.neonCyan,
                                    letterSpacing: 1)),
                            Text('Rp ${_fmt(posState.grandTotal)}',
                                style: GoogleFonts.orbitron(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.neonGreen)),
                          ]),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _showPaymentModal,
                          icon: const Icon(Icons.payment, size: 18),
                          label: Text('BAYAR',
                              style: GoogleFonts.orbitron(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 2)),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.neonGreen,
                              foregroundColor: AppColors.bgDark,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8))),
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

  String _fmt(double v) => v
      .toStringAsFixed(0)
      .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
}

class _PaymentDialog extends StatelessWidget {
  final double total;
  final void Function(String) onPay;
  const _PaymentDialog({required this.total, required this.onPay});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.borderNeon)),
      title: Text('PILIH PEMBAYARAN',
          style: GoogleFonts.orbitron(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.neonCyan,
              letterSpacing: 1)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(
            'Total: Rp ${total.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
            style:
                GoogleFonts.orbitron(fontSize: 18, color: AppColors.neonGreen)),
        const SizedBox(height: 16),
        _PayBtn(
            icon: Icons.money,
            label: 'CASH',
            color: AppColors.neonGreen,
            onTap: () => onPay('CASH')),
        const SizedBox(height: 8),
        _PayBtn(
            icon: Icons.account_balance,
            label: 'TRANSFER',
            color: AppColors.neonBlue,
            onTap: () => onPay('TRANSFER')),
        const SizedBox(height: 8),
        _PayBtn(
            icon: Icons.qr_code,
            label: 'QRIS',
            color: AppColors.neonOrange,
            onTap: () => onPay('QRIS')),
        const SizedBox(height: 8),
        _PayBtn(
            icon: Icons.receipt_long,
            label: 'CICILAN',
            color: AppColors.neonYellow,
            onTap: () => onPay('CICILAN')),
      ]),
    );
  }
}

class _PayBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _PayBtn(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, color: color, size: 20),
        label: Text(label,
            style: GoogleFonts.rajdhani(
                fontSize: 13, fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
            backgroundColor: color.withOpacity(0.1),
            foregroundColor: color,
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: color.withOpacity(0.4)))),
      ),
    );
  }
}
