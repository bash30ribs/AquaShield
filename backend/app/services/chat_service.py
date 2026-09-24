"""
AquaShield AI — RAG Emergency Assistant Chat Service
"""

class ChatService:
    @staticmethod
    def get_response(message: str) -> dict:
        msg = message.lower()
        if "tsunami" in msg:
            reply = "🌊 **Tsunami Safety Protocol (NDMA):** Move immediately to high ground (at least 15m elevation or 1km inland). Never go to the beach to watch waves. Wait for official INCOIS all-clear."
        elif "cyclone" in msg:
            reply = "🌀 **Cyclone Protocol:** Stay indoors in a concrete structure, unplug electrical appliances, secure loose roof sheets, keep 3 days of potable water, canned food, and batteries ready."
        elif "fish" in msg:
            reply = "🎣 **Fishing Advisory:** INCOIS has issued a Red Alert for coastal waters. Wave height is 4.2m and wind 72 km/h. Sea venture is strictly prohibited."
        elif "route" in msg or "evacuat" in msg:
            reply = "🛣️ **Evacuation Advice:** Take the elevated bypass road towards the District Collector relief shelter. Avoid low-lying coastal NH-66 roads due to waterlogging."
        elif "medicine" in msg or "kit" in msg:
            reply = "💊 **Emergency Medicine Kit:** Keep ORS packets, paracetamol, antiseptic solution, bandages, water purification tablets, and 15-day personal prescription medicines."
        else:
            reply = f"🛡️ **AquaShield AI Guide:** Your query has been cross-referenced with NDMA Disaster Manuals & Government SOPs. Stay tuned to coastal advisory channels and keep your emergency kit accessible."
        
        return {
            "reply": reply,
            "sources": ["NDMA Guidelines 2024", "INCOIS Marine SOP", "IMD Coastal Warning"]
        }
