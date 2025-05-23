# This script will help you set up your local.settings.json file
$localSettingsPath = "h:\ar-resume\api\local.settings.json"

# Check if local.settings.json already exists
if (Test-Path $localSettingsPath) {
    Write-Host "local.settings.json already exists at $localSettingsPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "Exiting without making changes." -ForegroundColor Yellow
        exit 0
    }
}

# Get OpenAI API key
$openaiKey = Read-Host "Enter your OpenAI API key"

# Create the settings object
$settings = @{
    IsEncrypted = $false
    Values = @{
        AzureWebJobsStorage = "UseDevelopmentStorage=true"
        FUNCTIONS_WORKER_RUNTIME = "node"
        NODE_ENV = "development"
        OPENAI_API_KEY = $openaiKey
    }
}

# Convert to JSON and save to file
$settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $localSettingsPath -Encoding utf8

Write-Host "local.settings.json has been created/updated at $localSettingsPath" -ForegroundColor Green
