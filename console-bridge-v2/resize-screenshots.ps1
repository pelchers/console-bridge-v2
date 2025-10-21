# Resize Screenshots for Chrome Web Store
# Required: 1280x800, 24-bit PNG (no alpha)

$ErrorActionPreference = "Stop"

Write-Host "Resizing screenshots for Chrome Web Store..." -ForegroundColor Cyan
Write-Host ""

# Add System.Drawing assembly
Add-Type -AssemblyName System.Drawing

$sourceDir = "screenshots"
$outputDir = "screenshots-resized"

# Create output directory
if (Test-Path $outputDir) {
    Remove-Item $outputDir -Recurse -Force
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

# Target dimensions for Chrome Web Store
$targetWidth = 1280
$targetHeight = 800

# Get all PNG files
$screenshots = Get-ChildItem -Path $sourceDir -Filter "*.png"

foreach ($screenshot in $screenshots) {
    Write-Host "Processing: $($screenshot.Name)" -ForegroundColor Green

    $sourcePath = $screenshot.FullName
    $outputPath = Join-Path $outputDir $screenshot.Name

    try {
        # Load original image
        $originalImage = [System.Drawing.Image]::FromFile($sourcePath)
        $originalWidth = $originalImage.Width
        $originalHeight = $originalImage.Height

        Write-Host "  Original size: ${originalWidth}x${originalHeight}" -ForegroundColor Gray

        # Create new bitmap with target dimensions
        $resizedImage = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)

        # Create graphics object for high-quality resize
        $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Fill background with white (removes alpha channel)
        $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $graphics.FillRectangle($whiteBrush, 0, 0, $targetWidth, $targetHeight)

        # Calculate aspect ratios
        $sourceAspect = $originalWidth / $originalHeight
        $targetAspect = $targetWidth / $targetHeight

        # Calculate dimensions to fit image within target while maintaining aspect ratio
        if ($sourceAspect -gt $targetAspect) {
            # Source is wider - fit to width
            $newWidth = $targetWidth
            $newHeight = [int]($targetWidth / $sourceAspect)
            $x = 0
            $y = [int](($targetHeight - $newHeight) / 2)
        } else {
            # Source is taller - fit to height
            $newHeight = $targetHeight
            $newWidth = [int]($targetHeight * $sourceAspect)
            $x = [int](($targetWidth - $newWidth) / 2)
            $y = 0
        }

        # Draw resized image centered on white background
        $destRect = New-Object System.Drawing.Rectangle($x, $y, $newWidth, $newHeight)
        $srcRect = New-Object System.Drawing.Rectangle(0, 0, $originalWidth, $originalHeight)

        $graphics.DrawImage($originalImage, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

        # Save as 24-bit PNG (no alpha)
        $resizedImage.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

        # Cleanup
        $graphics.Dispose()
        $resizedImage.Dispose()
        $originalImage.Dispose()
        $whiteBrush.Dispose()

        # Verify output
        $outputSize = (Get-Item $outputPath).Length
        $outputSizeKB = [math]::Round($outputSize / 1KB, 0)

        Write-Host "  Resized to: ${targetWidth}x${targetHeight}" -ForegroundColor Gray
        Write-Host "  Output size: $outputSizeKB KB" -ForegroundColor Gray
        Write-Host "  Saved: $outputPath" -ForegroundColor Green
        Write-Host ""

    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($originalImage) { $originalImage.Dispose() }
        if ($resizedImage) { $resizedImage.Dispose() }
        if ($graphics) { $graphics.Dispose() }
        throw
    }
}

Write-Host "SUCCESS: All screenshots resized!" -ForegroundColor Green
Write-Host ""
Write-Host "Resized screenshots location:" -ForegroundColor Cyan
Write-Host "  $outputDir\" -ForegroundColor White
Write-Host ""
Write-Host "Upload these to Chrome Web Store:" -ForegroundColor Cyan
Get-ChildItem -Path $outputDir -Filter "*.png" | ForEach-Object {
    $size = (Get-Item $_.FullName).Length
    $sizeKB = [math]::Round($size / 1KB, 0)
    Write-Host "  - $($_.Name) ($sizeKB KB)" -ForegroundColor White
}
Write-Host ""
