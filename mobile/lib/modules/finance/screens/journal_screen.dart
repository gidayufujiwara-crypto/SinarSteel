import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/finance_provider.dart';

class JournalScreen extends ConsumerStatefulWidget {
  const JournalScreen({super.key});

  @override
  ConsumerState<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends ConsumerState<JournalScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(financeProvider.notifier).fetchJournals());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(financeProvider);

    if (state.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (state.error != null) {
      return Center(child: Text(state.error!));
    }
    if (state.journals.isEmpty) {
      return const Center(child: Text('Belum ada jurnal'));
    }

    return ListView.builder(
      itemCount: state.journals.length,
      itemBuilder: (ctx, i) {
        final j = state.journals[i];
        return Card(
          child: ListTile(
            title: Text(j['no_jurnal'] ?? ''),
            subtitle: Text('${j['tanggal']} - ${j['tipe']}'),
            trailing: Text(j['keterangan'] ?? ''),
            onTap: () {
              // Bisa tambahkan detail jurnal
            },
          ),
        );
      },
    );
  }
}
