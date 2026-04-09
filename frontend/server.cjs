const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 5000;
const directory = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

http.createServer(function (request, response) {
  let filePath = path.join(directory, request.url);
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Prevent directory traversal
  if (!filePath.startsWith(directory)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if(error.code == 'ENOENT') {
        // SPA fallback: serve index.html for unknown paths (if not found as file)
        fs.readFile(path.join(directory, 'index.html'), function(error, content) {
            if (error) {
                response.writeHead(500);
                response.end('Error: ' + error.code + ' ..\n');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content, 'utf-8');
            }
        });
      } else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });

}).listen(port);
console.log(`Server running at http://127.0.0.1:${port}/`);
