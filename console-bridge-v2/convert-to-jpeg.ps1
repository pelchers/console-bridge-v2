# Convert Screenshots to JPEG for Chrome Web Store
# Chrome accepts: JPEG or 24-bit PNG (no alpha)
# JPEG is simpler and guaranteed to have no alpha channel

$ErrorActionPreference = "Stop"

Write-Host "Converting screenshots to JPEG for Chrome Web Store..." -ForegroundColor Cyan
Write-Host ""

# Add System.Drawing assembly
Add-Type -AssemblyName System.Drawing

$sourceDir = "screenshots-resized"
$outputDir = "screenshots-webstore"

# Create output directory
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Get all PNG files
$screenshots = Get-ChildItem -Path $sourceDir -Filter "*.png"

foreach ($screenshot in $screenshots) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($screenshot.Name)
    $outputFileName = "$baseName.jpg"

    Write-Host "Converting: $($screenshot.Name) -> $outputFileName" -ForegroundColor Green

    $sourcePath = $screenshot.FullName
    $outputPath = Join-Path $outputDir $outputFileName

    try {
        # Load image
        $image = [System.Drawing.Image]::FromFile($sourcePath)

        Write-Host "  Size: $($image.Width)x$($image.Height)" -ForegroundColor Gray

        # Create JPEG encoder with high quality
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, 95L
        )

        # Get JPEG codec
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq 'image/jpeg' }

        # Save as JPEG
        $image.Save($outputPath, $jpegCodec, $encoderParams)

        $image.Dispose()

        # Verify output
        $outputSize = (Get-Item $outputPath).Length
        $outputSizeKB = [math]::Round($outputSize / 1KB, 0)

        Write-Host "  Output: $outputSizeKB KB" -ForegroundColor Gray
        Write-Host "  Saved: $outputPath" -ForegroundColor Green
        Write-Host ""

    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($image) { $image.Dispose() }
        throw
    }
}

Write-Host "SUCCESS: All screenshots converted to JPEG!" -ForegroundColor Green
Write-Host ""
Write-Host "Chrome Web Store ready screenshots:" -ForegroundColor Cyan
Write-Host "  Location: $outputDir\" -ForegroundColor White
Write-Host ""
Write-Host "Files to upload:" -ForegroundColor Cyan
Get-ChildItem -Path $outputDir -Filter "*.jpg" | ForEach-Object {
    $size = (Get-Item $_.FullName).Length
    $sizeKB = [math]::Round($size / 1KB, 0)
    Write-Host "  - $($_.Name) ($sizeKB KB)" -ForegroundColor White
}
Write-Host ""
Write-Host "All files are 1280x800 JPEG (no alpha channel)" -ForegroundColor Green
Write-Host ""
