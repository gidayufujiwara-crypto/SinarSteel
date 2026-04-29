import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth_provider.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.read(apiClientProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Riwayat Absensi')),
      body: FutureBuilder<List<dynamic>>(
        future: api.dio.get('/hr/absensi/me').then((res) => res.data),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final list = snapshot.data ?? [];
          return ListView.builder(
            itemCount: list.length,
            itemBuilder: (context, index) {
              final item = list[index];
              return ListTile(
                title: Text(item['tanggal']),
                subtitle: Text('Masuk: ${item['jam_masuk'] ?? '-'}  Pulang: ${item['jam_pulang'] ?? '-'}'),
                trailing: Icon(
                  item['status_hadir'] == 'hadir' ? Icons.check_circle : Icons.cancel,
                  color: item['status_hadir'] == 'hadir' ? Colors.green : Colors.red,
                ),
              );
            },
          );
        },
      ),
    );
  }
}