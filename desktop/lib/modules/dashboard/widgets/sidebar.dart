import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../modules/settings/providers/settings_provider.dart';
import '../../../core/utils/logo_cache.dart';

class Sidebar extends ConsumerWidget {
  final String role;
  final String currentRoute;
  final void Function(String route) onNavigate;
  final VoidCallback onLogout;
  final String userName;

  const Sidebar({
    super.key,
    required this.role,
    required this.currentRoute,
    required this.onNavigate,
    required this.onLogout,
    required this.userName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsState = ref.watch(settingsProvider);
    String? logoUrl = settingsState.store.logoUrl;

    // Simpan ke cache setiap kali URL berubah (ada atau tidak)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      LogoCache.save(logoUrl);
    });

    // Jadikan URL absolut jika relatif
    final baseUrl = 'http://127.0.0.1:8000';
    final fullUrl = (logoUrl != null && logoUrl.isNotEmpty)
        ? (logoUrl.startsWith('http') ? logoUrl : '$baseUrl/$logoUrl')
        : null;

    return Container(
      width: 72,
      color: AppColors.bgPanel,
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Logo
          GestureDetector(
            onTap: () => onNavigate('/dashboard'),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color:
                    fullUrl != null ? Colors.transparent : AppColors.neonCyan,
                borderRadius: BorderRadius.circular(6),
                boxShadow: [
                  BoxShadow(
                      color: AppColors.neonCyan,
                      blurRadius: 20,
                      spreadRadius: 1),
                  BoxShadow(
                      color: AppColors.neonCyan.withOpacity(0.3),
                      blurRadius: 40),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: fullUrl != null
                    ? Image.network(
                        fullUrl,
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildFallbackLogo(),
                      )
                    : _buildFallbackLogo(),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Menu items
          _NavIcon(
              icon: Icons.dashboard_outlined,
              activeIcon: Icons.dashboard,
              isActive: currentRoute == '/dashboard',
              onTap: () => onNavigate('/dashboard')),
          _NavIcon(
              icon: Icons.point_of_sale_outlined,
              activeIcon: Icons.point_of_sale,
              isActive: currentRoute == '/pos',
              onTap: () => onNavigate('/pos')),
          _NavIcon(
              icon: Icons.inventory_2_outlined,
              activeIcon: Icons.inventory_2,
              isActive: currentRoute == '/master',
              onTap: () => onNavigate('/master')),
          _NavIcon(
              icon: Icons.warehouse_outlined,
              activeIcon: Icons.warehouse,
              isActive: currentRoute == '/wms',
              onTap: () => onNavigate('/wms')),
          _NavIcon(
              icon: Icons.local_shipping_outlined,
              activeIcon: Icons.local_shipping,
              isActive: currentRoute == '/delivery',
              onTap: () => onNavigate('/delivery')),
          _NavIcon(
              icon: Icons.bar_chart_outlined,
              activeIcon: Icons.bar_chart,
              isActive: currentRoute == '/report',
              onTap: () => onNavigate('/report')),
          if (role == 'super_admin')
            _NavIcon(
                icon: Icons.people_outline,
                activeIcon: Icons.people,
                isActive: currentRoute == '/hr',
                onTap: () => onNavigate('/hr')),
          const Spacer(),
          _NavIcon(
              icon: Icons.settings_outlined,
              activeIcon: Icons.settings,
              isActive: currentRoute == '/settings',
              onTap: () => onNavigate('/settings')),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildFallbackLogo() {
    return Center(
      child: Text('SS',
          style: GoogleFonts.orbitron(
              fontSize: 16, fontWeight: FontWeight.w900, color: Colors.black)),
    );
  }
}

class _NavIcon extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final bool isActive;
  final VoidCallback onTap;

  const _NavIcon(
      {required this.icon,
      required this.activeIcon,
      required this.isActive,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: isActive
                ? AppColors.neonCyan.withOpacity(0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: isActive
                ? Border.all(color: AppColors.neonCyan.withOpacity(0.3))
                : null,
            boxShadow: isActive
                ? [
                    BoxShadow(
                        color: AppColors.neonCyan.withOpacity(0.2),
                        blurRadius: 12)
                  ]
                : null,
          ),
          child: Stack(
            children: [
              Center(
                  child: Icon(isActive ? activeIcon : icon,
                      size: 18,
                      color:
                          isActive ? AppColors.neonCyan : AppColors.textDim)),
              if (isActive)
                Positioned(
                  left: -1,
                  top: 8,
                  bottom: 8,
                  child: Container(
                    width: 3,
                    decoration: BoxDecoration(
                      color: AppColors.neonCyan,
                      borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(3),
                          bottomRight: Radius.circular(3)),
                      boxShadow: [
                        BoxShadow(color: AppColors.neonCyan, blurRadius: 8)
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
