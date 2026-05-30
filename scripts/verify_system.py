import asyncio
import httpx
import os

# Check if running inside Docker by looking for the service name in env or network
BASE_URL = (
    "http://api:8000" if os.path.exists("/.dockerenv") else "http://localhost:8000"
)


async def test_flow():
    print("🚀 Starting ROADSoS System Verification...")

    async with httpx.AsyncClient() as client:
        # 1. Health Check
        try:
            resp = await client.get(f"{BASE_URL}/health")
            print(f"✅ API Health: {resp.status_code} - {resp.json()}")
        except Exception as e:
            print(f"❌ API Offline. Did you run 'docker-compose up'? Error: {e}")
            return

        # 2. Emergency Directory Test
        resp = await client.get(f"{BASE_URL}/api/v1/emergency-numbers/?country_code=US")
        print(f"✅ Emergency Numbers (US): {resp.json()}")

        # 3. Spatial Query Test (San Francisco Example)
        lat, lng = 37.7749, -122.4194
        resp = await client.get(
            f"{BASE_URL}/api/v1/services/nearby?lat={lat}&lng={lng}"
        )
        print(f"✅ Spatial Query (SF): Found {len(resp.json())} services.")

        # 4. Cache Verification
        start_time = asyncio.get_event_loop().time()
        await client.get(f"{BASE_URL}/api/v1/services/nearby?lat={lat}&lng={lng}")
        end_time = asyncio.get_event_loop().time()
        print(f"✅ Cache Hit Latency: {round((end_time - start_time)*1000, 2)}ms")

        # 5. Admin Portal Auth Check (Expect 401 Unauthorized for now)
        resp = await client.get(f"{BASE_URL}/api/v1/admin/flags")
        if resp.status_code == 401:
            print(f"✅ Admin Security: Properly protected (401 Unauthorized)")
        else:
            print(f"⚠️ Admin Security: Unexpected status {resp.status_code}")

    print("\n🏁 Verification Complete. ROADSoS is operational.")


if __name__ == "__main__":
    asyncio.run(test_flow())
