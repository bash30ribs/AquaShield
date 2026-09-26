import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../widgets/tactical_app_bar.dart';

class EmergencySOSScreen extends StatefulWidget {
  const EmergencySOSScreen({super.key});

  @override
  State<EmergencySOSScreen> createState() => _EmergencySOSScreenState();
}

class _EmergencySOSScreenState extends State<EmergencySOSScreen> with SingleTickerProviderStateMixin {
  bool _isBroadcasting = false;
  int _countdown = 5;
  Timer? _timer;
  LatLng? _currentCoords;
  String _selectedEmergency = 'Vessel Taking Water / Sinking';
  late AnimationController _pulseController;

  final List<String> _emergencyTypes = [
    'Vessel Taking Water / Sinking',
    'Crew Overboard / Medical Crisis',
    'Tidal Wave / Tsunami Threat',
    'Severe Hazardous Chemical Spill',
    'Piracy / Security Interception',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
    _initGPS();
  }

  Future<void> _initGPS() async {
    final pos = await LocationService.getCurrentPosition();
    if (mounted) {
      setState(() => _currentCoords = pos);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _triggerSOSHold() {
    setState(() {
      _countdown = 5;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdown > 1) {
        setState(() => _countdown--);
      } else {
        _timer?.cancel();
        _broadcastDistressBeacon();
      }
    });
  }

  void _cancelSOSTrigger() {
    _timer?.cancel();
    setState(() {
      _countdown = 5;
    });
  }

  Future<void> _broadcastDistressBeacon() async {
    setState(() => _isBroadcasting = true);

    final success = await ApiService.triggerSOS(
      lat: _currentCoords?.latitude ?? 18.9600,
      lng: _currentCoords?.longitude ?? 72.8200,
      emergencyType: _selectedEmergency,
      message: 'EMERGENCY DISTRESS BEACON ACTIVE // MAYDAY BROADCAST',
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: success ? AppColors.crisisRed : AppColors.amberPrimary,
          content: Text(
            success ? '🚨 DISTRESS BEACON TRANSMITTED ACROSS MESH & COAST GUARD' : '📡 SOS QUEUED OFFLINE. P2P MESH BROADCAST ACTIVE.',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const TacticalAppBar(
        title: 'Emergency SOS HUD',
        subtitle: 'GLOBAL MARITIME DISTRESS FREQUENCY // 406.025 MHZ',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Live Coordinates Header
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderDefault),
              ),
              child: Row(
                children: [
                  const Icon(Icons.gps_fixed, color: AppColors.amberPrimary, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'YOUR BROADCAST GPS COORDINATES',
                          style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _currentCoords != null
                              ? '${_currentCoords!.latitude.toStringAsFixed(5)}° N, ${_currentCoords!.longitude.toStringAsFixed(5)}° E'
                              : 'ACQUIRING HIGH-PRECISION SATELLITE FIX...',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Emergency Selector
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderDefault),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedEmergency,
                  isExpanded: true,
                  dropdownColor: AppColors.surfaceElevated,
                  items: _emergencyTypes.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(
                        type,
                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedEmergency = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 36),

            // Huge Tactical SOS Beacon Button
            GestureDetector(
              onTapDown: (_) => _triggerSOSHold(),
              onTapUp: (_) {
                if (_countdown > 0 && !_isBroadcasting) {
                  _cancelSOSTrigger();
                }
              },
              onTapCancel: () {
                if (_countdown > 0 && !_isBroadcasting) {
                  _cancelSOSTrigger();
                }
              },
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isBroadcasting ? AppColors.crisisRed : const Color(0xFF991B1B),
                      border: Border.all(
                        color: _isBroadcasting ? Colors.white : AppColors.crisisRed,
                        width: 4,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.crisisRed.withOpacity(_isBroadcasting ? 0.8 : 0.4 * _pulseController.value + 0.2),
                          blurRadius: 40,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _isBroadcasting ? Icons.cell_tower : Icons.sos,
                            size: 56,
                            color: Colors.white,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _isBroadcasting
                                ? 'MAYDAY BROADCASTING'
                                : _countdown < 5
                                    ? 'HOLD ($_countdown)'
                                    : 'PRESS & HOLD SOS',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 30),

            const Text(
              'Press and hold for 5 seconds to initiate instant P2P mesh relay and satellite coast guard dispatch.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 20),

            if (_isBroadcasting)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.surfaceElevated,
                  foregroundColor: AppColors.textPrimary,
                  side: const BorderSide(color: AppColors.borderDefault),
                ),
                icon: const Icon(Icons.cancel_outlined, color: AppColors.crisisRed),
                label: const Text('CANCEL ACTIVE DISTRESS BEACON'),
                onPressed: () {
                  setState(() => _isBroadcasting = false);
                },
              ),
          ],
        ),
      ),
    );
  }
}
