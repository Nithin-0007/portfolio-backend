$src = "c:\Users\nithi\ollama-project\backend-service\node_modules\.prisma\client\libquery_engine-rhel-openssl-3.0.x.so.node"
$dest = "c:\Users\nithi\ollama-project\backend-service\.aws-sam\build\PortfolioLambda\node_modules\.prisma\client"

New-Item -ItemType Directory -Force -Path $dest
Copy-Item -Path $src -Destination $dest -Force
Write-Host "Binary copied successfully"

# Also copy schema.prisma
$schemaSrc = "c:\Users\nithi\ollama-project\backend-service\node_modules\.prisma\client\schema.prisma"
Copy-Item -Path $schemaSrc -Destination $dest -Force
Write-Host "Schema copied successfully"
