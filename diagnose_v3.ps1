$ServerIP = "110.42.143.48"
$User = "ubuntu"
$KeyPath = "C:\Users\10124\.ssh\id_rsa"

# Upload diagnose_v3.sh
Write-Host "Uploading diagnose_v3 script..."
scp -i $KeyPath -o StrictHostKeyChecking=no diagnose_v3.sh ${User}@${ServerIP}:/tmp/

# Execute
Write-Host "Executing diagnosis v3..."
ssh -i $KeyPath -o StrictHostKeyChecking=no ${User}@${ServerIP} "sed -i 's/\r$//' /tmp/diagnose_v3.sh && chmod +x /tmp/diagnose_v3.sh && /tmp/diagnose_v3.sh"
