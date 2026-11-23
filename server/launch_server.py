#!/usr/bin/env python3

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler, test
from http import HTTPStatus
import sys
import logging
import json
import pathlib

import channel_points_handler

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        parent_dir = pathlib.Path(__file__).resolve().parent.parent
        super().__init__(*args, directory=parent_dir, **kwargs)
        self.extensions_map['.json'] = 'application/json'

    def end_headers (self):
        # self.send_header('Access-Control-Allow-Origin', 'localhost')
        self.send_header('Connection', 'Keep-Alive')
        SimpleHTTPRequestHandler.end_headers(self)

    # def send_head(self):
    #     super().send_head()

    def basic_response(self, status_code, content_type='text/plain', content=''):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Content-length', len(content))
        self.end_headers()
        if len(content) > 0:
            self.wfile.write(content.encode('utf-8'))

    def do_GET(self):
        if channel_points_handler.matches_path(self.path):
            channel_points_handler.do_GET(self)
            return
        super().do_GET()

    def do_POST(self):
        if channel_points_handler.matches_path(self.path):
            channel_points_handler.do_POST(self)
            return
        respond(HTTPStatus.NOT_FOUND)

if __name__ == '__main__':
    test(CORSRequestHandler, ThreadingHTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)