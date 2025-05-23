# Test the chatbot API endpoint
$url = "http://localhost:7071/api/chatbot"

# Test GET request
Write-Host "Testing GET request..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
$response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Green

# Test POST request
Write-Host "`nTesting POST request..." -ForegroundColor Cyan
$body = @{
    messages = @(
        @{
            role = "user"
            content = "Hello, is this working?"
        }
    )
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
$response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Green
