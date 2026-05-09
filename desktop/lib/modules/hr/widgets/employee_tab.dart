import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/hr_provider.dart';

class EmployeeTab extends ConsumerStatefulWidget {
  const EmployeeTab({super.key});

  @override
  ConsumerState<EmployeeTab> createState() => _EmployeeTabState();
}

class _EmployeeTabState extends ConsumerState<EmployeeTab> {
  final _formKey = GlobalKey<FormState>();
  final _nipCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _positionCtrl = TextEditingController();
  final _joinDateCtrl = TextEditingController();
  final _salaryCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String? _editingId;

  @override
  void dispose() {
    _nipCtrl.dispose();
    _nameCtrl.dispose();
    _positionCtrl.dispose();
    _joinDateCtrl.dispose();
    _salaryCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _clear() {
    _nipCtrl.clear();
    _nameCtrl.clear();
    _positionCtrl.clear();
    _joinDateCtrl.clear();
    _salaryCtrl.clear();
    _phoneCtrl.clear();
    setState(() => _editingId = null);
  }

  void _fillEdit(id, nip, name, position, joinDate, salary, phone) {
    _nipCtrl.text = nip;
    _nameCtrl.text = name;
    _positionCtrl.text = position;
    _joinDateCtrl.text = joinDate;
    _salaryCtrl.text = salary.toString();
    _phoneCtrl.text = phone ?? '';
    setState(() => _editingId = id);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final salary = double.tryParse(_salaryCtrl.text.trim()) ?? 0;
    String? error;
    if (_editingId != null) {
      error = await ref.read(hrProvider.notifier).updateEmployee(
            _editingId!,
            _nipCtrl.text.trim(),
            _nameCtrl.text.trim(),
            _positionCtrl.text.trim(),
            salary,
            phone:
                _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
          );
    } else {
      error = await ref.read(hrProvider.notifier).addEmployee(
            _nipCtrl.text.trim(),
            _nameCtrl.text.trim(),
            _positionCtrl.text.trim(),
            _joinDateCtrl.text.trim(),
            salary,
            phone:
                _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
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
          content: Text('Karyawan disimpan'),
          backgroundColor: AppColors.neonGreen));
    }
  }

  @override
  Widget build(BuildContext context) {
    final hrState = ref.watch(hrProvider);
    final employees = hrState.filteredEmployees;

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
                  decoration: InputDecoration(
                    hintText: '🔍 Cari karyawan...',
                    hintStyle:
                        const TextStyle(color: AppColors.textDim, fontSize: 13),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    fillColor: AppColors.bgDark,
                    filled: true,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide:
                            const BorderSide(color: AppColors.borderNeon)),
                    focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(6),
                        borderSide:
                            const BorderSide(color: AppColors.neonPink)),
                  ),
                  onChanged: (q) =>
                      ref.read(hrProvider.notifier).setEmployeeSearch(q),
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
                        child: Text('NIP',
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
                        child: Text('Posisi',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    Expanded(
                        flex: 2,
                        child: Text('Gaji',
                            style: TextStyle(
                                color: AppColors.textDim,
                                fontSize: 11,
                                fontWeight: FontWeight.w600))),
                    SizedBox(width: 80),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: employees.length,
                  itemBuilder: (ctx, i) {
                    final e = employees[i];
                    return Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                          border: Border(
                              bottom: BorderSide(
                                  color:
                                      AppColors.borderNeon.withOpacity(0.3)))),
                      child: Row(
                        children: [
                          Expanded(
                              flex: 2,
                              child: Text(e.nip,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12))),
                          Expanded(
                              flex: 3,
                              child: Text(e.fullName,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12))),
                          Expanded(
                              flex: 2,
                              child: Text(e.position,
                                  style: const TextStyle(
                                      color: AppColors.textDim, fontSize: 11))),
                          Expanded(
                              flex: 2,
                              child: Text('Rp ${_formatPrice(e.baseSalary)}',
                                  style: const TextStyle(
                                      color: AppColors.neonGreen,
                                      fontSize: 11))),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                  icon: const Icon(Icons.edit, size: 16),
                                  color: AppColors.neonCyan,
                                  onPressed: () => _fillEdit(
                                      e.id,
                                      e.nip,
                                      e.fullName,
                                      e.position,
                                      e.joinDate,
                                      e.baseSalary,
                                      e.phone)),
                              IconButton(
                                  icon: const Icon(Icons.delete_outline,
                                      size: 16),
                                  color: AppColors.neonPink,
                                  onPressed: () {
                                    showDialog(
                                        context: context,
                                        builder: (ctx) => AlertDialog(
                                              backgroundColor: AppColors.bgCard,
                                              title: const Text(
                                                  'Hapus Karyawan?',
                                                  style: TextStyle(
                                                      color:
                                                          AppColors.neonPink)),
                                              actions: [
                                                TextButton(
                                                    onPressed: () =>
                                                        Navigator.pop(ctx),
                                                    child: const Text('Batal')),
                                                ElevatedButton(
                                                    onPressed: () {
                                                      Navigator.pop(ctx);
                                                      ref
                                                          .read(hrProvider
                                                              .notifier)
                                                          .deleteEmployee(e.id);
                                                    },
                                                    style: ElevatedButton
                                                        .styleFrom(
                                                            backgroundColor:
                                                                AppColors
                                                                    .neonPink),
                                                    child: const Text('Hapus')),
                                              ],
                                            ));
                                  }),
                            ],
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
        Expanded(
          flex: 3,
          child: Container(
            color: AppColors.bgPanel,
            child: Form(
              key: _formKey,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                Text(_editingId != null ? 'EDIT KARYAWAN' : 'TAMBAH KARYAWAN',
                    style: const TextStyle(
                        color: AppColors.neonPink,
                        fontSize: 14,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 16),
                _buildField('NIP', _nipCtrl),
                const SizedBox(height: 10),
                _buildField('Nama Lengkap', _nameCtrl),
                const SizedBox(height: 10),
                _buildField('Posisi', _positionCtrl),
                const SizedBox(height: 10),
                if (_editingId == null) ...[
                  _buildField('Tanggal Masuk (YYYY-MM-DD)', _joinDateCtrl),
                  const SizedBox(height: 10),
                ],
                _buildField('Gaji Pokok', _salaryCtrl,
                    keyboardType: TextInputType.number),
                const SizedBox(height: 10),
                _buildField('Telepon (opsional)', _phoneCtrl, required: false),
                const SizedBox(height: 16),
                ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.neonPink,
                        foregroundColor: AppColors.bgDark),
                    child: Text(_editingId != null ? 'UPDATE' : 'SIMPAN')),
                if (_editingId != null) ...[
                  const SizedBox(height: 8),
                  TextButton(
                      onPressed: _clear,
                      child: const Text('Batal',
                          style: TextStyle(color: AppColors.neonOrange))),
                ],
              ]),
            ),
          ),
        ),
      ],
    );
  }

  TextFormField _buildField(String label, TextEditingController ctrl,
      {bool required = true, TextInputType keyboardType = TextInputType.text}) {
    return TextFormField(
      controller: ctrl,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
      keyboardType: keyboardType,
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
            borderSide: const BorderSide(color: AppColors.neonPink)),
      );

  String _formatPrice(double price) {
    return price
        .toStringAsFixed(0)
        .replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }
}
