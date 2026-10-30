class Report {
  final int id;
  final String title;
  final String category;
  final String severity;
  final double latitude;
  final double longitude;
  final String description;
  final String? imageUrl;
  final String status;
  final String createdAt;

  Report({
    required this.id,
    required this.title,
    required this.category,
    required this.severity,
    required this.latitude,
    required this.longitude,
    required this.description,
    this.imageUrl,
    required this.status,
    required this.createdAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    final rawSeverity = json['severity'] ?? (json['urgency_rank'] != null ? (json['urgency_rank'] >= 8 ? 'Critical' : (json['urgency_rank'] >= 5 ? 'High' : 'Moderate')) : 'Medium');
    return Report(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      title: json['title'] ?? 'Incident Report',
      category: json['category'] ?? json['type'] ?? 'General',
      severity: rawSeverity.toString(),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] ?? '',
      imageUrl: json['image_url'],
      status: json['status'] ?? 'Active',
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category,
      'severity': severity,
      'latitude': latitude,
      'longitude': longitude,
      'description': description,
      'image_url': imageUrl,
      'status': status,
      'created_at': createdAt,
    };
  }
}
