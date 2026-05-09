import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/settings_provider.dart';

class BankQrisTab extends ConsumerStatefulWidget {
  const BankQrisTab({super.key});

  @override
  ConsumerState<BankQrisTab> createState() => _BankQrisTabState();
}

class _BankQrisTabState extends ConsumerState<BankQrisTab> {
  final _formKey = GlobalKey<FormState>();
  final _bankNameCtrl = TextEditingController();
  final _accountNumberCtrl = TextEditingController();
  final _accountHolderCtrl = TextEditingController();
  final _qrisUrlCtrl = TextEditingController();
  String? _editingId;

  @override
  void dispose() {
    _bankNameCtrl.dispose();
    _accountNumberCtrl.dispose();
    _accountHolderCtrl.dispose();
    _qrisUrlCtrl.dispose();
    super.dispose();
  }

  void _clear() {
    _bankNameCtrl.clear();
    _accountNumberCtrl.clear();
    _accountHolderCtrl.clear();
    _qrisUrlCtrl.clear();
    setState(() => _editingId = null);
  }

  void _fillEdit(id, bankName, accountNumber, accountHolder, qrisUrl) {
    setState(() => _editingId = id);
    _bankNameCtrl.text = bankName;
    _accountNumberCtrl.text = accountNumber;
    _accountHolderCtrl.text = accountHolder;
    _qrisUrlCtrl.text = qrisUrl ?? '';
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    String? error;
    if (_editingId != null) {
      error = await ref.read(settingsProvider.notifier).updateBank(
            _editingId!,
            _bankNameCtrl.text.trim(),
            _accountNumberCtrl.text.trim(),
            _accountHolderCtrl.text.trim(),
            qrisUrl: _qrisUrlCtrl.text.trim().isEmpty
                ? null
                : _qrisUrlCtrl.text.trim(),
          );
    } else {
      error = await ref.read(settingsProvider.notifier).addBank(
            _bankNameCtrl.text.trim(),
            _accountNumberCtrl.text.trim(),
            _accountHolderCtrl.text.trim(),
            qrisUrl: _qrisUrlCtrl.text.trim().isEmpty
                ? null
                : _qrisUrlCtrl.text.trim(),
          );
    }
    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(error), backgroundColor: AppColors.neonOrange));
      return;
    }
    _clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Rekening disimpan'),
          backgroundColor: AppColors.neonGreen));
    }
  }

  @override
  Widget build(BuildContext context) {
    final banks = ref.watch(settingsProvider).banks;

    return Row(
      children: [
        // List Bank (kiri)
        Expanded(
          flex: 5,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                color: AppColors.bgCard,
                child: const Text('DAFTAR REKENING',
                    style: TextStyle(
                        color: AppColors.neonYellow,
                        fontSize: 12,
                        fontWeight: FontWeight.w700)),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: banks.length,
                  itemBuilder: (ctx, i) {
                    final b = banks[i];
                    return ListTile(
                      title: Text('${b.bankName} - ${b.accountNumber}',
                          style: const TextStyle(
                              color: AppColors.textPrimary, fontSize: 13)),
                      subtitle: Text(b.accountHolder,
                          style: const TextStyle(
                              color: AppColors.textDim, fontSize: 11)),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit, size: 16),
                            color: AppColors.neonCyan,
                            onPressed: () => _fillEdit(
                                b.id,
                                b.bankName,
                                b.accountNumber,
                                b.accountHolder,
                                b.qrisUrl ?? ''),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 16),
                            color: AppColors.neonPink,
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (ctx) => AlertDialog(
                                  backgroundColor: AppColors.bgCard,
                                  title: const Text('Hapus Rekening?',
                                      style:
                                          TextStyle(color: AppColors.neonPink)),
                                  actions: [
                                    TextButton(
                                        onPressed: () => Navigator.pop(ctx),
                                        child: const Text('Batal')),
                                    ElevatedButton(
                                      onPressed: () {
                                        Navigator.pop(ctx);
                                        ref
                                            .read(settingsProvider.notifier)
                                            .deleteBank(b.id);
                                      },
                                      style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.neonPink),
                                      child: const Text('Hapus'),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        // Form (kanan)
        Expanded(
          flex: 3,
          child: Container(
            color: AppColors.bgPanel,
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    _editingId != null ? 'EDIT REKENING' : 'TAMBAH REKENING',
                    style: const TextStyle(
                        color: AppColors.neonYellow,
                        fontSize: 14,
                        fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 16),
                  _buildField('Nama Bank', _bankNameCtrl),
                  const SizedBox(height: 10),
                  _buildField('Nomor Rekening', _accountNumberCtrl),
                  const SizedBox(height: 10),
                  _buildField('Atas Nama', _accountHolderCtrl),
                  const SizedBox(height: 10),
                  _buildField('URL QRIS (opsional)', _qrisUrlCtrl,
                      required: false),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.neonYellow,
                        foregroundColor: AppColors.bgDark),
                    child: Text(_editingId != null ? 'UPDATE' : 'SIMPAN'),
                  ),
                  if (_editingId != null) ...[
                    const SizedBox(height: 8),
                    TextButton(
                        onPressed: _clear,
                        child: const Text('Batal',
                            style: TextStyle(color: AppColors.neonOrange))),
                  ],
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  TextFormField _buildField(String label, TextEditingController ctrl,
      {bool required = true}) {
    return TextFormField(
      controller: ctrl,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
      decoration: _inputDecoration(label),
      validator: required
          ? (v) => v == null || v.trim().isEmpty ? 'Wajib diisi' : null
          : null,
    );
  }

  InputDecoration _inputDecoration(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: AppColors.textDim, fontSize: 11),
        filled: true,
        fillColor: AppColors.bgDark,
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.neonYellow)),
      );
}
