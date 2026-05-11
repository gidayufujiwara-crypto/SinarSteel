import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String delta;
  final IconData icon;
  final Color color;
  final bool isUp;
  final VoidCallback? onTap;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.delta,
    required this.icon,
    required this.color,
    this.isUp = true,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            border: Border(
              top: BorderSide(color: color, width: 2),
              left: const BorderSide(color: AppColors.borderNeon),
              right: const BorderSide(color: AppColors.borderNeon),
              bottom: const BorderSide(color: AppColors.borderNeon),
            ),
            boxShadow: [
              BoxShadow(color: color.withOpacity(0.15), blurRadius: 12, offset: const Offset(0, 2)),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: GoogleFonts.rajdhani(
                        color: AppColors.textDim,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.5,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 1),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            value,
                            style: GoogleFonts.orbitron(
                              color: color,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              shadows: [Shadow(color: color.withOpacity(0.5), blurRadius: 20)],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(
                          isUp ? Icons.arrow_upward : Icons.arrow_downward,
                          size: 9,
                          color: isUp ? AppColors.neonGreen : AppColors.neonPink,
                        ),
                        const SizedBox(width: 2),
                        Flexible(
                          child: Text(
                            delta,
                            style: TextStyle(
                              color: isUp ? AppColors.neonGreen : AppColors.neonPink,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}