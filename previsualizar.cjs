// Vista previa local: sólo sirve el HTML y sus recursos de runtime.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const raiz=__dirname,assets=path.join(raiz,'src','assets');
const tipos={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.jfif':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const servidor=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let ruta;try{ruta=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(ruta==='/favicon.ico'){res.writeHead(204);res.end();return;}
  let archivo;
  if(ruta==='/'||ruta==='/placa.html')archivo=path.join(raiz,'placa.html');
  else if(ruta.startsWith('/src/assets/')){
    archivo=path.resolve(raiz,'.'+ruta);
    if(!archivo.startsWith(assets+path.sep)){res.writeHead(403);res.end();return;}
  }else{res.writeHead(404);res.end();return;}
  fs.stat(archivo,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':tipos[path.extname(archivo).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD'){res.end();return;}
    const stream=fs.createReadStream(archivo);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
});
servidor.on('error',error=>{console.error(error.message);process.exitCode=1;});
servidor.listen(4173,'127.0.0.1',()=>console.log('Micromundos: http://localhost:4173/placa.html — sólo en esta computadora.'));
