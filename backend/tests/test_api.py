import os
import sys
import unittest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import init_db

class TestAquaShieldAPI(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        await init_db()
        self.transport = ASGITransport(app=app)

    async def test_health_check(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res = await client.get("/api/health")
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json().get("status"), "operational")

    async def test_auth_token_and_me(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res = await client.post("/api/auth/token", data={"username": "commander@aquashield.marine", "password": "Sentinel@2026"})
            self.assertEqual(res.status_code, 200)
            token = res.json()["access_token"]
            self.assertTrue(token)

            res_me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            self.assertEqual(res_me.status_code, 200)
            self.assertEqual(res_me.json().get("role"), "authority")

    async def test_admin_endpoints(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res = await client.get("/api/admin/overview")
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json().get("status"), "operational")

            res_stats = await client.get("/api/admin/stats")
            self.assertEqual(res_stats.status_code, 200)
            self.assertIn("reports", res_stats.json().get("kpi", {}))

            res_audit = await client.get("/api/admin/audit-log")
            self.assertEqual(res_audit.status_code, 200)
            self.assertIn("logs", res_audit.json())

    async def test_threat_scan_endpoint(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res = await client.post("/api/threat-scan", json={"image": "data:image/jpeg;base64,mock"})
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("class", data)
            self.assertIn("confidence", data)
            self.assertIn("actions", data)

    async def test_geojson_endpoints(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res_rep = await client.get("/api/reports/geojson")
            self.assertEqual(res_rep.status_code, 200)
            self.assertEqual(res_rep.json().get("type"), "FeatureCollection")

            res_dis = await client.get("/api/disasters/geojson")
            self.assertEqual(res_dis.status_code, 200)
            self.assertEqual(res_dis.json().get("type"), "FeatureCollection")

    async def test_sos_lifecycle(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            # Trigger
            res = await client.post("/api/sos", json={
                "latitude": 18.940,
                "longitude": 72.825,
                "type": "Tsunami Surge",
                "message": "Water receding rapidly at Girgaon Chowpatty",
                "emergency_type": "distress"
            })
            self.assertIn(res.status_code, [200, 201])
            sos_id = res.json().get("sos_id")
            self.assertTrue(sos_id)

            # Dispatch
            res_disp = await client.post(f"/api/sos/{sos_id}/dispatch", json={"cutter_name": "ICGS Varad"})
            self.assertEqual(res_disp.status_code, 200)

            # Resolve
            res_res = await client.post(f"/api/sos/{sos_id}/resolve", json={"resolution_notes": "All clear"})
            self.assertEqual(res_res.status_code, 200)

            # Check logs
            res_logs = await client.get("/api/sos/logs")
            self.assertEqual(res_logs.status_code, 200)
            logs = res_logs.json().get("events", [])
            self.assertTrue(any(l["id"] == sos_id for l in logs))

    async def test_chat_scribe(self):
        async with AsyncClient(transport=self.transport, base_url="http://testserver") as client:
            res = await client.post("/api/chat", json={
                "session_id": "unittest_sess_1",
                "message": "Chemical slick reported near Harbor Gate 4 with pungent odor"
            })
            self.assertEqual(res.status_code, 200)
            self.assertIn("reply", res.json())

if __name__ == "__main__":
    unittest.main()
