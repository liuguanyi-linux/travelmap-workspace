$ServerIP = "110.42.143.48"
$User = "ubuntu"
$KeyPath = "C:\Users\10124\.ssh\id_rsa"

# Build Frontend
Write-Host "Building Frontend..."
Push-Location frontend
try {
    # Run Vite Build directly via node to bypass execution policy
    node node_modules/vite/bin/vite.js build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    
    # Copy index.html to 200.html for SPA fallback
    if (Test-Path "dist/index.html") {
        Copy-Item "dist/index.html" -Destination "dist/200.html" -Force
    }
} catch {
    Write-Error $_
    Pop-Location
    exit 1
}
Pop-Location

# Build Backend
Write-Host "Building Backend..."
Push-Location backend
try {
    # Run Nest Build directly via node
    node node_modules/@nestjs/cli/bin/nest.js build
    if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
} catch {
    Write-Error $_
    Pop-Location
    exit 1
}
Pop-Location

# Create Backend Tarball
Write-Host "Packing Backend..."
# Pack current directory content including dist
tar -czf travelmap-backend.tar.gz -C backend --exclude node_modules --exclude .git --exclude prisma/dev.db --exclude uploads .

# Create Frontend Tarball
Write-Host "Packing Frontend..."
# Pack current directory content including dist
tar -czf travelmap-frontend.tar.gz -C frontend --exclude node_modules --exclude .git .

# Upload
Write-Host "Uploading files..."
scp -i $KeyPath -o StrictHostKeyChecking=no travelmap-backend.tar.gz travelmap-frontend.tar.gz deploy.sh ${User}@${ServerIP}:/tmp/

# Execute
Write-Host "Executing deployment..."
# Convert deploy.sh to Unix line endings on server just in case
ssh -i $KeyPath -o StrictHostKeyChecking=no ${User}@${ServerIP} "sed -i 's/\r$//' /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
