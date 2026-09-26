import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import 'tactical_map_screen.dart';
import 'report_incident_screen.dart';
import 'threat_scanner_screen.dart';
import 'copilot_screen.dart';
import 'emergency_sos_screen.dart';
import 'evacuation_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    TacticalMapScreen(),
    ReportIncidentScreen(),
    ThreatScannerScreen(),
    CopilotScreen(),
    EmergencySOSScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.borderDefault, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.amberPrimary,
          unselectedItemColor: AppColors.textMuted,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore),
              label: 'Radar GIS',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.report_problem_outlined),
              activeIcon: Icon(Icons.report_problem),
              label: 'Report',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.document_scanner_outlined),
              activeIcon: Icon(Icons.document_scanner),
              label: 'AI Scanner',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.smart_toy_outlined),
              activeIcon: Icon(Icons.smart_toy),
              label: 'Copilot',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sos_outlined),
              activeIcon: Icon(Icons.sos, color: AppColors.crisisRed),
              label: 'SOS Beacon',
            ),
          ],
        ),
      ),
    );
  }
}
