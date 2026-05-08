import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/master_provider.dart';
import '../models/master_models.dart';

class ProductTab extends ConsumerStatefulWidget {
  const ProductTab({super.key});

  @override
  ConsumerState<ProductTab> createState() => _ProductTabState();
}

class _ProductTabState extends ConsumerState<ProductTab> {
  final _formKey = GlobalKey<FormState>();
  final _codeCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  String _category = '';
  String _unit = '';
  final _costCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController();
  int? _editingIndex;

  @override
  void dispose() {
    _codeCtrl.dispose();
    _nameCtrl.dispose();
    _costCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    super.dispose();
  }

  void _clearForm() {
    _codeCtrl.clear();
    _nameCtrl.clear();
    _costCtrl.clear();
    _priceCtrl.clear();
    _stockCtrl.clear();
    setState(() {
      _category = '';
      _unit = '';
      _editingIndex = null;
    });
  }

  void _fillForm(Product p, int index) {
    _codeCtrl.text = p.code;
    _nameCtrl.text = p.name;
    _costCtrl.text = p.costPrice.toString();
    _priceCtrl.text = p.sellingPrice.toString();
    _stockCtrl.text = p.stock.toString();
    setState(() {
      _category = p.category;
      _unit = p.unit;
      _editingIndex = index;
    });
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    if (_category.isEmpty || _unit.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih kategori dan satuan')),
      );
      return;
    }
    final product = Product(
      id: _editingIndex != null
          ? ref.read(masterProvider).products[_editingIndex!].id
          : DateTime.now().millisecondsSinceEpoch.toString(),
      code: _codeCtrl.text.trim(),
      name: _nameCtrl.text.trim(),
      category: _category,
      unit: _unit,
      costPrice: double.tryParse(_costCtrl.text.trim()) ?? 0,
      sellingPrice: double.tryParse(_priceCtrl.text.trim()) ?? 0,
      stock: int.tryParse(_stockCtrl.text.trim()) ?? 0,
    );

    if (_editingIndex != null) {
      ref.read(masterProvider.notifier).updateProduct(_editingIndex!, product);
    } else {
      ref.read(masterProvider.notifier).addProduct(product);
    }
    _clearForm();
  }

  @override
  Widget build(BuildContext context) {
    final masterState = ref.watch(masterProvider);
    final products = masterState.filteredProducts;
    final categories = masterState.categories.map((c) => c.name).toList();
    final units = masterState.units.map((u) => u.name).toList();

    return Row(
      children: [
        // Tabel (70%)
        Expanded(
          flex: 7,
          child: Column(
            children: [
              // Search
              Padding(
                padding: const EdgeInsets.all(12),
                child: TextField(
                  style: const TextStyle(
                      color: AppColors.textPrimary, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: '🔍 Cari produk...',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 13),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6),
                      borderSide: const BorderSide(color: AppColors.borderNeon),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(6),
                      borderSide: const BorderSide(color: AppColors.neonCyan),
                    ),
                  ),
                  onChanged: (q) =>
                      ref.read(masterProvider.notifier).setProductSearch(q),
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
                        child: Text('Kategori',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Harga',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 1,
                        child: Text('Stok',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    SizedBox(width: 40),
                  ],
                ),
              ),
              // Table Body
              Expanded(
                child: ListView.builder(
                  itemCount: products.length,
                  itemBuilder: (ctx, i) {
                    final p = products[i];
                    return InkWell(
                      onTap: () =>
                          _fillForm(p, masterState.products.indexOf(p)),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          border: Border(
                              bottom: BorderSide(
                                  color:
                                      AppColors.borderNeon.withOpacity(0.5))),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                                flex: 2,
                                child: Text(p.code,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                                flex: 3,
                                child: Text(p.name,
                                    style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12))),
                            Expanded(
                                flex: 2,
                                child: Text(p.category,
                                    style: const TextStyle(
                                        color: AppColors.textDim,
                                        fontSize: 11))),
                            Expanded(
                                flex: 2,
                                child: Text('Rp ${_fmt(p.sellingPrice)}',
                                    style: const TextStyle(
                                        color: AppColors.neonGreen,
                                        fontSize: 12))),
                            Expanded(
                                flex: 1,
                                child: Text('${p.stock}',
                                    style: TextStyle(
                                        color: p.stock <= 10
                                            ? AppColors.neonOrange
                                            : AppColors.textPrimary,
                                        fontSize: 12))),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 16),
                              color: AppColors.neonPink,
                              onPressed: () => ref
                                  .read(masterProvider.notifier)
                                  .deleteProduct(
                                      masterState.products.indexOf(p)),
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
        // Form (30%)
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
                    _editingIndex != null ? 'EDIT PRODUK' : 'TAMBAH PRODUK',
                    style: const TextStyle(
                        color: AppColors.neonCyan,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1),
                  ),
                  const SizedBox(height: 16),
                  _buildField('Kode', _codeCtrl),
                  const SizedBox(height: 10),
                  _buildField('Nama', _nameCtrl),
                  const SizedBox(height: 10),
                  // Category Dropdown
                  DropdownButtonFormField<String>(
                    value: _category.isEmpty ? null : _category,
                    items: categories
                        .map((c) => DropdownMenuItem(
                            value: c,
                            child: Text(c,
                                style: const TextStyle(
                                    color: AppColors.textPrimary))))
                        .toList(),
                    onChanged: (v) => setState(() => _category = v!),
                    decoration: _inputDecoration('Kategori'),
                    dropdownColor: AppColors.bgCard,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                  ),
                  const SizedBox(height: 10),
                  // Unit Dropdown
                  DropdownButtonFormField<String>(
                    value: _unit.isEmpty ? null : _unit,
                    items: units
                        .map((u) => DropdownMenuItem(
                            value: u,
                            child: Text(u,
                                style: const TextStyle(
                                    color: AppColors.textPrimary))))
                        .toList(),
                    onChanged: (v) => setState(() => _unit = v!),
                    decoration: _inputDecoration('Satuan'),
                    dropdownColor: AppColors.bgCard,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                  ),
                  const SizedBox(height: 10),
                  _buildField('Harga Beli', _costCtrl,
                      keyboardType: TextInputType.number),
                  const SizedBox(height: 10),
                  _buildField('Harga Jual', _priceCtrl,
                      keyboardType: TextInputType.number),
                  const SizedBox(height: 10),
                  _buildField('Stok', _stockCtrl,
                      keyboardType: TextInputType.number),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _submit,
                          style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.neonCyan,
                              foregroundColor: AppColors.bgDark),
                          child: const Text('SIMPAN'),
                        ),
                      ),
                      if (_editingIndex != null) ...[
                        const SizedBox(width: 8),
                        IconButton(
                          onPressed: _clearForm,
                          icon: const Icon(Icons.close),
                          color: AppColors.neonOrange,
                        ),
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
      {TextInputType keyboardType = TextInputType.text}) {
    return TextFormField(
      controller: ctrl,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
      keyboardType: keyboardType,
      decoration: _inputDecoration(label),
      validator: (v) => v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: AppColors.textDim, fontSize: 11),
      filled: true,
      fillColor: AppColors.bgDark,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
  }

  String _fmt(double val) => val
      .toStringAsFixed(0)
      .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
}
