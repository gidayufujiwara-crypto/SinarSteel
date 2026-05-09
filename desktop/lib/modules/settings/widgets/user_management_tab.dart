import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/settings_provider.dart';

class UserManagementTab extends ConsumerStatefulWidget {
  const UserManagementTab({super.key});

  @override
  ConsumerState<UserManagementTab> createState() => _UserManagementTabState();
}

class _UserManagementTabState extends ConsumerState<UserManagementTab> {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _fullNameCtrl = TextEditingController();
  String _role = 'kasir';
  String? _editingId;

  final _roles = [
    'super_admin',
    'kasir',
    'checker',
    'gudang',
    'supir',
    'kernet'
  ];

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _fullNameCtrl.dispose();
    super.dispose();
  }

  void _clearForm() {
    _usernameCtrl.clear();
    _passwordCtrl.clear();
    _fullNameCtrl.clear();
    setState(() {
      _role = 'kasir';
      _editingId = null;
    });
  }

  void _fillEdit(id, username, fullName, role) {
    setState(() {
      _editingId = id;
      _role = role;
    });
    _usernameCtrl.text = username;
    _fullNameCtrl.text = fullName;
    _passwordCtrl.clear();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    String? error;
    if (_editingId != null) {
      error = await ref.read(settingsProvider.notifier).updateUser(
            _editingId!,
            fullName: _fullNameCtrl.text.trim(),
            role: _role,
            password: _passwordCtrl.text.trim().isEmpty
                ? null
                : _passwordCtrl.text.trim(),
          );
    } else {
      error = await ref.read(settingsProvider.notifier).addUser(
            _usernameCtrl.text.trim(),
            _passwordCtrl.text.trim(),
            _fullNameCtrl.text.trim(),
            _role,
          );
    }
    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(error), backgroundColor: AppColors.neonOrange));
      return;
    }
    _clearForm();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('User disimpan'),
          backgroundColor: AppColors.neonGreen));
    }
  }

  @override
  Widget build(BuildContext context) {
    final settingsState = ref.watch(settingsProvider);
    final users = settingsState.filteredUsers;

    return Row(
      children: [
        // Tabel (kiri)
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
                    hintText: '🔍 Cari user...',
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
                            const BorderSide(color: AppColors.neonYellow)),
                  ),
                  onChanged: (q) =>
                      ref.read(settingsProvider.notifier).setUserSearch(q),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppColors.bgCard,
                child: const Row(
                  children: [
                    Expanded(
                        flex: 3,
                        child: Text('Username',
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
                        child: Text('Role',
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
                  itemCount: users.length,
                  itemBuilder: (ctx, i) {
                    final u = users[i];
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
                              flex: 3,
                              child: Text(u.username,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12))),
                          Expanded(
                              flex: 3,
                              child: Text(u.fullName,
                                  style: const TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 12))),
                          Expanded(
                            flex: 2,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.neonYellow.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(u.role,
                                  style: const TextStyle(
                                      color: AppColors.neonYellow,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700)),
                            ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, size: 16),
                                color: AppColors.neonCyan,
                                onPressed: () => _fillEdit(
                                    u.id, u.username, u.fullName, u.role),
                              ),
                              IconButton(
                                icon:
                                    const Icon(Icons.delete_outline, size: 16),
                                color: AppColors.neonPink,
                                onPressed: () {
                                  showDialog(
                                    context: context,
                                    builder: (ctx) => AlertDialog(
                                      backgroundColor: AppColors.bgCard,
                                      title: const Text('Hapus User?',
                                          style: TextStyle(
                                              color: AppColors.neonPink)),
                                      content: Text('Hapus user ${u.username}?',
                                          style: const TextStyle(
                                              color: AppColors.textPrimary)),
                                      actions: [
                                        TextButton(
                                            onPressed: () => Navigator.pop(ctx),
                                            child: const Text('Batal')),
                                        ElevatedButton(
                                          onPressed: () {
                                            Navigator.pop(ctx);
                                            ref
                                                .read(settingsProvider.notifier)
                                                .deleteUser(u.id);
                                          },
                                          style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  AppColors.neonPink),
                                          child: const Text('Hapus'),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
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
                    _editingId != null ? 'EDIT USER' : 'TAMBAH USER',
                    style: const TextStyle(
                        color: AppColors.neonYellow,
                        fontSize: 14,
                        fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 16),
                  if (_editingId == null) ...[
                    _buildField('Username', _usernameCtrl),
                    const SizedBox(height: 10),
                  ],
                  TextFormField(
                    controller: _passwordCtrl,
                    obscureText: true,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                    decoration: _inputDecoration(_editingId != null
                        ? 'Password Baru (kosongkan jika tidak)'
                        : 'Password'),
                    validator: _editingId != null
                        ? null
                        : (v) => v == null || v.trim().isEmpty
                            ? 'Wajib diisi'
                            : null,
                  ),
                  const SizedBox(height: 10),
                  _buildField('Nama Lengkap', _fullNameCtrl),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: _role,
                    items: _roles
                        .map((r) => DropdownMenuItem(
                            value: r,
                            child: Text(r,
                                style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13))))
                        .toList(),
                    onChanged: (v) => setState(() => _role = v!),
                    decoration: _inputDecoration('Role'),
                    dropdownColor: AppColors.bgCard,
                  ),
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
                        onPressed: _clearForm,
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

  TextFormField _buildField(String label, TextEditingController ctrl) {
    return TextFormField(
      controller: ctrl,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
      decoration: _inputDecoration(label),
      validator: (v) => v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
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
