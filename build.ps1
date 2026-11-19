# Arma placa.html uniendo los archivos de src/ (no necesita Python).
# Uso: doble clic en armar.bat, o en PowerShell:  powershell -ExecutionPolicy Bypass -File build.ps1
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$src  = Join-Path $base 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Leer($n) { [IO.File]::ReadAllText((Join-Path $src $n), $utf8) }
# Tabla explícita entorno -> códigos de muestra (base/entornos_muestras.csv), para los botones «Ver muestras de este entorno» del Glosario.
$entMuestras = [ordered]@{}
Import-Csv -LiteralPath (Join-Path $base 'base/entornos_muestras.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object {
  if (-not $entMuestras.Contains($_.universo)) { $entMuestras[$_.universo] = [ordered]@{} }
  if (-not $entMuestras[$_.universo].Contains($_.entorno)) { $entMuestras[$_.universo][$_.entorno] = New-Object System.Collections.ArrayList }
  [void]$entMuestras[$_.universo][$_.entorno].Add($_.codigo)
}
$jsonEntMuestras = ConvertTo-Json -InputObject $entMuestras -Depth 5 -Compress
$t = Leer 'plantilla.html'
# Arimo incrustada (src/assets/fuentes): el Atlas no depende de internet para la tipografía.
$arimoLatin = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $src 'assets/fuentes/arimo-latin.woff2')))
$arimoExt = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $src 'assets/fuentes/arimo-latin-ext.woff2')))
$t = $t.Replace('/*FUENTE_ARIMO*/', ("@font-face{font-family:'Arimo';font-style:normal;font-weight:400 700;font-display:swap;src:url(data:font/woff2;base64,$arimoExt) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}" + "@font-face{font-family:'Arimo';font-style:normal;font-weight:400 700;font-display:swap;src:url(data:font/woff2;base64,$arimoLatin) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}"))
$t = $t.Replace('/*ESTILOS_DETALLES*/', ('/*ESTILOS_DETALLES*/' + [Environment]::NewLine + (Leer 'tu-placa-biblioteca.css') + [Environment]::NewLine + (Leer 'tu-placa-v12.css') + [Environment]::NewLine + (Leer 'tu-placa-encuentros.css')))
$microLocal = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $src 'assets/detalles/lupa-micro-local.jpg')))
$t = $t.Replace('<script defer src="src/assets/lupa-figma.js"></script>', ('<script>window.MICROMUNDOS_MICRO_LOCAL="data:image/jpeg;base64,' + $microLocal + '";</script><script data-lupa-runtime>' + (Leer 'assets/lupa-figma.js') + '</script>'))
$t = $t.Replace('/*ESTILOS_DETALLES*/', ((Leer 'pantallas-detalle.css') + [Environment]::NewLine + (Leer 'ficha-galeria.css')))
$t = $t.Replace('/*PANTALLAS_DETALLE*/', ('const RECETA_PIE_FICHA = ' + (Leer 'assets/detalles/ficha-footer.receta.json') + ';' + [Environment]::NewLine + (Leer 'ficha-galeria.js') + [Environment]::NewLine + '/*PANTALLAS_DETALLE*/'))
$t = $t.Replace('/*PANTALLAS_DETALLE*/', ('const CELULAS_FICHA = ' + (Leer 'ficha-colonias.json') + ';const ENTORNOS_DETALLE = ' + [IO.File]::ReadAllText((Join-Path $base 'base/entornos.json'), $utf8) + ';const ENTORNOS_MUESTRAS = ' + $jsonEntMuestras + ';const DISENOS_DETALLE = ' + (Leer 'pantallas-detalle.json') + ';' + [Environment]::NewLine + ('const FONDOS_UNIVERSOS = ' + (Leer 'fondos-universos.json') + ';' + [Environment]::NewLine + (Leer 'fondos-universos.js') + [Environment]::NewLine + (Leer 'pantallas-detalle.js')) + [Environment]::NewLine + ((Leer 'tu-placa-estructuras.js') + [Environment]::NewLine + (Leer 'tu-placa-generador.js') + [Environment]::NewLine + (Leer 'tu-placa-motor.js') + [Environment]::NewLine + (Leer 'tu-placa-biblioteca.js') + [Environment]::NewLine + (Leer 'tu-placa-menu.js') + [Environment]::NewLine + (Leer 'tu-placa-editor.js') + [Environment]::NewLine + (Leer 'tu-placa-v12.js'))))
$t = $t.Replace('/*ESTILOS_GLOSARIO*/', ((Leer 'glosario.css') + [Environment]::NewLine + (Leer 'que-es.css')))
$terminosGlosario = @(Import-Csv -LiteralPath (Join-Path $base 'base/glosario.csv') -Delimiter ';' -Encoding UTF8)
$vinculosGlosario = @(Import-Csv -LiteralPath (Join-Path $base 'base/glosario_muestras.csv') -Delimiter ';' -Encoding UTF8)
$t = $t.Replace('/*GLOSARIO*/', ('const TERMINOS_GLOSARIO = ' + (ConvertTo-Json -InputObject $terminosGlosario -Depth 5 -Compress) + ';const VINCULOS_GLOSARIO = ' + (ConvertTo-Json -InputObject $vinculosGlosario -Depth 5 -Compress) + ';' + [Environment]::NewLine + (Leer 'glosario.js')))
$t = $t.Replace('/*APERTURA*/', ('const RECETA_APERTURA = ' + (Leer 'apertura-palabra.json') + ';const RECETA_FONDO_APERTURA = ' + (Leer 'apertura-fondo.json') + ';' + [Environment]::NewLine + (Leer 'apertura.js')))
$t = $t.Replace('/*LISTADO*/', (Leer 'listado.js'))
$t = $t.Replace('/*MUESTRARIO*/', ('const GUIA_MUESTRARIO = ' + (Leer 'muestrario.json') + ';' + [Environment]::NewLine + (Leer 'muestrario.js')))
$especies = @{}
$gruposEspecies = @{}
Import-Csv -LiteralPath (Join-Path $base 'base/colonias.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object {
  $especies[$_.codigo] = @($especies[$_.codigo]) + $_.especie
  $gruposEspecies[$_.especie] = $_.grupo
}
$vinculos = @{}
Import-Csv -LiteralPath (Join-Path $base 'base/muestras.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object {
  $vinculos[($_.receta + ':' + $_.id)] = @{ especies = @($especies[$_.codigo] | Sort-Object -Unique); hallazgo = $_.hallazgo }
}
$jsonVinculos = ConvertTo-Json -InputObject $vinculos -Depth 5 -Compress
$jsonGrupos = ConvertTo-Json -InputObject $gruposEspecies -Compress
$catalogo = @{}
Import-Csv -LiteralPath (Join-Path $base 'base/especies.csv') -Delimiter ';' -Encoding UTF8 | ForEach-Object {
  $catalogo[$_.especie] = @{ definicion = $_.definicion; donde_esta = $_.donde_esta; que_produce_o_transforma = $_.que_produce_o_transforma }
}
$t = $t.Replace('/*CARTELES*/', ('const CATALOGO_ESPECIES = ' + (ConvertTo-Json -InputObject $catalogo -Depth 4 -Compress) + ';' + [Environment]::NewLine + (Leer 'carteles.js')))
$t = $t.Replace('/*VINCULOS*/', ('const DATOS_VINCULOS = ' + $jsonVinculos + ';' + [Environment]::NewLine + 'const GRUPOS_ESPECIES = ' + $jsonGrupos + ';' + [Environment]::NewLine + (Leer 'vinculos.js')))
$t = $t.Replace('/*DATOS*/',    (Leer 'datos.js'))
$t = $t.Replace('/*COLONIAS*/', (Leer 'colonias-core.js'))
$t = $t.Replace('/*RECETA_A*/', (Leer 'receta_A.json'))
$t = $t.Replace('/*RECETA_B*/', (Leer 'receta_B.json'))
$t = $t.Replace('/*APP*/',      (Leer 'app.js'))
$recursos = @{
  '__G_BACTERIA__' = @('glosario-bacteria.png','image/png')
  '__G_LEVADURA__' = @('glosario-levadura.png','image/png')
  '__G_MOHO__' = @('glosario-moho.png','image/png')
  '__G_ESQUINA__' = @('glosario-esquina.png','image/png')
  '__G_CARTEL__' = @('glosario-cartel.png','image/png')
  '__G_VOLVER__' = @('glosario-volver.svg','image/svg+xml')
  '__G_BAJAR__' = @('glosario-bajar.svg','image/svg+xml')
  '__G_ENLACE__' = @('glosario-enlace.svg','image/svg+xml')
  '__G_LINEA__' = @('glosario-linea.svg','image/svg+xml')
  '__TINTE_SUAVE__' = @('fondo-tinte-suave.svg','image/svg+xml')
  '__APERTURA_FONDO__' = @('apertura-fondo.png','image/png')
  '__APERTURA_ARCO_A__' = @('apertura-arco-a.svg','image/svg+xml')
  '__APERTURA_ARCO_B__' = @('apertura-arco-b.svg','image/svg+xml')
  '__APERTURA_ARCO_C__' = @('apertura-arco-c.svg','image/svg+xml')
  '__APERTURA_TINTE__' = @('apertura-tinte.svg','image/svg+xml')
  '__APERTURA_MARCA__' = @('apertura-marca.svg','image/svg+xml')
  '__CARTEL_FONDO__' = @('cartel-colonias.jpg','image/jpeg')   # 640x800 (la original de 2048x2560 hacía pesar 4 MB el HTML)
  '__CARTEL_LINEA__' = @('cartel-linea.svg','image/svg+xml')
  '__CARTEL_COLORES__' = @('cartel-colores-bl.svg','image/svg+xml')
  '__CARTEL_FLECHA__' = @('cartel-flecha.svg','image/svg+xml')
}
foreach($marca in $recursos.Keys){
  $recurso = $recursos[$marca]
  $ruta = Join-Path $src ('assets/' + $recurso[0])
  if (-not (Test-Path -LiteralPath $ruta -PathType Leaf)) { throw "Falta el recurso: $ruta" }
  # Mantiene las imágenes externas para no inflar el HTML con varios MB de base64.
  # La ruta funciona tanto junto a src/ en el prototipo como desde dist/index.html.
  $t = $t.Replace($marca, ('src/assets/' + $recurso[0]))
}
# Modo kiosco (solo con ?kiosco en la dirección): reinicio por inactividad y bloqueo de gestos. Ver src/kiosco.js.
$finCuerpo = $t.LastIndexOf('</body>')
$t = $t.Substring(0, $finCuerpo) + '<script>' + (Leer 'kiosco.js') + '</script>' + [Environment]::NewLine + $t.Substring($finCuerpo)
# La máscara conserva su alfa original y evita el bloqueo CORS de máscaras en file://.
$mascaraCampo = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $src 'assets/detalles/mascara-campo-suave.png')))
$t = $t.Replace('__MASCARA_CAMPO_SUAVE__', ('data:image/png;base64,' + $mascaraCampo))
$mascaraTransformacion = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $src 'assets/detalles/mascara-transformacion.png')))
$t = $t.Replace('__MASCARA_FICHA_TRANSFORMACION__', ('data:image/png;base64,' + $mascaraTransformacion))
[IO.File]::WriteAllText((Join-Path $base 'placa.html'), $t, $utf8)
Write-Host "placa.html listo ($($t.Length) caracteres)"
