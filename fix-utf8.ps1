# Script de correction d'encodage UTF-8 simplifie
param([switch]$Apply = $false)

Write-Host "=== Correction d'encodage UTF-8 pour Railway ===" -ForegroundColor Cyan

$files = Get-ChildItem -Path "." -Recurse -Filter "*.js" -File | Where-Object { $_.FullName -notmatch "node_modules" }
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$count = 0

foreach ($file in $files) {
    try {
        # Lire le contenu avec differents encodages possibles
        $content = $null
        $encoding = $null
        
        # Essayer UTF-8 d'abord
        try {
            $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
            $content = [System.Text.Encoding]::UTF8.GetString($bytes)
            $encoding = "UTF-8"
            
            # Verifier BOM
            if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                $encoding = "UTF-8-BOM"
            }
        } catch {
            # Si UTF-8 echoue, essayer Windows-1252
            try {
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::GetEncoding(1252))
                $encoding = "Windows-1252"
            } catch {
                # En dernier recours, Default
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::Default)
                $encoding = "Default"
            }
        }
        
        if ($content -ne $null) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            
            if ($encoding -ne "UTF-8" -or $encoding -eq "UTF-8-BOM") {
                Write-Host "  $relativePath - Encodage: $encoding" -ForegroundColor Yellow
                
                if ($Apply) {
                    # Backup
                    $backupPath = "$($file.FullName).bak"
                    [System.IO.File]::Copy($file.FullName, $backupPath, $true)
                    
                    # Ecrire en UTF-8 sans BOM
                    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                    Write-Host "    [OK] Converti en UTF-8 sans BOM" -ForegroundColor Green
                    $count++
                }
            }
        }
    } catch {
        Write-Host "  [ERREUR] Erreur avec $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Resume ===" -ForegroundColor Cyan
Write-Host "Fichiers traites: $count"

if (-not $Apply) {
    Write-Host "`n[INFO] Mode TEST - Aucune modification" -ForegroundColor Yellow
    Write-Host "Executez avec -Apply pour corriger" -ForegroundColor Yellow
} else {
    # Nettoyer les backups si tout va bien
    if ($count -gt 0) {
        Write-Host "`nSuppression des backups..." -ForegroundColor Gray
        Get-ChildItem -Path "." -Recurse -Filter "*.js.bak" | Remove-Item -Force
        Write-Host "[OK] Backups supprimes" -ForegroundColor Green
    }
}
