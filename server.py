"""Serve only the public demo; never expose workspace files or credentials."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import json
import live_backend

ROOT = Path(__file__).resolve().parent
class Handler(BaseHTTPRequestHandler):
    do_POST = live_backend.post
    def do_GET(self):
        path = urlsplit(self.path).path
        if live_backend.get(self, path): return
        if path == '/health':
            data = json.dumps({'ok': True, 'mode': 'live', 'chat': 'glm-4-flash-250414', 'image': 'cogview-3-flash'}).encode()
            content_type = 'application/json'
        elif path in ('/', '/index.html') and 'test=poster' not in urlsplit(self.path).query:
            data = (ROOT / 'landing.html').read_bytes()
            content_type = 'text/html; charset=utf-8'
        elif path in ('/', '/index.html', '/play', '/play/', '/web/index.html'):
            data = (ROOT / 'index.html').read_text(encoding='utf-8').replace('</body>', '<script src="/live.js"></script></body>').encode()
            content_type = 'text/html; charset=utf-8'
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        self.wfile.write(data)

if __name__ == '__main__':
    print('Nuwa demo: http://127.0.0.1:8787', flush=True)
    ThreadingHTTPServer(('0.0.0.0', 8787), Handler).serve_forever()
