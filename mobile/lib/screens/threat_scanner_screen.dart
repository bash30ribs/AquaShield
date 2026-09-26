import 'dart:convert';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../models/threat_assessment.dart';
import '../widgets/tactical_app_bar.dart';

class ThreatScannerScreen extends StatefulWidget {
  const ThreatScannerScreen({super.key});

  @override
  State<ThreatScannerScreen> createState() => _ThreatScannerScreenState();
}

class _ThreatScannerScreenState extends State<ThreatScannerScreen> {
  bool _isAnalyzing = false;
  ThreatAssessment? _assessment;

  Future<void> _runSimulatedScan() async {
    setState(() {
      _isAnalyzing = true;
      _assessment = null;
    });

    await Future.delayed(const Duration(milliseconds: 1400));
    final result = await ApiService.analyzeThreatImage('SIMULATED_SURVEILLANCE_FRAME');

    if (mounted) {
      setState(() {
        _assessment = result;
        _isAnalyzing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const TacticalAppBar(
        title: 'AI Threat Scanner',
        subtitle: 'SPECTRAL SIGNATURE & COMPUTER VISION INFERENCE',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Scanner Viewport Box
            GestureDetector(
              onTap: _isAnalyzing ? null : _runSimulatedScan,
              child: Container(
                width: double.infinity,
                height: 220,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isAnalyzing ? AppColors.amberPrimary : AppColors.borderDefault,
                    width: 1.5,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isAnalyzing) ...[
                        const CircularProgressIndicator(color: AppColors.amberPrimary),
                        const SizedBox(height: 16),
                        const Text(
                          'ANALYZING MULTISPECTRAL SIGNATURES...',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.amberPrimary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ] else ...[
                        const Icon(Icons.center_focus_strong, size: 48, color: AppColors.amberPrimary),
                        const SizedBox(height: 12),
                        const Text(
                          'TAP TO SCAN LIVE CAMERA OR SATELLITE TILE',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Auto-detects petroleum slicks, submerged debris, & distress vessels',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // AI Inference Results Card
            if (_assessment != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.crisisRed),
                  boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 16)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.crisisRed.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: AppColors.crisisRed),
                          ),
                          child: Text(
                            'SEVERITY: ${_assessment!.severity.toUpperCase()}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppColors.crisisRed,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        Text(
                          'CONFIDENCE: ${(_assessment!.confidence * 100).toInt()}%',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.amberPrimary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _assessment!.threatClass,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _assessment!.description,
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'RECOMMENDED TACTICAL PROTOCOLS:',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 8),
                    ..._assessment!.recommendedActions.map((act) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 3),
                          child: Row(
                            children: [
                              const Icon(Icons.arrow_right, color: AppColors.amberPrimary, size: 16),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  act,
                                  style: const TextStyle(fontSize: 12, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
