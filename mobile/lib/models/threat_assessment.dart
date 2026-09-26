class ThreatAssessment {
  final String threatClass;
  final double confidence;
  final String severity;
  final String description;
  final List<String> recommendedActions;

  ThreatAssessment({
    required this.threatClass,
    required this.confidence,
    required this.severity,
    required this.description,
    required this.recommendedActions,
  });

  factory ThreatAssessment.fromJson(Map<String, dynamic> json) {
    return ThreatAssessment(
      threatClass: json['class'] ?? 'Anomaly Detected',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.85,
      severity: json['severity'] ?? 'Moderate',
      description: json['description'] ?? 'Automated threat signature analysis complete.',
      recommendedActions: (json['actions'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [
        'Notify Maritime Patrol Sector',
        'Deploy containment boom',
        'Alert nearby AIS vessels',
      ],
    );
  }
}
