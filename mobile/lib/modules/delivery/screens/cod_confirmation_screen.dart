import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../core/auth_provider.dart';
import 'package:dio/dio.dart';

class CODConfirmationScreen extends ConsumerStatefulWidget {
  final dynamic order;
  const CODConfirmationScreen({super.key, required this.order});

  @override
  ConsumerState<CODConfirmationScreen> createState() =>
      _CODConfirmationScreenState();
}

class _CODConfirmationScreenState extends ConsumerState<CODConfirmationScreen> {
  final _nominalController = TextEditingController();
  File? _foto;
  bool _loading = false;

  Future<void> _takePicture() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    if (image != null) {
      setState(() => _foto = File(image.path));
    }
  }

  Future<void> _confirm() async {
    // ... validasi nominal
    setState(() => _loading = true);
    final api = ref.read(apiClientProvider);
    try {
      String? uploadedUrl;
      if (_foto != null) {
        // Upload foto ke backend
        final formData = FormData.fromMap({
          'file':
              await MultipartFile.fromFile(_foto!.path, filename: 'cod.jpg'),
        });
        final uploadRes =
            await api.dio.post('/delivery/upload', data: formData);
        uploadedUrl = uploadRes.data['url'];
      }

      await api.dio
          .post('/delivery/orders/${widget.order['id']}/cod-confirm', data: {
        'nominal_diterima': double.parse(_nominalController.text),
        'foto_url': uploadedUrl ?? '',
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('COD berhasil dikonfirmasi')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      // ...
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Konfirmasi COD')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text('Order: ${widget.order['no_order']}'),
            const SizedBox(height: 16),
            TextField(
              controller: _nominalController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Nominal Diterima'),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _takePicture,
              icon: const Icon(Icons.camera),
              label: Text(_foto == null ? 'Ambil Foto' : 'Ganti Foto'),
            ),
            if (_foto != null) Image.file(_foto!, height: 150),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _confirm,
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00FF88)),
              child: const Text('KONFIRMASI'),
            ),
          ],
        ),
      ),
    );
  }
}
