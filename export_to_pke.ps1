# Trà Tâm Sen – Export landing page sang file .pke (ZIP Page Kit Export)
# Chạy: powershell -ExecutionPolicy Bypass -File export_to_pke.ps1

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Staging = Join-Path $Root ".pke_staging"
$OutPke = Join-Path $Root "tra_tam_sen_landing.pke"
$OutPkl = Join-Path $Root "tra_tam_sen_landing.pkl"

function Remove-DirSafe($path) {
  if (Test-Path $path) { Remove-Item -LiteralPath $path -Recurse -Force }
}

Remove-DirSafe $Staging
New-Item -ItemType Directory -Path $Staging | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Staging "css") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Staging "js") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Staging "images") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Staging "sections") | Out-Null

# Copy core files
Copy-Item -LiteralPath (Join-Path $Root "index.html") -Destination (Join-Path $Staging "index.html")
Copy-Item -LiteralPath (Join-Path $Root "css\styles.css") -Destination (Join-Path $Staging "css\styles.css")
Copy-Item -LiteralPath (Join-Path $Root "js\main.js") -Destination (Join-Path $Staging "js\main.js")

Get-ChildItem -LiteralPath $Root -Filter "tam_sen_*.png" | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $Staging "images\$($_.Name)")
}

$html = Get-Content -LiteralPath (Join-Path $Root "index.html") -Raw -Encoding UTF8
$css = Get-Content -LiteralPath (Join-Path $Root "css\styles.css") -Raw -Encoding UTF8

# Inline HTML (dán 1 khối vào Webcake HTML element)
$inline = $html -replace '<link rel="stylesheet" href="css/styles.css">', "<style>`n$css`n</style>"
$inline = $inline -replace 'src="tam_sen_', 'src="images/tam_sen_'
$inline | Set-Content -LiteralPath (Join-Path $Staging "index-inline.html") -Encoding UTF8

# Tách sections
$sectionPattern = '(?s)<!--\s*WC-SECTION:\s*([^>]+?)\s*-->\s*(<(?:section|footer|aside)[^>]*>.*?</(?:section|footer|aside)>)'
$idx = 0
$sectionMeta = @()
foreach ($m in [regex]::Matches($html, $sectionPattern)) {
  $idx++
  $label = $m.Groups[1].Value.Trim()
  $slug = ($label -replace '[^a-zA-Z0-9]+', '-').ToLower().Trim('-')
  $fileName = ('{0:D2}-{1}.html' -f $idx, $slug)
  $sectionHtml = $m.Groups[2].Value.Trim()
  $sectionHtml | Set-Content -LiteralPath (Join-Path $Staging "sections\$fileName") -Encoding UTF8
  $sectionMeta += [ordered]@{
    order = $idx
    label = $label
    file  = "sections/$fileName"
  }
}

$manifest = [ordered]@{
  format      = "webcake-page-kit-export"
  format_ext  = "pke"
  version     = 1
  brand       = "Trà Tâm Sen"
  exported_at = (Get-Date).ToUniversalTime().ToString("o")
  locale      = "vi"
  mobile_only = $true
  max_width_px = 430
  hotline     = "0916188330"
  colors      = @{
    background = "#F7F1E5"
    green      = "#4A6741"
    gold       = "#B08D57"
    wood       = "#6B4F3A"
    text       = "#1E1B18"
  }
  files       = @(
    "index.html",
    "index-inline.html",
    "css/styles.css",
    "js/main.js"
  )
  images      = @(Get-ChildItem (Join-Path $Staging "images") | ForEach-Object { "images/$($_.Name)" })
  sections    = $sectionMeta
  webcake_note = "Import: dùng index-inline.html hoặc copy từng file trong sections/ vào HTML block. Upload ảnh trong images/ lên thư viện Webcake."
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $Staging "manifest.json") -Encoding UTF8

# Build .pke (ZIP đổi đuôi – mở bằng WinRAR/7-Zip hoặc đổi .zip)
$TempZip = Join-Path $Root "tra_tam_sen_landing.zip"
if (Test-Path $TempZip) { Remove-Item -LiteralPath $TempZip -Force }
if (Test-Path $OutPke) { Remove-Item -LiteralPath $OutPke -Force }
Compress-Archive -Path (Join-Path $Staging "*") -DestinationPath $TempZip -CompressionLevel Optimal
Rename-Item -LiteralPath $TempZip -NewName ([System.IO.Path]::GetFileName($OutPke))

# Optional .pkl via Python if available
$exportPy = Join-Path $Root "export_to_pkl.py"
if (Test-Path $exportPy) {
  try {
    $null = & py -3 $exportPy 2>&1
  } catch {
    try { $null = & python3 $exportPy 2>&1 } catch { }
  }
}

Remove-DirSafe $Staging

$sizeMb = [math]::Round((Get-Item -LiteralPath $OutPke).Length / 1MB, 2)
Write-Host "Da tao: $OutPke ($sizeMb MB)"
Write-Host "  - $($sectionMeta.Count) sections"
if (Test-Path $OutPkl) { Write-Host "  - $OutPkl" }
