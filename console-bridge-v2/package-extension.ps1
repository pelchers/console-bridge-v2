# Console Bridge v2.0.0 - Extension Packager
# Creates a clean .zip file for Chrome Web Store submission

$ErrorActionPreference = "Stop"

Write-Host "Console Bridge v2.0.0 - Extension Packager" -ForegroundColor Cyan
Write-Host ""

# Define paths
$extensionDir = "chrome-extension-poc"
$outputZip = "console-bridge-extension-v2.0.0.zip"
$tempDir = "temp-extension-package"

# Remove old files
if (Test-Path $outputZip) {
    Write-Host "Removing old zip file..." -ForegroundColor Yellow
    Remove-Item $outputZip -Force
}

if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Create temp directory
Write-Host "Creating package directory..." -ForegroundColor Green
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy required files
Write-Host "Copying extension files..." -ForegroundColor Green

$filesToCopy = @(
    "manifest.json",
    "devtools.html",
    "devtools.js",
    "panel.html",
    "panel.js"
)

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $extensionDir $file
    $destPath = Join-Path $tempDir $file

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath
        Write-Host "  - $file" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR: $file not found" -ForegroundColor Red
        throw "Required file missing: $file"
    }
}

# Copy icons
Write-Host "Copying icons..." -ForegroundColor Green
$iconsSourceDir = Join-Path $extensionDir "icons"
$iconsDestDir = Join-Path $tempDir "icons"

New-Item -ItemType Directory -Path $iconsDestDir | Out-Null

$iconFiles = @("icon16.png", "icon48.png", "icon128.png")
foreach ($icon in $iconFiles) {
    $sourcePath = Join-Path $iconsSourceDir $icon
    $destPath = Join-Path $iconsDestDir $icon

    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath
        Write-Host "  - icons/$icon" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR: icons/$icon not found" -ForegroundColor Red
        throw "Required icon missing: $icon"
    }
}

# Create zip
Write-Host ""
Write-Host "Creating zip package..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item $tempDir -Recurse -Force

# Verify and show results
if (Test-Path $outputZip) {
    $zipSize = (Get-Item $outputZip).Length
    $zipSizeKB = [math]::Round($zipSize / 1KB, 0)

    Write-Host ""
    Write-Host "SUCCESS: Extension package created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Package Details:" -ForegroundColor Cyan
    Write-Host "  File: $outputZip" -ForegroundColor White
    Write-Host "  Size: $zipSizeKB KB" -ForegroundColor White
    Write-Host "  Limit: 100 MB" -ForegroundColor Gray

    if ($zipSize -lt 100000000) {
        Write-Host "  Status: OK (within limits)" -ForegroundColor Green
    } else {
        Write-Host "  Status: WARNING (exceeds 100MB limit)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Next: Upload to Chrome Web Store" -ForegroundColor Cyan
    Write-Host "  https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
    Write-Host ""

} else {
    Write-Host ""
    Write-Host "ERROR: Failed to create zip package" -ForegroundColor Red
    exit 1
}
