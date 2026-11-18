# RETIRADO. Este armador en Python quedó desactualizado respecto de build.ps1 y producía un placa.html incompleto
# (sin la galería, el pie de la ficha ni TU PLACA nueva). Para no tener dos armados distintos, ahora solo llama a build.ps1.
# Comando vigente: doble clic en armar.bat, o en PowerShell:  powershell -ExecutionPolicy Bypass -File build.ps1
import pathlib, subprocess, sys
aqui = pathlib.Path(__file__).resolve().parent
print('build.py está retirado: se usa build.ps1 (armar.bat).')
sys.exit(subprocess.call(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(aqui / 'build.ps1')] + sys.argv[1:]))
