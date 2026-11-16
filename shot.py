import sys,asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1920,'height':1100})
        logs=[]; pg.on('console',lambda m:logs.append(m.type+': '+m.text)); pg.on('pageerror',lambda e:logs.append('ERR '+str(e)))
        await pg.goto('file://'+__import__('os').path.abspath('placa.html'))
        await pg.wait_for_timeout(9000)
        await pg.screenshot(path='s1.png')
        for a in sys.argv[1:]:
            if a.startswith('js:'): await pg.evaluate(a[3:]); await pg.wait_for_timeout(1200)
            elif a.startswith('click:'):
                x,y=map(float,a[6:].split(',')); await pg.mouse.click(x,y); await pg.wait_for_timeout(1200)
            elif a.startswith('shot:'): await pg.screenshot(path=a[5:])
        print('\n'.join(logs[:20]))
        await b.close()
asyncio.run(main())
