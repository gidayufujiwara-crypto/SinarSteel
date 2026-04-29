import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth_provider.dart';

class DriverHistoryScreen extends ConsumerWidget {
  final String driverId;
  const DriverHistoryScreen({super.key, required this.driverId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.read(apiClientProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Riwayat Pengiriman')),
      body: FutureBuilder<List<dynamic>>(
        future: api.dio.get('/delivery/driver/history',
            queryParameters: {'driver_id': driverId}).then((res) => res.data),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error: ${snapshot.error}',
              ),
            );
          }
          final orders = snapshot.data ?? [];
          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return ListTile(
                title: Text(order['no_order']),
                subtitle: Text('${order['nama_penerima']} - ${order['kota']}'),
                trailing: const Text('Selesai'),
              );
            },
          );
        },
      ),
    );
  }
}
