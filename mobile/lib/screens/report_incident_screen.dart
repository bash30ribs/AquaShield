import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../models/report.dart';
import '../widgets/tactical_app_bar.dart';

class ReportIncidentScreen extends StatefulWidget {
  const ReportIncidentScreen({super.key});

  @override
  State<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends State<ReportIncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _latController = TextEditingController(text: '18.9600');
  final TextEditingController _lngController = TextEditingController(text: '72.8200');

  String _category = 'Pollution';
  String _severity = 'High';
  bool _isSubmitting = false;

  final List<String> _categories = [
    'Pollution',
    'Navigational Hazard',
    'Tsunami/Surge',
    'Vessel Distress',
    'Illegal Fishing',
    'Submerged Obstacle',
  ];

  final List<String> _severities = ['Low', 'Moderate', 'High', 'Critical'];

  @override
  void initState() {
    super.initState();
    _fetchGPS();
  }

  Future<void> _fetchGPS() async {
    final pos = await LocationService.getCurrentPosition();
    if (pos != null && mounted) {
      setState(() {
        _latController.text = pos.latitude.toStringAsFixed(5);
        _lngController.text = pos.longitude.toStringAsFixed(5);
      });
    }
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final report = Report(
      id: DateTime.now().millisecondsSinceEpoch,
      title: _titleController.text.trim(),
      category: _category,
      severity: _severity,
      latitude: double.tryParse(_latController.text) ?? 18.9600,
      longitude: double.tryParse(_lngController.text) ?? 72.8200,
      description: _descController.text.trim(),
      status: 'Active',
      createdAt: DateTime.now().toString().substring(0, 16),
    );

    final success = await ApiService.submitReport(report);

    if (mounted) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: success ? AppColors.radarEmerald : AppColors.amberPrimary,
          content: Text(
            success ? '✅ Incident Report Logged to Global Tactical Grid' : '📡 Report Cached Offline for Auto-Sync',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
      );
      if (success) {
        _titleController.clear();
        _descController.clear();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const TacticalAppBar(
        title: 'File Incident Report',
        subtitle: 'PRECISION GPS · SATELLITE TELEMETRY LOG',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Incident Title
              const Text('INCIDENT TITLE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted, fontFamily: 'monospace')),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(hintText: 'e.g. Chemical Slick 2nm off Bandra Port'),
                validator: (v) => v == null || v.isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 16),

              // Category Selector
              const Text('HAZARD CATEGORY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted, fontFamily: 'monospace')),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceElevated,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderDefault),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _category,
                    isExpanded: true,
                    dropdownColor: AppColors.surfaceElevated,
                    items: _categories.map((cat) {
                      return DropdownMenuItem(value: cat, child: Text(cat, style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _category = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Severity Level Chips
              const Text('SEVERITY ASSESSMENT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted, fontFamily: 'monospace')),
              const SizedBox(height: 8),
              Row(
                children: _severities.map((sev) {
                  final isSel = _severity == sev;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _severity = sev),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSel ? AppColors.amberPrimary : AppColors.surfaceElevated,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: isSel ? AppColors.amberPrimary : AppColors.borderDefault),
                        ),
                        child: Text(
                          sev.toUpperCase(),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isSel ? AppColors.background : AppColors.textSecondary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Coordinates Input
              const Text('INCIDENT GEOLOCATION (LAT / LNG)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted, fontFamily: 'monospace')),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _latController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Latitude (N/S)'),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _lngController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(labelText: 'Longitude (E/W)'),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.my_location, color: AppColors.amberPrimary),
                    tooltip: 'Get Live GPS',
                    onPressed: _fetchGPS,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Description
              const Text('TACTICAL SITUATION LOG', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted, fontFamily: 'monospace')),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(hintText: 'Provide detailed nautical observations, wave height, estimated drift rate, vessel markings, or containment status...'),
                validator: (v) => v == null || v.isEmpty ? 'Description is required' : null,
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitReport,
                  icon: _isSubmitting
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background))
                      : const Icon(Icons.send_rounded, size: 18),
                  label: Text(_isSubmitting ? 'TRANSMITTING TELEMETRY...' : 'LOG INCIDENT TO TACTICAL GRID'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
