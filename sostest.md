# 🚨 ROADSoS — Telegram Bot SOS Testing Guide

ROADSoS now broadcasts emergency SOS alerts directly through **Telegram Bots** in beautiful rich HTML format with maps integration. This is 100% free, unlimited, and highly reliable.

---

## 🏗 Prerequisites

1. **Docker containers running:**
   ```bash
   docker-compose up -d
   ```
2. **API is healthy:**
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status": "healthy"}
   ```

---

## 🛠 Step-by-Step Setup: Create Your Bot & Chat IDs

To test the integration, you need:
1. A **Telegram Bot Token**
2. A **Telegram Chat ID** (your personal chat ID or a group/channel ID)

### Step 1: Create a Bot via `@BotFather`
1. Open Telegram, search for `@BotFather`, and start a conversation.
2. Send the command: `/newbot`
3. Follow the prompts to name your bot and choose a username (e.g. `MyRoadSosAlertBot`).
4. `@BotFather` will give you a **HTTP API Token** (Format: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`). This is your `TELEGRAM_BOT_TOKEN`.

### Step 2: Start a Chat with Your Bot
Bots cannot message users out of the blue. You **MUST** start a conversation first:
1. Search for your bot's username in Telegram.
2. Click **Start** or send any message (e.g., `Hello`).

### Step 3: Find Your Telegram Chat ID
To get your unique numerical Chat ID:
1. Search for `@userinfobot` on Telegram.
2. Start the bot. It will instantly reply with your `Id` (e.g., `987654321`). This is your Chat ID.

---

## ⚙ Configuring Your Environment

1. Open your `.env` file in the project root.
2. Add/update the following environment variables:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
   TELEGRAM_DEFAULT_CHAT_ID=987654321
   ```
3. Restart the API container to reload settings:
   ```bash
   docker-compose restart api
   ```

---

## 🧪 Test 1: Check Bot Status

This endpoint calls Telegram's `getMe` to verify your `TELEGRAM_BOT_TOKEN` is working.

```bash
curl http://localhost:8000/api/v1/sos/bot-status
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sos/bot-status"
```

**Expected Response (Token Valid):**
```json
{
  "valid": true,
  "bot_username": "MyRoadSosAlertBot",
  "error": null
}
```

---

## 🧪 Test 2: Send SOS Broadcast (Dynamic Target Chats)

You can send to multiple targets in a single request. Targets can be numerical User/Chat IDs or public Channel handles (e.g. `@my_sos_channel`).

```bash
curl -X POST http://localhost:8000/api/v1/sos/ \
  -H "Content-Type: application/json" \
  -d '{
    "chat_ids": ["987654321"],
    "lat": 12.9716,
    "lng": 77.5946,
    "custom_message": "Flat tire emergency on MG Road, Bangalore!"
  }'
```

**PowerShell:**
```powershell
$body = @{
    chat_ids = @("987654321")
    lat = 12.9716
    lng = 77.5946
    custom_message = "Flat tire emergency on MG Road, Bangalore!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sos/" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SOS alert successfully broadcast to 1/1 target chats.",
  "results": [
    {
      "chat_id": "987654321",
      "success": true,
      "error": null,
      "message_id": 142
    }
  ]
}
```

---

## 🧪 Test 3: Send SOS (Default Fallback Chat)

If you omit the `"chat_ids"` key or pass an empty list, the API will automatically use the `TELEGRAM_DEFAULT_CHAT_ID` set in your `.env`.

```bash
curl -X POST http://localhost:8000/api/v1/sos/ \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 37.7749,
    "lng": -122.4194,
    "custom_message": "Broadcast using default channel fallback"
  }'
```

**PowerShell:**
```powershell
$body = @{
    lat = 37.7749
    lng = -122.4194
    custom_message = "Broadcast using default channel fallback"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sos/" -Method POST -Body $body -ContentType "application/json"
```

---

## 📱 Interactive Testing with Swagger UI

The easiest way to perform visual manual testing:

1. Open your browser and navigate to: **[http://localhost:8000/docs](http://localhost:8000/docs)**
2. Find the **`sos`** tag group.
3. Click on the endpoint `POST /api/v1/sos/` -> "Try it out".
4. Enter coordinates and custom details, then click **Execute**!
5. Check your Telegram app instantly!

---

## 💡 Troubleshooting

| Error / Issue | Probable Cause | Resolution |
|---|---|---|
| **`400: chat not found`** | You haven't started a chat with the bot yet, or the ID is wrong. | Go to your bot in Telegram and click **Start**, then send a message. Check your chat ID. |
| **`401: Unauthorized`** | The `TELEGRAM_BOT_TOKEN` in `.env` is incorrect or expired. | Double check your token string from `@BotFather` and verify there are no surrounding quotes or whitespace in `.env`. |
| **`500: TELEGRAM_BOT_TOKEN is not configured`** | Environment settings were not loaded properly. | Verify `.env` exists in the project root and restart using `docker-compose restart api`. |
| **No Message Delivered** | The endpoint returned success but no Telegram message arrived. | Check if the message is in another folder (e.g. if sending to a group or channel, check your admin permissions there). |
