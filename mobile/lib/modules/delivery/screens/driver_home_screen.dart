import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth_provider.dart';
import 'delivery_detail_screen.dart';

class DriverHomeScreen extends ConsumerWidget {
  final String driverId;
  const DriverHomeScreen({super.key, required this.driverId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.read(apiClientProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pengiriman Hari Ini'),
        actions: [
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/');
            },
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: api.dio.get('/delivery/driver/today',
            queryParameters: {'driver_id': driverId}).then((res) => res.data),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final orders = snapshot.data ?? [];
          return ListView.builder(
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return ListTile(
                leading: Icon(
                  order['status'] == 'selesai'
                      ? Icons.check_circle
                      : Icons.local_shipping,
                  color: order['status'] == 'selesai'
                      ? Colors.green
                      : const Color(0xFF00F5FF),
                ),
                title: Text(order['nama_penerima']),
                subtitle: Text(
                    '${order['alamat_pengiriman']}\nStatus: ${order['status']}'),
                trailing: order['nominal_cod'] != null
                    ? Text('COD: Rp ${order['nominal_cod']}')
                    : null,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => DeliveryDetailScreen(
                          order: order, driverId: driverId),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
