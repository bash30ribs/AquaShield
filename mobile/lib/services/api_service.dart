import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/report.dart';
import '../models/buoy.dart';
import '../models/vessel.dart';
import '../models/threat_assessment.dart';

class ApiService {
  static String baseUrl = 'http://10.0.2.2:8000'; // Default Android emulator host to localhost

  static void setBaseUrl(String url) {
    baseUrl = url;
  }

  // 1. Fetch Field Reports
  static Future<List<Report>> fetchReports() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/reports')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Report.fromJson(json)).toList();
      }
    } catch (e) {
      // Fallback mock data when offline or network fails
    }
    return _getOfflineFallbackReports();
  }

  // 2. Submit New Field Report
  static Future<bool> submitReport(Report report) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/reports'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(report.toJson()),
      ).timeout(const Duration(seconds: 5));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  // 3. Trigger Emergency SOS Distress Broadcast
  static Future<bool> triggerSOS({
    required double lat,
    required double lng,
    required String emergencyType,
    required String message,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/sos'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'latitude': lat,
          'longitude': lng,
          'type': emergencyType,
          'message': message,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      ).timeout(const Duration(seconds: 5));
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  // 4. Copilot Maritime Chat Query
  static Future<String> askCopilot(String prompt) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': prompt}),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reply'] ?? 'Tactical response received.';
      }
    } catch (e) {
      // Fallback offline tactical advisory
    }
    return 'COASTAL COMMAND ADVISORY: Marine telemetry indicates calm sea state. Deploy containment protocols if entering hazardous sectors.';
  }

  // 5. Threat Scanner Vision Analysis
  static Future<ThreatAssessment> analyzeThreatImage(String imageBase64) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/threat-scan'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'image': imageBase64}),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ThreatAssessment.fromJson(data);
      }
    } catch (e) {
      // Fallback simulated response
    }
    return ThreatAssessment(
      threatClass: 'Surface Petroleum Sheen & Debris',
      confidence: 0.94,
      severity: 'High',
      description: 'Spectral visual signature matches hydrocarbons and floating plastic debris near coast.',
      recommendedActions: [
        'Deploy Marine Containment Boom',
        'Dispatch Sector Response Patrol',
        'Alert Maritime Environmental Protection Board'
      ],
    );
  }

  // Telemetry Buoys Mock/Live Data
  static List<BuoyTelemetry> getSmartBuoys() {
    return [
      BuoyTelemetry(id: 'BUOY-01', name: 'Mumbai Harbor Sentinel', lat: 18.9220, lng: 72.8347, waveHeight: 1.4, waterTemp: 28.2, windSpeed: 12.5, batteryPct: 98, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-02', name: 'Bandra Coastal Gateway', lat: 19.0544, lng: 72.8180, waveHeight: 2.1, waterTemp: 27.9, windSpeed: 16.0, batteryPct: 94, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-03', name: 'Juhu Offshore Recon', lat: 19.1000, lng: 72.8250, waveHeight: 1.8, waterTemp: 28.4, windSpeed: 14.2, batteryPct: 91, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-04', name: 'Alibaug Deep Channel', lat: 18.6414, lng: 72.8722, waveHeight: 2.8, waterTemp: 27.5, windSpeed: 21.0, batteryPct: 88, status: 'Advisory'),
      BuoyTelemetry(id: 'BUOY-05', name: 'Versova Marine Watch', lat: 19.1350, lng: 72.8100, waveHeight: 1.5, waterTemp: 28.1, windSpeed: 11.8, batteryPct: 96, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-06', name: 'Chennai Harbor Sentinel', lat: 13.0827, lng: 80.2707, waveHeight: 1.9, waterTemp: 29.0, windSpeed: 15.0, batteryPct: 95, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-07', name: 'Kolkata Port Watch', lat: 22.5726, lng: 88.3639, waveHeight: 1.1, waterTemp: 28.8, windSpeed: 9.5, batteryPct: 99, status: 'Optimal'),
      BuoyTelemetry(id: 'BUOY-08', name: 'Florida Keys Sentinel', lat: 24.5551, lng: -81.7800, waveHeight: 1.6, waterTemp: 26.5, windSpeed: 13.0, batteryPct: 97, status: 'Optimal'),
    ];
  }

  // AIS Marine Vessels Live/Mock Data
  static List<AISVessel> getAISVessels() {
    return [
      AISVessel(mmsi: '419001234', name: 'MV Arabian Explorer', type: 'Container Ship', lat: 18.9350, lng: 72.8450, speed: 14.2, heading: 240, status: 'Underway'),
      AISVessel(mmsi: '419005678', name: 'INS Sentinel Patrol 04', type: 'Coast Guard Patrol', lat: 19.0200, lng: 72.7800, speed: 22.5, heading: 180, status: 'Active Recon'),
      AISVessel(mmsi: '419009988', name: 'Tug Ocean Titan', type: 'Tug & Salvage', lat: 18.8900, lng: 72.8100, speed: 6.8, heading: 045, status: 'Towing'),
      AISVessel(mmsi: '419004455', name: 'Pacific Coral Research', type: 'Marine Survey', lat: 18.9800, lng: 72.7500, speed: 8.0, heading: 310, status: 'Surveying'),
    ];
  }

  static List<Report> _getOfflineFallbackReports() {
    return [
      Report(
        id: 1,
        title: 'Chemical Sheen Detected near Gateway Port',
        category: 'Pollution',
        severity: 'Critical',
        latitude: 18.9220,
        longitude: 72.8347,
        description: 'Dark iridescent petroleum slick observed moving northwest with tidal surge.',
        status: 'Investigating',
        createdAt: '2026-09-26 18:30',
      ),
      Report(
        id: 2,
        title: 'Uncharted Submerged Metal Debris',
        category: 'Navigational Hazard',
        severity: 'High',
        latitude: 19.0544,
        longitude: 72.8180,
        description: 'Trawler sonar reported high metallic echo 1.2nm off Bandra shipping lane.',
        status: 'Verified',
        createdAt: '2026-09-26 19:15',
      ),
      Report(
        id: 3,
        title: 'Tidal Surge Warning - Versova Low Ground',
        category: 'Tsunami/Surge',
        severity: 'Moderate',
        latitude: 19.1350,
        longitude: 72.8100,
        description: 'High swell approaching beach revetment at spring tide.',
        status: 'Monitoring',
        createdAt: '2026-09-26 20:00',
      ),
    ];
  }
}
