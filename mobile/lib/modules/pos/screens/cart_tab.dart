import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/pos_provider.dart';
import 'payment_screen.dart';

class CartTab extends ConsumerWidget {
  const CartTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final posState = ref.watch(posProvider);
    final total =
        ref.read(posProvider.notifier).grandTotal; // ambil dari notifier

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            itemCount: posState.cart.length,
            itemBuilder: (ctx, i) {
              final item = posState.cart[i];
              return ListTile(
                title: Text(item.nama),
                subtitle: Text('Rp ${item.hargaJual.toStringAsFixed(0)}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: () => ref
                            .read(posProvider.notifier)
                            .updateQty(item.produkId, item.qty - 1)),
                    Text('${item.qty}'),
                    IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () => ref
                            .read(posProvider.notifier)
                            .updateQty(item.produkId, item.qty + 1)),
                  ],
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total: Rp ${total.toStringAsFixed(0)}',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF00F5FF))),
              ElevatedButton(
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const PaymentScreen())),
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00FF88)),
                child:
                    const Text('Bayar', style: TextStyle(color: Colors.black)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
