import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/auth/auth_provider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logo_cache.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  String? _logoUrl;

  @override
  void initState() {
    super.initState();
    _loadLogo();
  }

  Future<void> _loadLogo() async {
    final url = await LogoCache.get();
    if (mounted) {
      setState(() => _logoUrl = url);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _login() {
    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    if (username.isEmpty || password.isEmpty) return;
    ref.read(authProvider.notifier).login(username, password);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    if (authState.isLoading) {
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.neonCyan),
        ),
      );
    }

    const baseUrl = 'http://127.0.0.1:8000';
    final fullUrl = (_logoUrl != null && _logoUrl!.isNotEmpty)
        ? (_logoUrl!.startsWith('http') ? _logoUrl! : '$baseUrl/$_logoUrl')
        : null;

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color:
                      fullUrl != null ? Colors.transparent : AppColors.neonCyan,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                        color: AppColors.neonCyan.withOpacity(0.5),
                        blurRadius: 30),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: fullUrl != null
                      ? Image.network(fullUrl,
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallback())
                      : _buildFallback(),
                ),
              ),
              const SizedBox(height: 20),

              // Brand
              Text.rich(
                TextSpan(
                  style: GoogleFonts.orbitron(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 4,
                  ),
                  children: [
                    TextSpan(
                      text: 'SINAR',
                      style: TextStyle(
                        color: AppColors.neonCyan,
                        shadows: [
                          Shadow(
                              color: AppColors.neonCyan.withOpacity(0.8),
                              blurRadius: 20),
                        ],
                      ),
                    ),
                    const TextSpan(text: ' '),
                    TextSpan(
                      text: 'STEEL',
                      style: TextStyle(
                        color: AppColors.neonOrange,
                        shadows: [
                          Shadow(
                              color: AppColors.neonOrange.withOpacity(0.8),
                              blurRadius: 20),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Sistem Manajemen Toko Besi',
                style: TextStyle(
                    color: AppColors.textDim, fontSize: 14, letterSpacing: 1),
              ),
              const SizedBox(height: 48),

              // Login Card
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderNeon),
                ),
                child: Column(
                  children: [
                    if (authState.error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.neonPink.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                              color: AppColors.neonPink.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: AppColors.neonPink, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(authState.error!,
                                  style: const TextStyle(
                                      color: AppColors.neonPink, fontSize: 13)),
                            ),
                          ],
                        ),
                      ),
                    TextField(
                      controller: _usernameController,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        labelText: 'USERNAME',
                        prefixIcon: const Icon(Icons.person,
                            color: AppColors.textDim, size: 18),
                        border: const OutlineInputBorder(),
                        enabledBorder: const OutlineInputBorder(
                            borderSide:
                                BorderSide(color: AppColors.borderNeon)),
                        focusedBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: AppColors.neonCyan)),
                      ),
                      onSubmitted: (_) => _login(),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      obscureText: !_showPassword,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        labelText: 'PASSWORD',
                        prefixIcon: const Icon(Icons.lock,
                            color: AppColors.textDim, size: 18),
                        suffixIcon: IconButton(
                          icon: Icon(
                              _showPassword
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                              color: AppColors.textDim,
                              size: 18),
                          onPressed: () =>
                              setState(() => _showPassword = !_showPassword),
                        ),
                        border: const OutlineInputBorder(),
                        enabledBorder: const OutlineInputBorder(
                            borderSide:
                                BorderSide(color: AppColors.borderNeon)),
                        focusedBorder: const OutlineInputBorder(
                            borderSide: BorderSide(color: AppColors.neonCyan)),
                      ),
                      onSubmitted: (_) => _login(),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.neonCyan,
                          foregroundColor: AppColors.bgDark,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6)),
                        ),
                        child: Text(
                          'MASUK',
                          style: GoogleFonts.orbitron(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2,
                            color: AppColors.bgDark,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Text(
                '© 2026 SinarSteel v1.2.0',
                style: TextStyle(
                    color: AppColors.textDim.withOpacity(0.5), fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFallback() {
    return Center(
      child: Text(
        'SS',
        style: GoogleFonts.orbitron(
            fontSize: 42, fontWeight: FontWeight.w900, color: AppColors.bgDark),
      ),
    );
  }
}
