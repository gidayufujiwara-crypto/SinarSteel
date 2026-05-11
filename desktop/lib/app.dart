import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/auth/auth_provider.dart';
import 'core/theme/app_theme.dart';
import 'modules/auth/screens/login_screen.dart';
import 'modules/dashboard/screens/dashboard_screen.dart';

class SinarSteelApp extends StatelessWidget {
  const SinarSteelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SinarSteel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.bgDark,
        primaryColor: AppColors.neonCyan,
        textTheme: GoogleFonts.rajdhaniTextTheme(
          ThemeData.dark().textTheme,
        ).copyWith(
          headlineLarge: GoogleFonts.orbitron(),
          headlineMedium: GoogleFonts.orbitron(),
          headlineSmall: GoogleFonts.orbitron(),
          titleLarge: GoogleFonts.orbitron(),
        ),
      ),
      home: const AuthGate(),
    );
  }
}

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    return authState.isAuthenticated
        ? const DashboardScreen()
        : const LoginScreen();
  }
}
