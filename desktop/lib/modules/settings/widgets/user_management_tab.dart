import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/settings_provider.dart';

class UserManagementTab extends ConsumerStatefulWidget {
  const UserManagementTab({super.key});
  @override
  ConsumerState<UserManagementTab> createState() => _UserManagementTabState();
}

class _UserManagementTabState extends ConsumerState<UserManagementTab> {
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _fullNameCtrl = TextEditingController();
  String _role = 'kasir';
  final _formKey = GlobalKey<FormState>();

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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final error = await ref.read(settingsProvider.notifier).addUser(
          _usernameCtrl.text.trim(),
          _passwordCtrl.text.trim(),
          _fullNameCtrl.text.trim(),
          _role,
        );
    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(error), backgroundColor: AppColors.neonOrange));
      return;
    }
    _usernameCtrl.clear();
    _passwordCtrl.clear();
    _fullNameCtrl.clear();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('User ditambahkan'),
          backgroundColor: AppColors.neonGreen));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(settingsProvider);
    final users = state.filteredUsers;

    return Row(
      children: [
        // Daftar user
        Expanded(
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
                    SizedBox(width: 40),
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
                            child: Text(u.role,
                                style: const TextStyle(
                                    color: AppColors.neonYellow,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700)),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 16),
                            color: AppColors.neonPink,
                            onPressed: () => showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                backgroundColor: AppColors.bgCard,
                                title: const Text('Hapus User?',
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
                                          .deleteUser(u.id);
                                    },
                                    style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.neonPink),
                                    child: const Text('Hapus'),
                                  ),
                                ],
                              ),
                            ),
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
        // Form tambah
        Expanded(
          child: Container(
            color: AppColors.bgPanel,
            child: Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text('TAMBAH USER',
                      style: GoogleFonts.orbitron(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.neonYellow)),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _usernameCtrl,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                    decoration: _inputDecoration('Username'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _passwordCtrl,
                    obscureText: true,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                    decoration: _inputDecoration('Password'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _fullNameCtrl,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 13),
                    decoration: _inputDecoration('Nama Lengkap'),
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
                  ),
                  const SizedBox(height: 12),
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
                    onChanged: (v) => _role = v!,
                    decoration: _inputDecoration('Role'),
                    dropdownColor: AppColors.bgCard,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.neonYellow,
                        foregroundColor: AppColors.bgDark),
                    child: const Text('SIMPAN'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
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
