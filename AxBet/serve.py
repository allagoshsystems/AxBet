"""
1xBet Static Template Local Server
Supports:
- Clean URLs: /en/casino -> /en/casino.html
- Directory indexes: /en -> /en.html, / -> /index.html
- 404 Fallback: Serves 404.html (or index.html) instead of Python's plain error
- MIME types for all CSS, JS, SVG, WebP, WOFF2
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 8000
SITE_DIR = Path(__file__).parent / "site"
if not SITE_DIR.exists():
    SITE_DIR = Path(__file__).parent

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_DIR), **kwargs)

    def do_GET(self):
        # Normalize request path
        path = self.path.split('?')[0].split('#')[0]
        
        # 1. Check exact file
        target = (SITE_DIR / path.lstrip('/')).resolve()
        
        # 2. Try appending .html (e.g. /en/casino -> /en/casino.html)
        if not target.exists() or target.is_dir():
            html_candidate = (SITE_DIR / f"{path.lstrip('/')}.html").resolve()
            if html_candidate.exists() and html_candidate.is_file():
                self.path = f"{path}.html"
                return super().do_GET()
                
        # 3. Try directory / index.html (e.g. /en/ -> /en/index.html or /en.html)
        if target.is_dir():
            idx = target / "index.html"
            if idx.exists():
                return super().do_GET()
            # If /en has en.html at root
            alt = (SITE_DIR / f"{path.strip('/')}.html").resolve()
            if alt.exists():
                self.path = f"/{path.strip('/')}.html"
                return super().do_GET()

        # 4. If file not found, fall back to 404.html or index.html with full template UI
        if not target.exists():
            not_found = SITE_DIR / "404.html"
            if not not_found.exists():
                not_found = SITE_DIR / "index.html"
            if not_found.exists():
                content = not_found.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return

        return super().do_GET()

    def log_message(self, format, *args):
        # Clean console log
        sys.stdout.write(f"[{self.log_date_time_string()}] {args[0]} {args[1]}\n")
        sys.stdout.flush()

def run():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), CleanURLHandler) as httpd:
            print(f"=" * 60)
            print(f"  1xBet Static Template Server is running!")
            print(f"  Local URL : http://localhost:{PORT}")
            print(f"  Serving   : {SITE_DIR}")
            print(f"=" * 60)
            print("Press Ctrl+C to stop the server.\n")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048: # Port already in use
            alt_port = 8080
            print(f"Port {PORT} in use, trying {alt_port}...")
            with socketserver.TCPServer(("127.0.0.1", alt_port), CleanURLHandler) as httpd:
                print(f"=" * 60)
                print(f"  1xBet Static Template Server is running!")
                print(f"  Local URL : http://localhost:{alt_port}")
                print(f"  Serving   : {SITE_DIR}")
                print(f"=" * 60)
                httpd.serve_forever()
        else:
            raise e

if __name__ == "__main__":
    run()

