import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class DeliveryScreen extends StatelessWidget {
  const DeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'PENGIRIMAN',
        style: TextStyle(color: AppColors.neonBlue, fontSize: 24),
      ),
    );
  }
}
