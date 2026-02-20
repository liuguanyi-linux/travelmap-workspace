
$body = @{
    name = "Test Spot via PowerShell"
    city = "青岛"
    tags = @("spot")
    location = @{
        lng = 120.38
        lat = 36.06
    }
    content = "Test content"
    photos = @()
    videos = @()
    reviews = @()
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/spots" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success:"
    Write-Host ($response | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
