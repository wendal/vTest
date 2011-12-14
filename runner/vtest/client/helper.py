# -*- coding: UTF-8 -*-

import httplib
import urllib
import logging
import json

log = logging.getLogger('vtest.helper')

class WebClient(object):
    
    def __init__(self, server_url='127.0.0.1:8080'):
        if server_url.startswith('http://') :
            self.server_url=server_url[7:]
        else :
            self.server_url=server_url
        if self.server_url.find(":") :
            self.host = self.server_url[0:self.server_url.find(":")]
            self.port = int(self.server_url[(self.server_url.find(":")+1):])
        else :
            self.host = self.server_url
            self.port = 80
        self.cookie='NONE'
    
    def send(self, method, url, headers=None,data=None):
        #log.debug('Http method = ' + method)
        method = method.lower()
        if method == 'get' :
            return self.get(url, headers)
        elif method == 'post' :
            return self.post(url, headers, data)
        return None #TODO warning it
    
    def get(self, url, headers=None, params=None):
        (host, port, uri) = self._p_url(url)
        conn = httplib.HTTPConnection(host=host, port=port)
        #conn.set_debuglevel(5)
        if not headers :
            headers = {}
        if not headers.get('Cookie') :
            headers['Cookie'] = self.cookie
        if params :
            uri += urllib.urlencode(params)
        conn.request("GET", uri, body=None, headers=headers)
        log.debug('Done for req, return resp now!!')
        return conn.getresponse()

    def post(self, url, headers=None, params=None, body=None):
        (host, port, uri) = self._p_url(url)
        conn = httplib.HTTPConnection(host=host, port=port)
        #conn.set_debuglevel(5)
        if not headers :
            headers = {}
        if not headers.get('Cookie') :
            headers['Cookie'] = self.cookie
        if not headers.get('Content-Type') :
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if not body and params :
            if isinstance(params, dict):
                body = urllib.urlencode(params)
            else :
                body = str(params)
        conn.request("POST", uri, body=body, headers=headers)
        log.debug('Done for req, return resp now!!')
        return conn.getresponse()
    
    def _p_url(self,url):
        if url.startswith('http://') :
            url = url[7:]
            i = url.find(":")
            j = url.find("/")
            if i and i < j :
                host = url[0:i]
                port = int(url[(i+1):j])
                uri = url[j:]
                return (host,port,uri)
            return (url[0:j], 80, url[j:])
        else :
            return (self.host,self.port, url)
    
'''
根据datas渲染tpl模板
'''
def renderTpl(tpl,datas={}):
    start = tpl.find('${')
    end = -1
    if start > -1 :
        end = tpl.find('}',start)
    if start > -1 and end > -1 :
        pre = tpl[0:start]
        elx = tpl[start+2:end]
        post = tpl[(end+1):]
        return renderTpl(pre + str(el(elx, datas)) + post, datas)
    #log.debug('render result -->', tpl,'tpl->>', tpl)
    return tpl
    
    
def el(el_str, context):
    
    elx = 'cxt' + to_python_el(el_str)
    #print elx
    #print json.dumps(context, indent=2)
    return eval(elx, {'cxt' : context})

def to_python_el(el_str):
    ps = el_str.split('.')
    elx = ''
    for p in ps :
        if p.find('[') > 0 :
            elx += '["' + p[0:p.find('[')] + '"]' + p[p.find('['):]
        else :
            elx += '["' + p + '"]'
    return elx



def init_log(name=None, file_name='test.log'):
    import logging.handlers
    if name :
        log = logging.getLogger(name)
    else :
        log = logging.getLogger()
    #import os
    #if not os.path.exists(os.path.dirname(file_name)) :
    #    os.makedirs(os.path.dirname(file_name))
    fh = logging.handlers.RotatingFileHandler(file_name)
    fh.setLevel(logging.DEBUG)
    formatter = logging.Formatter('$: %(asctime)s > %(levelname)s > %(funcName)s@%(filename)s %(lineno)s > %(message)s')
    fh.setFormatter(formatter)
    log.addHandler(fh)
    
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    console.setLevel(logging.DEBUG)
    log.addHandler(console)
    
    log.setLevel(logging.DEBUG)
    return log

def create_png(dest_file, width, height, r, g, b, a=255):
    buf = bytearray()
    for i in xrange(width) :
        for j in xrange(height) :
            buf.append(r)
            buf.append(g)
            buf.append(b)
            buf.append(a)
    png_bytes = write_png(buffer(buf), width, height)
    if isinstance(dest_file, file):
        dest_file.write(png_bytes)
    else :
        with open(dest_file, 'wb') as f :
            f.write(png_bytes)

def write_png(buf, width, height):
    import zlib, struct
    width_byte_4 = width * 4
    raw_data = b"".join(b'\x00' + buf[span:span + width_byte_4] for span in range((height - 1) * width * 4, -1, - width_byte_4))
    def png_pack(png_tag, data):
        chunk_head = png_tag + data
        return struct.pack("!I", len(data)) + chunk_head + struct.pack("!I", 0xFFFFFFFF & zlib.crc32(chunk_head))
    return b"".join([
        b'\x89PNG\r\n\x1a\n',
        png_pack(b'IHDR', struct.pack("!2I5B", width, height, 8, 6, 0, 0, 0)),
        png_pack(b'IDAT', zlib.compress(raw_data, 9)),
        png_pack(b'IEND', b'')])








