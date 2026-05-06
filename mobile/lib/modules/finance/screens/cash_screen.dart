import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/finance_provider.dart';

class CashScreen extends ConsumerStatefulWidget {
  const CashScreen({super.key});

  @override
  ConsumerState<CashScreen> createState() => _CashScreenState();
}

class _CashScreenState extends ConsumerState<CashScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(financeProvider.notifier).fetchCash());
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
    if (state.cashList.isEmpty) {
      return const Center(child: Text('Belum ada transaksi kas'));
    }
    return ListView.builder(
      itemCount: state.cashList.length,
      itemBuilder: (ctx, i) {
        final c = state.cashList[i];
        final isMasuk = c['tipe'] == 'pemasukan';
        return ListTile(
          leading: Icon(
            isMasuk ? Icons.arrow_downward : Icons.arrow_upward,
            color: isMasuk ? Colors.green : Colors.red,
          ),
          title: Text('Rp ${c['jumlah']}'),
          subtitle: Text('${c['kategori']} - ${c['keterangan'] ?? ''}'),
          trailing: Text(c['tanggal'] ?? ''),
        );
      },
    );
  }
}
