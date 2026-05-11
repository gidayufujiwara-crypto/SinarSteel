import 'package:flutter/material.dart';

class AppColors {
  static const bgDark = Color(0xFF060A10);
  static const bgPanel = Color(0xFF0B1220);
  static const bgCard = Color(0xFF0E1A2E);
  static const bgHover = Color(0xFF111E38);
  static const bgItem = Color(0xFF0A1520);

  static const neonCyan = Color(0xFF00F5FF);
  static const neonOrange = Color(0xFFFF6B00);
  static const neonYellow = Color(0xFFF5E642);
  static const neonGreen = Color(0xFF39FF14);
  static const neonPink = Color(0xFFFF2D78);
  static const neonBlue = Color(0xFF4361EE);

  static const textPrimary = Color(0xFFC8DCFF);
  static const textDim = Color(0x7390A0B8);

  static const borderNeon = Color(0x1A00F5FF);
  static const gridLine = Color(0x0F00F5FF);
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.gridLine
      ..strokeWidth = 1;
    const step = 48.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ScanlinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0x1F000000)
      ..strokeWidth = 2;
    for (double y = 0; y < size.height; y += 4) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
