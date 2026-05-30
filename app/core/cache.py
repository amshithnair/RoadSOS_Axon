import redis.asyncio as aioredis
import os
import json
from typing import Optional

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")


class CacheManager:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self):
        self.redis = await aioredis.from_url(REDIS_URL, decode_responses=True)

    async def get_nearby(self, geohash: str, category: str):
        if not self.redis:
            await self.connect()
        key = f"geo:nearby:{geohash}:{category}"
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set_nearby(self, geohash: str, category: str, data: list, ttl: int = 300):
        if not self.redis:
            await self.connect()
        key = f"geo:nearby:{geohash}:{category}"
        await self.redis.set(key, json.dumps(data), ex=ttl)


cache = CacheManager()
