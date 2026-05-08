import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class Sidebar extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final menus = _getMenusForRole(role);

    return Container(
      color: AppColors.bgPanel,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.borderNeon),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.neonCyan,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.neonCyan.withOpacity(0.4),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'S',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.bgDark,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'SINARSTEEL',
                            style: TextStyle(
                              color: AppColors.neonCyan,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                          Text(
                            userName,
                            style: const TextStyle(
                              color: AppColors.textDim,
                              fontSize: 11,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.neonOrange.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: AppColors.neonOrange.withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    role.toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.neonOrange,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Menu List
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: menus
                  .map((menu) => _SidebarItem(
                        icon: menu.icon,
                        label: menu.label,
                        route: menu.route,
                        isActive: currentRoute == menu.route,
                        onTap: () => onNavigate(menu.route),
                      ))
                  .toList(),
            ),
          ),

          // Logout Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                top: BorderSide(color: AppColors.borderNeon),
              ),
            ),
            child: InkWell(
              onTap: onLogout,
              child: const Row(
                children: [
                  Icon(
                    Icons.logout,
                    color: AppColors.neonPink,
                    size: 18,
                  ),
                  SizedBox(width: 10),
                  Text(
                    'Logout',
                    style: TextStyle(
                      color: AppColors.neonPink,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<_MenuItem> _getMenusForRole(String role) {
    final allMenus = <_MenuItem>[
      _MenuItem(
          Icons.point_of_sale, 'POS Kasir', '/pos', ['super_admin', 'kasir']),
      _MenuItem(Icons.inventory, 'Master Data', '/master', ['super_admin']),
      _MenuItem(
          Icons.warehouse, 'Gudang (WMS)', '/wms', ['super_admin', 'gudang']),
      _MenuItem(Icons.local_shipping, 'Pengiriman', '/delivery',
          ['super_admin', 'kasir', 'checker', 'supir', 'kernet']),
      _MenuItem(Icons.people, 'HR & Karyawan', '/hr', ['super_admin']),
      _MenuItem(Icons.assessment, 'Laporan', '/report', ['super_admin']),
      _MenuItem(Icons.settings, 'Pengaturan', '/settings', ['super_admin']),
    ];

    return allMenus.where((m) => m.roles.contains(role)).toList();
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final String route;
  final List<String> roles;

  _MenuItem(this.icon, this.label, this.route, this.roles);
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;
  final bool isActive;
  final VoidCallback onTap;

  const _SidebarItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: Material(
        color:
            isActive ? AppColors.neonCyan.withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: isActive ? AppColors.neonCyan : AppColors.textDim,
                ),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: TextStyle(
                    color: isActive ? AppColors.neonCyan : AppColors.textDim,
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
