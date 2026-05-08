import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/master_provider.dart';
import '../models/master_models.dart';

class CustomerTab extends ConsumerStatefulWidget {
  const CustomerTab({super.key});

  @override
  ConsumerState<CustomerTab> createState() => _CustomerTabState();
}

class _CustomerTabState extends ConsumerState<CustomerTab> {
  final _formKey = GlobalKey<FormState>();
  final _codeCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String _type = 'retail';
  final _contactCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  int? _editingIndex;

  @override
  void dispose() {
    _codeCtrl.dispose();
    _nameCtrl.dispose();
    _contactCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  void _clear() {
    _codeCtrl.clear();
    _nameCtrl.clear();
    _contactCtrl.clear();
    _addressCtrl.clear();
    setState(() {
      _type = 'retail';
      _editingIndex = null;
    });
  }

  void _fill(Customer c, int i) {
    _codeCtrl.text = c.code;
    _nameCtrl.text = c.name;
    _contactCtrl.text = c.contact ?? '';
    _addressCtrl.text = c.address ?? '';
    setState(() {
      _type = c.type;
      _editingIndex = i;
    });
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final c = Customer(
      id: _editingIndex != null
          ? ref.read(masterProvider).customers[_editingIndex!].id
          : DateTime.now().millisecondsSinceEpoch.toString(),
      code: _codeCtrl.text.trim(),
      name: _nameCtrl.text.trim(),
      type: _type,
      contact:
          _contactCtrl.text.trim().isEmpty ? null : _contactCtrl.text.trim(),
      address:
          _addressCtrl.text.trim().isEmpty ? null : _addressCtrl.text.trim(),
    );
    if (_editingIndex != null) {
      ref.read(masterProvider.notifier).updateCustomer(_editingIndex!, c);
    } else {
      ref.read(masterProvider.notifier).addCustomer(c);
    }
    _clear();
  }

  @override
  Widget build(BuildContext context) {
    final customers = ref.watch(masterProvider).filteredCustomers;
    return Row(
      children: [
        Expanded(
          flex: 7,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: TextField(
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: _searchDecoration('🔍 Cari pelanggan...'),
                  onChanged: (q) =>
                      ref.read(masterProvider.notifier).setCustomerSearch(q),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppColors.bgCard,
                child: const Row(
                  children: [
                    Expanded(
                        flex: 2,
                        child: Text('Kode',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 3,
                        child: Text('Nama',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Tipe',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Kontak',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    SizedBox(width: 40),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: customers.length,
                  itemBuilder: (ctx, i) {
                    final c = customers[i];
                    return InkWell(
                      onTap: () => _fill(
                          c, ref.read(masterProvider).customers.indexOf(c)),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                            border: Border(
                                bottom: BorderSide(
                                    color: AppColors.borderNeon
                                        .withOpacity(0.5)))),
                        child: Row(
                          children: [
                            Expanded(
                                flex: 2,
                                child: Text(c.code,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                                flex: 3,
                                child: Text(c.name,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                              flex: 2,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (c.type == 'proyek'
                                          ? AppColors.neonCyan
                                          : AppColors.neonGreen)
                                      .withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  c.type.toUpperCase(),
                                  style: TextStyle(
                                      color: c.type == 'proyek'
                                          ? AppColors.neonCyan
                                          : AppColors.neonGreen,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700),
                                ),
                              ),
                            ),
                            Expanded(
                                flex: 2,
                                child: Text(c.contact ?? '-',
                                    style: const TextStyle(
                                        color: AppColors.textDim,
                                        fontSize: 11))),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16),
                              color: AppColors.neonPink,
                              onPressed: () => ref
                                  .read(masterProvider.notifier)
                                  .deleteCustomer(ref
                                      .read(masterProvider)
                                      .customers
                                      .indexOf(c)),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
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
                      _editingIndex != null
                          ? 'EDIT PELANGGAN'
                          : 'TAMBAH PELANGGAN',
                      style: const TextStyle(
                          color: AppColors.neonCyan,
                          fontSize: 14,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  _buildField('Kode', _codeCtrl),
                  const SizedBox(height: 10),
                  _buildField('Nama', _nameCtrl),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: _type,
                    items: const [
                      DropdownMenuItem(
                          value: 'retail',
                          child: Text('Retail',
                              style: TextStyle(color: AppColors.textPrimary))),
                      DropdownMenuItem(
                          value: 'proyek',
                          child: Text('Proyek',
                              style: TextStyle(color: AppColors.textPrimary))),
                    ],
                    onChanged: (v) => setState(() => _type = v!),
                    decoration: _inputDecoration('Tipe'),
                    dropdownColor: AppColors.bgCard,
                  ),
                  const SizedBox(height: 10),
                  _buildField('Kontak', _contactCtrl, required: false),
                  const SizedBox(height: 10),
                  _buildField('Alamat', _addressCtrl,
                      required: false, maxLines: 3),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                          child: ElevatedButton(
                              onPressed: _submit,
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.neonCyan,
                                  foregroundColor: AppColors.bgDark),
                              child: const Text('SIMPAN'))),
                      if (_editingIndex != null) ...[
                        const SizedBox(width: 8),
                        IconButton(
                            onPressed: _clear,
                            icon: const Icon(Icons.close),
                            color: AppColors.neonOrange)
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  TextFormField _buildField(String label, TextEditingController ctrl,
      {bool required = true, int maxLines = 1}) {
    return TextFormField(
      controller: ctrl,
      maxLines: maxLines,
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
            borderSide: const BorderSide(color: AppColors.neonCyan)),
      );

  InputDecoration _searchDecoration(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textDim, fontSize: 13),
        isDense: true,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        fillColor: AppColors.bgDark,
        filled: true,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.borderNeon)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(6),
            borderSide: const BorderSide(color: AppColors.neonCyan)),
      );
}
