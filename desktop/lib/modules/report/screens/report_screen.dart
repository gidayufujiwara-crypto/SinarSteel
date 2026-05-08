import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class ReportScreen extends StatelessWidget {
  const ReportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'LAPORAN',
        style: TextStyle(color: AppColors.neonOrange, fontSize: 24),
      ),
    );
  }
}
