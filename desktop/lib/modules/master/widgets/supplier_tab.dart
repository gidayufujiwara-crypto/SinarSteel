import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/master_provider.dart';
import '../models/master_models.dart';

class SupplierTab extends ConsumerStatefulWidget {
  const SupplierTab({super.key});

  @override
  ConsumerState<SupplierTab> createState() => _SupplierTabState();
}

class _SupplierTabState extends ConsumerState<SupplierTab> {
  final _formKey = GlobalKey<FormState>();
  final _codeCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
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
    setState(() => _editingIndex = null);
  }

  void _fill(Supplier s, int i) {
    _codeCtrl.text = s.code;
    _nameCtrl.text = s.name;
    _contactCtrl.text = s.contact ?? '';
    _addressCtrl.text = s.address ?? '';
    setState(() => _editingIndex = i);
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final s = Supplier(
      id: _editingIndex != null
          ? ref.read(masterProvider).suppliers[_editingIndex!].id
          : DateTime.now().millisecondsSinceEpoch.toString(),
      code: _codeCtrl.text.trim(),
      name: _nameCtrl.text.trim(),
      contact:
          _contactCtrl.text.trim().isEmpty ? null : _contactCtrl.text.trim(),
      address:
          _addressCtrl.text.trim().isEmpty ? null : _addressCtrl.text.trim(),
    );
    if (_editingIndex != null) {
      ref.read(masterProvider.notifier).updateSupplier(_editingIndex!, s);
    } else {
      ref.read(masterProvider.notifier).addSupplier(s);
    }
    _clear();
  }

  @override
  Widget build(BuildContext context) {
    final suppliers = ref.watch(masterProvider).filteredSuppliers;
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
                  decoration: _searchDecoration('🔍 Cari supplier...'),
                  onChanged: (q) =>
                      ref.read(masterProvider.notifier).setSupplierSearch(q),
                ),
              ),
              // Table Header
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
                        child: Text('Kontak',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 3,
                        child: Text('Alamat',
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
                  itemCount: suppliers.length,
                  itemBuilder: (ctx, i) {
                    final s = suppliers[i];
                    return InkWell(
                      onTap: () => _fill(
                          s, ref.read(masterProvider).suppliers.indexOf(s)),
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
                                child: Text(s.code,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                                flex: 3,
                                child: Text(s.name,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                                flex: 2,
                                child: Text(s.contact ?? '-',
                                    style: const TextStyle(
                                        color: AppColors.textDim,
                                        fontSize: 11))),
                            Expanded(
                                flex: 3,
                                child: Text(s.address ?? '-',
                                    style: const TextStyle(
                                        color: AppColors.textDim,
                                        fontSize: 11))),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16),
                              color: AppColors.neonPink,
                              onPressed: () => ref
                                  .read(masterProvider.notifier)
                                  .deleteSupplier(ref
                                      .read(masterProvider)
                                      .suppliers
                                      .indexOf(s)),
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
                          ? 'EDIT SUPPLIER'
                          : 'TAMBAH SUPPLIER',
                      style: const TextStyle(
                          color: AppColors.neonCyan,
                          fontSize: 14,
                          fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  _buildField('Kode', _codeCtrl),
                  const SizedBox(height: 10),
                  _buildField('Nama', _nameCtrl),
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
