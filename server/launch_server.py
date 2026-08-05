#!/usr/bin/env python3

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler, test
import sys
import logging

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='../', **kwargs)

    def end_headers (self):
        # self.send_header('Access-Control-Allow-Origin', 'localhost')
        self.send_header('Connection', 'Keep-Alive')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    test(CORSRequestHandler, ThreadingHTTPServer, port=int(sys.argv[1]) if len(sys.argv) > 1 else 8000)