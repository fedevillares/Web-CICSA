# Local preview server with caching disabled.
import http.server, functools, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
http.server.ThreadingHTTPServer(('127.0.0.1', 5511), functools.partial(H, directory=str(root))).serve_forever()
