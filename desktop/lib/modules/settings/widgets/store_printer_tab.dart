import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/settings_provider.dart';
import '../models/settings_models.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:typed_data';

class StorePrinterTab extends ConsumerStatefulWidget {
  const StorePrinterTab({super.key});

  @override
  ConsumerState<StorePrinterTab> createState() => _StorePrinterTabState();
}

class _StorePrinterTabState extends ConsumerState<StorePrinterTab> {
  final _formKey = GlobalKey<FormState>();
  final _storeNameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _footerCtrl = TextEditingController();
  String _printerType = 'usb';
  final _printerPathCtrl = TextEditingController();

  // Untuk upload logo (web vs non‑web)
  String? _logoFileName;
  Uint8List? _logoBytes; // digunakan di web
  String? _logoPath; // digunakan di desktop

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final s = ref.read(settingsProvider);
      _storeNameCtrl.text = s.store.storeName;
      _addressCtrl.text = s.store.address;
      _phoneCtrl.text = s.store.phone;
      _footerCtrl.text = s.store.footer;
      _printerType = s.printer.type;
      _printerPathCtrl.text = s.printer.path ?? '';
    });
  }

  @override
  void dispose() {
    _storeNameCtrl.dispose();
    _addressCtrl.dispose();
    _phoneCtrl.dispose();
    _footerCtrl.dispose();
    _printerPathCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: kIsWeb, // ambil bytes hanya di web
      withReadStream: false,
    );
    if (result != null && result.files.isNotEmpty) {
      final file = result.files.first;
      setState(() {
        _logoFileName = file.name;
        if (kIsWeb) {
          _logoBytes = file.bytes;
          _logoPath = null;
        } else {
          _logoPath = file.path;
          _logoBytes = null;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final store = StoreSettings(
      storeName: _storeNameCtrl.text.trim(),
      address: _addressCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      footer: _footerCtrl.text.trim(),
    );
    final printer = PrinterSettings(
      type: _printerType,
      path: _printerPathCtrl.text.trim().isEmpty
          ? null
          : _printerPathCtrl.text.trim(),
    );

    String? error;
    if (_logoBytes != null) {
      // Web – kirim via bytes
      error =
          await ref.read(settingsProvider.notifier).saveStorePrinterWithBytes(
                store,
                printer,
                bytes: _logoBytes!,
                fileName: _logoFileName ?? 'logo.png',
              );
    } else {
      // Desktop – kirim via path
      error = await ref.read(settingsProvider.notifier).saveStorePrinter(
            store,
            printer,
            logoPath: _logoPath,
          );
    }

    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: AppColors.neonOrange),
      );
      return;
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Pengaturan disimpan'),
            backgroundColor: AppColors.neonGreen),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final settingsState = ref.watch(settingsProvider);
    final store = settingsState.store;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Card(
                color: AppColors.bgCard,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: AppColors.borderNeon),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('INFO TOKO',
                          style: TextStyle(
                              color: AppColors.neonYellow,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1)),
                      const SizedBox(height: 16),
                      _buildField('Nama Toko', _storeNameCtrl),
                      const SizedBox(height: 12),
                      _buildField('Alamat', _addressCtrl, maxLines: 2),
                      const SizedBox(height: 12),
                      _buildField('Telepon', _phoneCtrl),
                      const SizedBox(height: 12),
                      _buildField('Footer Struk', _footerCtrl),
                      const SizedBox(height: 16),
                      const Text('Logo Toko',
                          style: TextStyle(
                              color: AppColors.textDim, fontSize: 12)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: _pickLogo,
                            icon: const Icon(Icons.upload, size: 16),
                            label: Text(_logoFileName ?? 'Pilih file',
                                style: const TextStyle(fontSize: 12)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  AppColors.neonYellow.withOpacity(0.15),
                              foregroundColor: AppColors.neonYellow,
                            ),
                          ),
                          const SizedBox(width: 12),
                          if (store.logoUrl != null && _logoFileName == null)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                store.logoUrl!,
                                width: 60,
                                height: 60,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                    Icons.image_not_supported,
                                    color: AppColors.textDim),
                              ),
                            ),
                          if (_logoFileName != null)
                            const Icon(Icons.check_circle,
                                color: AppColors.neonGreen, size: 32),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Card(
                color: AppColors.bgCard,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: AppColors.borderNeon),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('PRINTER',
                          style: TextStyle(
                              color: AppColors.neonYellow,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1)),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _printerType,
                        items: const [
                          DropdownMenuItem(
                              value: 'usb',
                              child: Text('USB',
                                  style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 13))),
                          DropdownMenuItem(
                              value: 'bluetooth',
                              child: Text('Bluetooth',
                                  style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 13))),
                          DropdownMenuItem(
                              value: 'network',
                              child: Text('Network / WiFi',
                                  style: TextStyle(
                                      color: AppColors.textPrimary,
                                      fontSize: 13))),
                        ],
                        onChanged: (v) => setState(() => _printerType = v!),
                        decoration: _inputDecoration('Tipe Printer'),
                        dropdownColor: AppColors.bgCard,
                      ),
                      const SizedBox(height: 12),
                      _buildField('Path / Nama Printer', _printerPathCtrl,
                          required: false),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.neonYellow,
                            foregroundColor: AppColors.bgDark,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          child: const Text('SIMPAN SEMUA'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
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
            borderSide: const BorderSide(color: AppColors.neonYellow)),
      );
}
