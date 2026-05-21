# Giải nén file .pke (đổi tạm sang .zip rồi extract)
param(
  [string]$PkeFile = (Join-Path $PSScriptRoot "tra_tam_sen_landing.pke"),
  [string]$OutDir = (Join-Path $PSScriptRoot "extracted_pke")
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $PkeFile)) {
  Write-Error "Khong tim thay: $PkeFile"
}

$tempZip = [System.IO.Path]::ChangeExtension($PkeFile, ".zip")
Copy-Item -LiteralPath $PkeFile -Destination $tempZip -Force
if (Test-Path $OutDir) { Remove-Item -LiteralPath $OutDir -Recurse -Force }
Expand-Archive -LiteralPath $tempZip -DestinationPath $OutDir -Force
Remove-Item -LiteralPath $tempZip -Force
Write-Host "Da giai nen vao: $OutDir"
Get-ChildItem -LiteralPath $OutDir -Recurse | Select-Object FullName
