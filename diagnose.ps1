$ServerIP = "110.42.143.48"
$User = "ubuntu"
$KeyPath = "C:\Users\10124\.ssh\id_rsa"

# Upload diagnose.sh
Write-Host "Uploading diagnose script..."
scp -i $KeyPath -o StrictHostKeyChecking=no diagnose.sh ${User}@${ServerIP}:/tmp/

# Execute
Write-Host "Executing diagnosis..."
ssh -i $KeyPath -o StrictHostKeyChecking=no ${User}@${ServerIP} "sed -i 's/\r$//' /tmp/diagnose.sh && chmod +x /tmp/diagnose.sh && /tmp/diagnose.sh"
