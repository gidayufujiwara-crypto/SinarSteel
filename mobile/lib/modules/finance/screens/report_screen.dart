import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/finance_provider.dart';

class ReportScreen extends ConsumerStatefulWidget {
  const ReportScreen({super.key});

  @override
  ConsumerState<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends ConsumerState<ReportScreen> {
  int _bulan = DateTime.now().month;
  int _tahun = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        ref.read(financeProvider.notifier).fetchProfitLoss(_bulan, _tahun));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(financeProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              DropdownButton<int>(
                value: _bulan,
                items: List.generate(
                    12,
                    (i) => DropdownMenuItem(
                        value: i + 1, child: Text('${i + 1}'))),
                onChanged: (v) {
                  setState(() => _bulan = v!);
                  ref
                      .read(financeProvider.notifier)
                      .fetchProfitLoss(_bulan, _tahun);
                },
              ),
              const SizedBox(width: 16),
              DropdownButton<int>(
                value: _tahun,
                items: [2024, 2025, 2026]
                    .map((y) => DropdownMenuItem(value: y, child: Text('$y')))
                    .toList(),
                onChanged: (v) {
                  setState(() => _tahun = v!);
                  ref
                      .read(financeProvider.notifier)
                      .fetchProfitLoss(_bulan, _tahun);
                },
              ),
            ],
          ),
        ),
        if (state.loading)
          const Expanded(child: Center(child: CircularProgressIndicator()))
        else if (state.profitLoss.isEmpty)
          const Expanded(child: Center(child: Text('Belum ada data')))
        else
          Expanded(
            child: ListView.builder(
              itemCount: state.profitLoss.length,
              itemBuilder: (ctx, i) {
                final p = state.profitLoss[i];
                final laba = (p['laba_kotor'] as num?)?.toDouble() ?? 0;
                return ListTile(
                  title: Text(p['nama_produk'] ?? ''),
                  subtitle: Text('Pendapatan: Rp ${p['total_pendapatan']}'),
                  trailing: Text(
                    'Laba: Rp $laba',
                    style:
                        TextStyle(color: laba >= 0 ? Colors.green : Colors.red),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
