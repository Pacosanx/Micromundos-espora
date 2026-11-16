# Revisa que la base de datos respete sus reglas. Solo lee; no modifica nada.
# Uso (desde la carpeta placa):  python base/validar_base.py
import csv, io, os, sys, collections
AQUI = os.path.dirname(os.path.abspath(__file__))
def leer(n):
    with open(os.path.join(AQUI, n), encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f, delimiter=';'))
M, C, E, F, G, GM = (leer(n) for n in ['muestras.csv','colonias.csv','especies.csv','fichas.csv','glosario.csv','glosario_muestras.csv'])
errores, avisos = [], []
err = errores.append

cod = collections.Counter(m['codigo'] for m in M)
err_dup = [k for k, v in cod.items() if v > 1]
if err_dup: err(f'Códigos repetidos en muestras.csv: {err_dup}')
rid = collections.Counter((m['receta'], m['id']) for m in M)
if [k for k, v in rid.items() if v > 1]: err('receta+id repetidos en muestras.csv')
if len(M) != 146: avisos.append(f'muestras.csv tiene {len(M)} filas (esperadas 146: una por elemento de las recetas)')

cat = {e['especie']: e for e in E}
if len(cat) != len(E): err('Especies repetidas en especies.csv')
por_muestra = collections.defaultdict(list)
for c in C:
    por_muestra[c['codigo']].append(c)
    if c['codigo'] not in cod: err(f"colonias.csv: la muestra {c['codigo']} no existe en muestras.csv")
    if c['especie'] not in cat: err(f"colonias.csv: la especie «{c['especie']}» no está en especies.csv")
    elif cat[c['especie']]['grupo'] != c['grupo']: err(f"Grupo de «{c['especie']}» distinto entre colonias.csv y especies.csv")
usadas = {c['especie'] for c in C}
for e in cat:
    if e not in usadas: avisos.append(f'Especie del catálogo sin ninguna muestra: {e}')

for m in M:
    k = m['codigo']; filas = por_muestra.get(k, [])
    if not filas: err(f'{k}: no tiene especies en colonias.csv'); continue
    if k.split('-')[0] != m['grupo']: err(f"{k}: el prefijo del código no coincide con el grupo ({m['grupo']})")
    if sum(int(c['colonias']) for c in filas) != int(m['colonias']):
        err(f"{k}: la suma de colonias por especie ({sum(int(c['colonias']) for c in filas)}) no da el total de la muestra ({m['colonias']})")
    gs = {c['grupo'] for c in filas}
    if not gs <= set(m['grupo']): err(f"{k}: tiene especies de un grupo que no es el suyo ({sorted(gs)} en {m['grupo']})")
    if len(m['grupo']) > 1 and gs != set(m['grupo']): err(f"{k}: muestra {m['grupo']} sin especies de todos sus grupos")
    if m['estado'] not in ('A', 'C', 'MO', 'R'): err(f"{k}: estado desconocido «{m['estado']}»")
    if (m['estado'] == 'C') != bool(m['metodo']): err(f"{k}: el método de conservación debe estar completo solo si el estado es C")
    if not os.path.isfile(os.path.join(AQUI, 'muestras_png', k + '.png')): avisos.append(f'{k}: falta muestras_png/{k}.png')

mm = {m['codigo']: m for m in M}
for f in F:
    m = mm.get(f['codigo'])
    if not m: err(f"fichas.csv: {f['codigo']} no existe en muestras.csv")
    elif (m['receta'], m['id']) != (f['receta'], f['id']): err(f"fichas.csv: {f['codigo']} tiene otra receta+id que en muestras.csv")
ids = {g['id'] for g in G}
rid_set = set(rid)
for r in GM:
    if r['termino_id'] not in ids: err(f"glosario_muestras.csv: término desconocido {r['termino_id']}")
    if (r['receta'], r['id']) not in rid_set: err(f"glosario_muestras.csv: receta+id desconocido {r['receta']}:{r['id']}")

# Tabla entorno -> muestras (la usan los botones «Ver muestras de este entorno» del Glosario)
import json
EM = leer('entornos_muestras.csv')
ENT = json.load(open(os.path.join(AQUI, 'entornos.json'), encoding='utf-8-sig'))
LETRA = {'bacterias': 'B', 'levaduras': 'L', 'mohos': 'M'}
for r in EM:
    if r['universo'] not in LETRA: err(f"entornos_muestras.csv: universo desconocido «{r['universo']}»"); continue
    if r['entorno'] not in [e['nombre'] for e in ENT[r['universo']]]: err(f"entornos_muestras.csv: «{r['entorno']}» no es un entorno de {r['universo']} en entornos.json")
    m = mm.get(r['codigo'])
    if not m: err(f"entornos_muestras.csv: la muestra {r['codigo']} no existe"); continue
    if LETRA[r['universo']] not in m['grupo']: err(f"entornos_muestras.csv: {r['codigo']} (grupo {m['grupo']}) no pertenece al universo {r['universo']}")
    if r['relacion'] not in ('directa', 'cercana'): err(f"entornos_muestras.csv: relación desconocida «{r['relacion']}» en {r['codigo']}")
for u, letra in LETRA.items():
    for e in ENT[u]:
        if not any(r['universo'] == u and r['entorno'] == e['nombre'] for r in EM): avisos.append(f"Entorno sin ninguna muestra: {u} · {e['nombre']}")
print(f'{len(M)} muestras · {len(C)} registros de especies · {len(E)} especies · {len(F)} fichas · {len(G)} términos')
for a in avisos: print('AVISO ', a)
for e in errores: print('ERROR ', e)
print('BASE OK' if not errores else f'{len(errores)} error(es): corregir antes de armar el HTML')
sys.exit(1 if errores else 0)
