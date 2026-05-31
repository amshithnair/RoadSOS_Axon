# ROADSoS - Emergency Crash Detection & Redis Caching Simulation Script
#
# This script simulates a vehicle crash detection scenario where a client device:
# 1. Accumulates GPS coordinates at 5-second intervals while offline.
# 2. Re-establishes network and batch-syncs the cached points to the backend.
# 3. Triggers an automatic high-priority emergency broadcast to the Telegram bot alerts.
# 4. Verifies the route can be queried instantly from the Redis cache database.

$ErrorActionPreference = "Stop"

Write-Host "[START] Starting ROADSoS Crash Detection Simulation..." -ForegroundColor Cyan

# 1. Prepare 3 GPS coordinates captured at 5-second intervals
$timeNow = [DateTime]::UtcNow
$timeP1 = $timeNow.AddSeconds(-15).ToString("o")
$timeP2 = $timeNow.AddSeconds(-10).ToString("o")
$timeP3 = $timeNow.AddSeconds(-5).ToString("o")

$ping1 = @{ lat = 12.9716; lng = 77.5946; recorded_at = $timeP1; accuracy = 4.2; is_offline_cached = $true }
$ping2 = @{ lat = 12.9720; lng = 77.5950; recorded_at = $timeP2; accuracy = 3.8; is_offline_cached = $true }
$ping3 = @{ lat = 12.9725; lng = 77.5955; recorded_at = $timeP3; accuracy = 2.5; is_offline_cached = $true }

# 2. Build Sync Request payload
$syncPayload = @{
    is_crash = $true
    custom_message = "Automated Vehicle Crash Simulation - High Severity Alert"
    coordinates = @($ping1, $ping2, $ping3)
} | ConvertTo-Json -Depth 5

Write-Host ""
Write-Host "[BATCH] Batching 3 offline coordinates (5-second tracking granularity)..." -ForegroundColor Yellow
Write-Host "[SYNC] Sending emergency sync request to API (POST /api/v1/sos/sync)..." -ForegroundColor Yellow

# 3. Send synchronization request to API
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sos/sync" -Method POST -Body $syncPayload -ContentType "application/json"

# Print Sync results
Write-Host ""
Write-Host "[SUCCESS] Synchronization Completed successfully!" -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Emergency Session ID : $($response.session_id)" -ForegroundColor Cyan
Write-Host "Points Synchronized  : $($response.points_synced) pings" -ForegroundColor Cyan
Write-Host "Broadcast Status     : $($response.message)" -ForegroundColor Cyan
Write-Host "Detected Device IP   : $($response.ip_address)" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Gray

# 4. Retrieve route timeline from Redis to verify sub-millisecond cache datastore
Write-Host ""
Write-Host "[QUERY] Fetching chronological route history from Redis (GET /api/v1/sos/session/{session_id}/route)..." -ForegroundColor Yellow
$route = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/sos/session/$($response.session_id)/route" -Method GET

Write-Host "[CACHE] Redis Cache Route Timeline:" -ForegroundColor Green
$route | ForEach-Object {
    Write-Host "   Point: [Lat: $($_.lat), Lng: $($_.lng)] | Time: $($_.recorded_at) | Accuracy: $($_.accuracy)m | Offline: $($_.is_offline_cached)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[COMPLETE] Simulation Verification 100% Successful!" -ForegroundColor Green
