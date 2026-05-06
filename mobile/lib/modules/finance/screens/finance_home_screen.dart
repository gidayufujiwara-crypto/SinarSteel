import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'journal_screen.dart';
import 'cash_screen.dart';
import 'report_screen.dart';

class FinanceHomeScreen extends ConsumerWidget {
  const FinanceHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Keuangan'),
          bottom: const TabBar(
            labelColor: Color(0xFF00F5FF),
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(icon: Icon(Icons.book), text: 'Jurnal'),
              Tab(icon: Icon(Icons.money), text: 'Kas'),
              Tab(icon: Icon(Icons.bar_chart), text: 'Laporan'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            JournalScreen(),
            CashScreen(),
            ReportScreen(),
          ],
        ),
      ),
    );
  }
}
