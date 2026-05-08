import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class HrScreen extends StatelessWidget {
  const HrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'HR & KARYAWAN',
        style: TextStyle(color: AppColors.neonYellow, fontSize: 24),
      ),
    );
  }
}
