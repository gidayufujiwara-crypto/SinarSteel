import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'PENGATURAN',
        style: TextStyle(color: AppColors.textPrimary, fontSize: 24),
      ),
    );
  }
}
