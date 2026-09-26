import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../services/api_service.dart';
import '../widgets/tactical_app_bar.dart';

class CopilotScreen extends StatefulWidget {
  const CopilotScreen({super.key});

  @override
  State<CopilotScreen> createState() => _CopilotScreenState();
}

class _CopilotScreenState extends State<CopilotScreen> {
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  final List<Map<String, String>> _messages = [
    {
      'sender': 'copilot',
      'text': 'AQUASHIELD COPILOT ONLINE // Integrated with Global Maritime Satellite Mesh. How can I assist your sector operations today?',
    },
  ];

  Future<void> _sendMessage([String? quickText]) async {
    final text = quickText ?? _msgController.text.trim();
    if (text.isEmpty) return;

    if (quickText == null) {
      _msgController.clear();
    }

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _isLoading = true;
    });

    _scrollToBottom();

    final reply = await ApiService.askCopilot(text);

    if (mounted) {
      setState(() {
        _messages.add({'sender': 'copilot', 'text': reply});
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const TacticalAppBar(
        title: 'Maritime Copilot',
        subtitle: 'TACTICAL DISPATCH & THREAT RESPONSE ADVISORY',
      ),
      body: Column(
        children: [
          // Suggested Action Pills
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(bottom: BorderSide(color: AppColors.borderDefault)),
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _quickActionPill('Current Sea State in Mumbai Harbor'),
                  _quickActionPill('Deploy Oil Spill Containment Boom'),
                  _quickActionPill('Safe High-Ground Evacuation Zones'),
                  _quickActionPill('Vessel SOS Emergency Checklist'),
                ],
              ),
            ),
          ),

          // Message Thread
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(14),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isCopilot = msg['sender'] == 'copilot';

                return Align(
                  alignment: isCopilot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    padding: const EdgeInsets.all(12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isCopilot ? AppColors.surface : AppColors.amberPrimary,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isCopilot ? AppColors.borderDefault : AppColors.amberDark),
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(
                        fontSize: 13,
                        color: isCopilot ? AppColors.textPrimary : AppColors.background,
                        fontWeight: isCopilot ? FontWeight.normal : FontWeight.w600,
                        height: 1.4,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text(
                'AQUASHIELD COPILOT COMPUTING TACTICAL RESPONSE...',
                style: TextStyle(fontSize: 10, color: AppColors.amberPrimary, fontFamily: 'monospace', fontWeight: FontWeight.bold),
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.borderDefault)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      hintText: 'Enter tactical maritime prompt...',
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send_rounded, color: AppColors.amberPrimary),
                  onPressed: () => _sendMessage(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickActionPill(String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        backgroundColor: AppColors.surfaceElevated,
        side: const BorderSide(color: AppColors.borderDefault),
        label: Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        onPressed: () => _sendMessage(label),
      ),
    );
  }
}
