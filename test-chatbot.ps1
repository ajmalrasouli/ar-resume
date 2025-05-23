$body = @{
    messages = @(
        @{
            role = "user"
            content = "Does Ajmal have experience in Excel?"
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/chatbot" `
        -Method Post `
        -Body $body `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
} 
catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorResponse = $reader.ReadToEnd()
    $reader.Dispose()
    
    Write-Host "Error Response: $errorResponse" -ForegroundColor Red
}
