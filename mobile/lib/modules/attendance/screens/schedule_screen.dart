import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth_provider.dart';

class ScheduleScreen extends ConsumerWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final api = ref.read(apiClientProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Jadwal Shift')),
      body: FutureBuilder<List<dynamic>>(
        future: api.dio.get('/hr/jadwal/mobile').then((res) => res.data),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final jadwal = snapshot.data ?? [];
          return ListView.builder(
            itemCount: jadwal.length,
            itemBuilder: (context, index) {
              final j = jadwal[index];
              return ListTile(
                title: Text(j['tanggal']),
                subtitle: Text(
                    '${j['shift_ke']} (${j['jam_mulai']} - ${j['jam_selesai']})'),
              );
            },
          );
        },
      ),
    );
  }
}
