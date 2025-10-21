# PowerShell script to create Chrome Web Store extension .zip package
# Console Bridge v2.0.0
#
# This script creates a clean .zip file containing only the required extension files
# (excludes documentation, test files, and other non-essential files)

$ErrorActionPreference = "Stop"

Write-Host "Console Bridge v2.0.0 - Extension Packager" -ForegroundColor Cyan
Write-Host ""

# Define paths
$extensionDir = "chrome-extension-poc"
$outputZip = "console-bridge-extension-v2.0.0.zip"
$tempDir = "temp-extension-package"

# Remove old .zip if exists
if (Test-Path $outputZip) {
    Write-Host "Removing old .zip file..." -ForegroundColor Yellow
    Remove-Item $outputZip -Force
}

# Remove temp directory if exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Create temp directory
Write-Host "Creating temporary package directory..." -ForegroundColor Green
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
        Write-Host "  ✓ $file" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $file (NOT FOUND)" -ForegroundColor Red
        throw "Required file missing: $file"
    }
}

# Copy icons directory
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
        Write-Host "  ✓ icons/$icon" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ icons/$icon (NOT FOUND)" -ForegroundColor Red
        throw "Required icon missing: $icon"
    }
}

# Create .zip file
Write-Host ""
Write-Host "Creating .zip package..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force

# Cleanup temp directory
Write-Host "Cleaning up..." -ForegroundColor Green
Remove-Item $tempDir -Recurse -Force

# Verify .zip was created
if (Test-Path $outputZip) {
    $zipSize = (Get-Item $outputZip).Length
    $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
    $zipSizeKB = [math]::Round($zipSize / 1KB, 0)

    Write-Host ""
    Write-Host "Extension package created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Package Details:" -ForegroundColor Cyan
    Write-Host "  File: $outputZip" -ForegroundColor White
    Write-Host "  Size: $zipSizeKB KB" -ForegroundColor White
    Write-Host "  Chrome Web Store limit: 100 MB total" -ForegroundColor Gray

    if ($zipSize -gt 100000000) {
        Write-Host ""
        Write-Host "WARNING: Package exceeds Chrome Web Store 100MB limit!" -ForegroundColor Red
    } else {
        Write-Host "  Status: Within Chrome Web Store size limits" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Package Contents:" -ForegroundColor Cyan
    Write-Host "  - manifest.json (version 2.0.0)" -ForegroundColor White
    Write-Host "  - devtools.html" -ForegroundColor White
    Write-Host "  - devtools.js" -ForegroundColor White
    Write-Host "  - panel.html" -ForegroundColor White
    Write-Host "  - panel.js" -ForegroundColor White
    Write-Host "  - icons/icon16.png" -ForegroundColor White
    Write-Host "  - icons/icon48.png" -ForegroundColor White
    Write-Host "  - icons/icon128.png" -ForegroundColor White

    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to Chrome Web Store Developer Dashboard" -ForegroundColor White
    Write-Host "     https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
    Write-Host "  2. Click New Item" -ForegroundColor White
    Write-Host "  3. Upload: $outputZip" -ForegroundColor White
    Write-Host "  4. Fill out store listing and submit for review" -ForegroundColor White
    Write-Host ""

} else {
    Write-Host ""
    Write-Host "Error: Failed to create .zip package" -ForegroundColor Red
    exit 1
}
