# Comprueba que placa.html coincide con sus fuentes: arma una copia temporal con build.ps1 y la compara byte a byte.
# Uso: doble clic en verificar-armado.bat, o en PowerShell:  powershell -ExecutionPolicy Bypass -File verificar-armado.ps1
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$temporal = Join-Path ([IO.Path]::GetTempPath()) ('placa-verificacion-' + [Guid]::NewGuid().ToString('N') + '.html')
& (Join-Path $base 'build.ps1') -Salida $temporal *> $null
$actual = [IO.File]::ReadAllBytes((Join-Path $base 'placa.html'))
$nuevo = [IO.File]::ReadAllBytes($temporal)
Remove-Item -LiteralPath $temporal
if ($actual.Length -eq $nuevo.Length -and [Linq.Enumerable]::SequenceEqual($actual, $nuevo)) {
  Write-Host 'OK: placa.html coincide con las fuentes de src/ y base/.'
  exit 0
}
Write-Host 'DISTINTO: placa.html no coincide con sus fuentes. Rearmar con armar.bat antes de publicar.'
exit 1
