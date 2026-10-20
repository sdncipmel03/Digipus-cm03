@echo off
title Digipus - Server Wi-Fi Sekolah SDN Cipinang Melayu 03 Pagi
color 1F

echo =========================================================================
echo    DIGIPUS - SDN CIPINANG MELAYU 03 PAGI (SERVER JARINGAN LOKAL)
echo =========================================================================
echo.
echo Sedang mendeteksi Alamat IP Komputer Anda di Jaringan Wi-Fi Sekolah...
echo.

set IP_ADDRESS=127.0.0.1
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set IP_ADDRESS=%%a
)

echo -------------------------------------------------------------------------
echo ALAMAT UNTUK KOMPUTER LAIN (GURU / SISWA / LAB):
echo.
echo Buka browser di komputer lain yang terhubung ke Wi-Fi yang sama, lalu ketik:
echo.
echo      http://%IP_ADDRESS%:8080/
echo.
echo -------------------------------------------------------------------------
echo Tekan Ctrl+C untuk menghentikan server jika sudah selesai.
echo =========================================================================
echo.

cd /d "%~dp0frontend"

:: Menjalankan Mini HTTP Server bawaan PowerShell (Tanpa perlu install aplikasi luar)
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$port = 8080; $root = Get-Location; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://*:' + $port + '/'); try { $listener.Start() } catch { Write-Host 'Memerlukan izin Admin atau port 8080 sedang digunakan. Mencoba port 8888...'; $port = 8888; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://*:' + $port + '/'); $listener.Start() }; Write-Host ('Server aktif di http://' + '%IP_ADDRESS%' + ':' + $port + '/'); Start-Process ('http://localhost:' + $port); while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $rawPath = $request.Url.LocalPath.TrimStart('/'); if ([string]::IsNullOrEmpty($rawPath)) { $rawPath = 'index.html' }; $filePath = Join-Path $root $rawPath; if (Test-Path $filePath -PathType Leaf) { $bytes = [System.IO.File]::ReadAllBytes($filePath); $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); $contentType = 'text/html'; switch ($ext) { '.css' { $contentType = 'text/css' } '.js' { $contentType = 'application/javascript' } '.png' { $contentType = 'image/png' } '.jpg' { $contentType = 'image/jpeg' } '.pdf' { $contentType = 'application/pdf' } '.json' { $contentType = 'application/json' } }; $response.ContentType = $contentType; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length) } else { $response.StatusCode = 404; $buffer = [System.Text.Encoding]::UTF8.GetBytes('File tidak ditemukan'); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length) }; $response.OutputStream.Close() }"

pause
