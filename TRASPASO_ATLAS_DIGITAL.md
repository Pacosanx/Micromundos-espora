# Traspaso de la conversación · Micromundos / TU PLACA

Para pegar o abrir al inicio de una sesión de Claude Code en ATLAS DIGITAL. Fecha: 17/11/2026.

## Contexto
Proyecto académico MICROMUNDOS (`Pacosanx/Micromundos-espora`, rama `ccr-0023a5d1-9rvb9o`). Los docentes lo corrigen **desde un video** que graba Paco con mouse (el plan final es pantalla táctil) y pidieron centrarse en **TU PLACA**. Herramienta relacionada: **COLONIAS** (`Pacosanx/colonias-espora`).
El código se arma desde `src/` con `build.ps1` (o `armar.bat`) hacia `placa.html`. `build.py` está desactualizado: no usarlo.

## Archivos ya escritos en el repo
- `AUDITORIA_Y_CHECKLIST.md`: auditoría, 11 devoluciones docentes procesadas, checklist y decisiones.
- `COLONIAS_PARA_TU_PLACA.md`: inventario de funciones de COLONIAS y propuesta para TU PLACA.

## Devoluciones de los docentes (resumen)
Arreglar blur · onboarding y cartelitos · TU PLACA más protagonista · composiciones sembrables, no sólo elementos sueltos · menú contextual: mantener y rotar con animación continua · menú/anillo alrededor de la placa para la composición entera · qué tomar de COLONIAS / "diseñá tu colonia" · reacciones más visuales y botón para unir dos colonias en vez de la pestaña "combinadas" · variedad de formas y colores.

## Decisiones de Paco
1. **Blur:** quitar el 100 % del blur de la **tipografía** por ahora. Blur de colonias, fondos y vidrio de carteles no se toca.
2. Ir primero a TU PLACA es **sólo el orden del video**.
3. **UNIR dos colonias:** en una más grande o en forma de 8/infinito; **color mixto**; cada unión puede tener una característica propia según el caso (casos por definir).
4. **Anillo de la composición:** Foco ✔, Rotación del conjunto ✔, Paleta como **porcentajes** ✔, Variación global (formas y tamaños individuales) ✔. Sin Tamaño ni Opacidad. "Densidad": por definir.
5. **Catálogo de formas y colores:** sin lista definitiva; se deriva de lo que se usa en COLONIAS.
6. El video lo prepara Paco; no condiciona el plan.

## Hallazgos clave
- 40 textos con blur en TU PLACA y 25 en PLACA (hasta 2,1 px); 16 controles por debajo de 48 px.
- `build.py` no incluye TU PLACA actual.
- `tu-placa-v12.css:87` quita la transición del menú mientras se mantiene apretado.
- Las reacciones actuales (`tu-placa-v12.js:101-121`) son simples; COLONIAS ya tiene un modo Relaciones elaborado (`relations-renderer.js`).
- COLONIAS ya soporta `studyLobes`; `src/colonias-core.js` lo tiene como parche propio (Q-9).
- `RELACIONES.md` de COLONIAS registra que Paco rechazó que la Simbiosis agrande el área: UNIR debe ser una acción aparte.

## Pendiente / preguntas abiertas
- Qué hace "Densidad"; qué forma toma cada caso de UNIR.
- Formas de COLONIAS que Paco realmente usa; si el modo Micro va como vista final.
- Si las colonias diseñadas por el visitante se guardan en el navegador.
- **Muestrario con Codex** (`espora/herramientas/muestrario-micromundos/index.html`, en el PC de Paco): **no se pudo abrir** desde la nube. Falta analizarlo: subirlo al repo o pasar capturas y código.

## Reglas heredadas
No tocar `base/` ni semillas/azar sin avisar a Paco; conservar `filtroCodigos` y `ENTORNOS_MUESTRAS`; no editar `placa.html` a mano (se genera).
