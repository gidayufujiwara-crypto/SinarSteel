import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/pos_provider.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({super.key});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  String _method = 'tunai';
  final _formKey = GlobalKey<FormState>();
  final _bayarCtrl = TextEditingController();
  final _penerimaCtrl = TextEditingController();
  final _alamatCtrl = TextEditingController();
  final _kotaCtrl = TextEditingController();
  final _teleponCtrl = TextEditingController();

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final delivery = _method == 'cod'
        ? {
            'nama_penerima': _penerimaCtrl.text,
            'alamat': _alamatCtrl.text,
            'kota': _kotaCtrl.text,
            'telepon': _teleponCtrl.text,
          }
        : null;

    await ref.read(posProvider.notifier).submitTransaction(
          _method,
          bayar: _method == 'tunai' ? double.tryParse(_bayarCtrl.text) : null,
          delivery: delivery,
        );

    if (!mounted) return;
    if (ref.read(posProvider).error == null) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(ref.read(posProvider).error!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pembayaran')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            const Text('Metode Pembayaran',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...['tunai', 'qris', 'transfer', 'cod'].map((method) {
              final labels = {
                'tunai': 'Tunai',
                'qris': 'QRIS',
                'transfer': 'Transfer',
                'cod': 'COD'
              };
              return ListTile(
                leading: Icon(
                  _method == method
                      ? Icons.radio_button_checked
                      : Icons.radio_button_unchecked,
                  color:
                      _method == method ? const Color(0xFF00F5FF) : Colors.grey,
                ),
                title: Text(labels[method]!),
                selected: _method == method,
                selectedTileColor:
                    const Color(0xFF00F5FF).withValues(alpha: 0.1),
                onTap: () => setState(() => _method = method),
              );
            }),
            if (_method == 'tunai')
              TextFormField(
                controller: _bayarCtrl,
                decoration: const InputDecoration(labelText: 'Jumlah Bayar'),
                keyboardType: TextInputType.number,
                validator: (v) =>
                    double.tryParse(v ?? '') == null ? 'Harus angka' : null,
              ),
            if (_method == 'cod') ...[
              TextFormField(
                  controller: _penerimaCtrl,
                  decoration:
                      const InputDecoration(labelText: 'Nama Penerima')),
              TextFormField(
                  controller: _alamatCtrl,
                  decoration:
                      const InputDecoration(labelText: 'Alamat Lengkap')),
              TextFormField(
                  controller: _kotaCtrl,
                  decoration: const InputDecoration(labelText: 'Kota')),
              TextFormField(
                  controller: _teleponCtrl,
                  decoration: const InputDecoration(labelText: 'Telepon')),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submit,
              child: const Text('Konfirmasi Pembayaran'),
            ),
          ],
        ),
      ),
    );
  }
}
