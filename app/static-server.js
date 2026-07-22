// Minimal static server that serves frontend.html at "/".
// The Nova Store app ships frontend.html as a file (the API server does
// not serve it), so tests need something to host it over http://.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.STATIC_PORT || 8080;
const FILE = path.join(__dirname, 'frontend.html');

const server = http.createServer((req, res) => {
  // Serve the SPA for any route.
  fs.readFile(FILE, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('frontend.html not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Static frontend served at http://127.0.0.1:${PORT}`));
