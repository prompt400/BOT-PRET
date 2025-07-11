# Script de correction d'encodage UTF-8 professionnel
# Garantit que tous les fichiers JS sont en UTF-8 sans BOM pour Railway/Nixpacks

param(
    [string]$Path = ".",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$problematicFiles = @()
$fixedFiles = @()
$totalFiles = 0

Write-Host "=== Correction d'encodage UTF-8 pour Railway ===" -ForegroundColor Cyan
Write-Host "Recherche dans: $((Get-Location).Path)" -ForegroundColor Gray

# Fonction pour détecter l'encodage
function Get-FileEncoding {
    param([string]$FilePath)
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        
        # Vérifier BOM UTF-8
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            return @{ Encoding = "UTF-8-BOM"; HasBOM = $true }
        }
        
        # Vérifier BOM UTF-16 LE
        if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            return @{ Encoding = "UTF-16LE"; HasBOM = $true }
        }
        
        # Vérifier BOM UTF-16 BE
        if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
            return @{ Encoding = "UTF-16BE"; HasBOM = $true }
        }
        
        # Tenter de détecter UTF-8 sans BOM
        try {
            $utf8 = [System.Text.Encoding]::UTF8
            $text = $utf8.GetString($bytes)
            $reencoded = $utf8.GetBytes($text)
            
            if ($bytes.Length -eq $reencoded.Length) {
                $isUtf8 = $true
                for ($i = 0; $i -lt $bytes.Length; $i++) {
                    if ($bytes[$i] -ne $reencoded[$i]) {
                        $isUtf8 = $false
                        break
                    }
                }
                if ($isUtf8) {
                    return @{ Encoding = "UTF-8"; HasBOM = $false }
                }
            }
        } catch {
            # Pas UTF-8 valide
        }
        
        # Si pas UTF-8, probablement Windows-1252 ou ISO-8859-1
        return @{ Encoding = "Windows-1252"; HasBOM = $false }
        
    } catch {
        return @{ Encoding = "Unknown"; HasBOM = $false; Error = $_.Exception.Message }
    }
}

# Fonction pour convertir un fichier en UTF-8 sans BOM
function Convert-ToUtf8NoBom {
    param(
        [string]$FilePath,
        [string]$CurrentEncoding
    )
    
    try {
        $content = $null
        
        switch ($CurrentEncoding) {
            "UTF-8-BOM" {
                # Lire avec UTF-8 et réécrire sans BOM
                $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
            }
            "UTF-8" {
                # Déjà en UTF-8 sans BOM, juste vérifier
                $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
            }
            "Windows-1252" {
                # Convertir de Windows-1252 à UTF-8
                $encoding = [System.Text.Encoding]::GetEncoding(1252)
                $content = [System.IO.File]::ReadAllText($FilePath, $encoding)
            }
            "UTF-16LE" {
                $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::Unicode)
            }
            "UTF-16BE" {
                $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::BigEndianUnicode)
            }
            default {
                # Essayer avec l'encodage par défaut du système
                $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::Default)
            }
        }
        
        if ($content -ne $null) {
            # Créer une sauvegarde
            $backupPath = "$FilePath.bak"
            if (-not $DryRun) {
                [System.IO.File]::Copy($FilePath, $backupPath, $true)
            }
            
            # Écrire en UTF-8 sans BOM
            if (-not $DryRun) {
                [System.IO.File]::WriteAllText($FilePath, $content, $utf8NoBom)
            }
            
            return $true
        }
        
        return $false
        
    } catch {
        Write-Host "  Erreur lors de la conversion: $_" -ForegroundColor Red
        return $false
    }
}

# Parcourir tous les fichiers JS
$files = Get-ChildItem -Path $Path -Recurse -Filter "*.js" -File | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $totalFiles++
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    if ($Verbose) {
        Write-Host "`nAnalyse: $relativePath" -ForegroundColor Gray
    }
    
    $encoding = Get-FileEncoding -FilePath $file.FullName
    
    if ($encoding.Error) {
        Write-Host "  ❌ Erreur de lecture: $($encoding.Error)" -ForegroundColor Red
        $problematicFiles += @{
            Path = $relativePath
            Issue = "Erreur de lecture"
            Details = $encoding.Error
        }
        continue
    }
    
    # Vérifier si le fichier nécessite une conversion
    $needsConversion = $false
    $reason = ""
    
    if ($encoding.HasBOM) {
        $needsConversion = $true
        $reason = "Contient un BOM"
    } elseif ($encoding.Encoding -ne "UTF-8") {
        $needsConversion = $true
        $reason = "Encodage: $($encoding.Encoding)"
    }
    
    if ($needsConversion) {
        Write-Host "  ⚠️  $relativePath - $reason" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            $success = Convert-ToUtf8NoBom -FilePath $file.FullName -CurrentEncoding $encoding.Encoding
            
            if ($success) {
                Write-Host "  ✅ Converti en UTF-8 sans BOM" -ForegroundColor Green
                $fixedFiles += $relativePath
            } else {
                Write-Host "  ❌ Échec de la conversion" -ForegroundColor Red
                $problematicFiles += @{
                    Path = $relativePath
                    Issue = "Échec de conversion"
                    Details = $reason
                }
            }
        } else {
            Write-Host "  🔄 [DRY RUN] Serait converti en UTF-8 sans BOM" -ForegroundColor Cyan
        }
    } elseif ($Verbose) {
        Write-Host "  ✓ Déjà en UTF-8 sans BOM" -ForegroundColor DarkGreen
    }
}

# Résumé
Write-Host "`n=== Résumé ===" -ForegroundColor Cyan
Write-Host "Total de fichiers analysés: $totalFiles"
Write-Host "Fichiers corrigés: $($fixedFiles.Count)" -ForegroundColor Green
Write-Host "Fichiers problématiques: $($problematicFiles.Count)" -ForegroundColor $(if ($problematicFiles.Count -gt 0) { "Red" } else { "Green" })

if ($fixedFiles.Count -gt 0) {
    Write-Host "`nFichiers corrigés:" -ForegroundColor Green
    $fixedFiles | ForEach-Object { Write-Host "  - $_" }
}

if ($problematicFiles.Count -gt 0) {
    Write-Host "`nFichiers problématiques:" -ForegroundColor Red
    $problematicFiles | ForEach-Object {
        Write-Host "  - $($_.Path): $($_.Issue)" -ForegroundColor Red
        if ($_.Details) {
            Write-Host "    Détails: $($_.Details)" -ForegroundColor DarkRed
        }
    }
}

if ($DryRun) {
    Write-Host "`n📌 Mode DRY RUN - Aucune modification effectuée" -ForegroundColor Yellow
    Write-Host "Exécutez sans -DryRun pour appliquer les corrections" -ForegroundColor Yellow
}

# Nettoyer les fichiers de sauvegarde si tout s'est bien passé
if (-not $DryRun -and $problematicFiles.Count -eq 0 -and $fixedFiles.Count -gt 0) {
    Write-Host "`nNettoyage des fichiers de sauvegarde..." -ForegroundColor Gray
    Get-ChildItem -Path $Path -Recurse -Filter "*.js.bak" | Remove-Item -Force
    Write-Host "✅ Fichiers de sauvegarde supprimés" -ForegroundColor Green
}
