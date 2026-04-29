import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/auth_provider.dart';
import 'cod_confirmation_screen.dart';

class DeliveryDetailScreen extends ConsumerStatefulWidget {
  final dynamic order;
  final String driverId;
  const DeliveryDetailScreen(
      {super.key, required this.order, required this.driverId});

  @override
  ConsumerState<DeliveryDetailScreen> createState() =>
      _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends ConsumerState<DeliveryDetailScreen> {
  bool _loading = false;

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _loading = true);
    final api = ref.read(apiClientProvider);
    try {
      await api.dio.put('/delivery/orders/${widget.order['id']}/status', data: {
        'status': newStatus,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Status berhasil diperbarui')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openGoogleMaps() async {
    final alamat = widget.order['alamat_pengiriman'];
    final url =
        'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(alamat)}';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tidak dapat membuka Google Maps')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final status = order['status'];
    final nextStatus = {
      'disiapkan': 'diambil_driver',
      'diambil_driver': 'dalam_perjalanan',
      'dalam_perjalanan': 'sampai',
      'sampai': 'selesai',
    }[status];

    return Scaffold(
      appBar: AppBar(
        title: Text(order['no_order']),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Penerima: ${order['nama_penerima']}',
                style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 8),
            Text('Alamat: ${order['alamat_pengiriman']}'),
            const SizedBox(height: 8),
            Text('Kota: ${order['kota']}'),
            if (order['telepon'] != null) Text('Telepon: ${order['telepon']}'),
            if (order['nominal_cod'] != null)
              Text('COD: Rp ${order['nominal_cod']}'),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                ElevatedButton.icon(
                  onPressed: _openGoogleMaps,
                  icon: const Icon(Icons.map),
                  label: const Text('Navigasi'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF9D4EDD)),
                ),
                if (nextStatus != null && !_loading)
                  ElevatedButton.icon(
                    onPressed: () => _updateStatus(nextStatus),
                    icon: const Icon(Icons.arrow_forward),
                    label: Text(nextStatus.replaceAll('_', ' ')),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00FF88)),
                  ),
                if (_loading) const CircularProgressIndicator(),
              ],
            ),
            // Tombol konfirmasi COD jika status 'sampai' dan ada nominal_cod
            if (order['status'] == 'sampai' &&
                order['nominal_cod'] != null) ...[
              const SizedBox(height: 16),
              Center(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => CODConfirmationScreen(order: order),
                      ),
                    ).then((_) {
                      // Optional: refresh setelah kembali
                    });
                  },
                  icon: const Icon(Icons.monetization_on),
                  label: const Text('Konfirmasi COD'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF88)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
