import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/auth/auth_provider.dart';
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
        scaffoldBackgroundColor: const Color(0xFF060A10),
        primaryColor: const Color(0xFF00F5FF),
        fontFamily: 'Rajdhani',
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