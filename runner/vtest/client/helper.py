# -*- coding: UTF-8 -*-

import httplib
import urllib

class WebClient(object):
    
    def __init__(self, host='127.0.0.1', port=80):
        self.host=host
        self.port=port
        self.cookie='NONE'
    
    def send(self, method, uri, headers=None,data=None):
        method = method.lower()
        if method == 'get' :
            return self.get(uri, headers)
        elif method == 'post' :
            return self.post(uri, data, headers)
        return None #TODO warning it
    
    def get(self, uri, headers=None, params=None):
        conn = httplib.HTTPConnection(host=self.host,port=self.port)
        #conn.set_debuglevel(5)
        if not headers :
            headers = {}
        if not headers.get('Cookie') :
            headers['Cookie'] = self.cookie
        if params :
            uri += urllib.urlencode(params)
        conn.request("GET", uri, body=None, headers=headers)
        return conn.getresponse()

    def post(self, uri, headers=None, params=None, body=None):
        conn = httplib.HTTPConnection(host=self.host,port=self.port)
        #conn.set_debuglevel(5)
        if not headers :
            headers = {}
        if not headers.get('Cookie') :
            headers['Cookie'] = self.cookie
        if not headers.get('Content-Type') :
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if isinstance(params, dict):
            body = urllib.urlencode(params)
        conn.request("POST", uri, body=body, headers=headers)
        return conn.getresponse()
    
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
        post = tpl[end:]
        return renderTpl(pre + str(el(elx, datas)) + post)
    print 'render result -->', tpl,'tpl->>', tpl
    return tpl
    
    
def el(el_str, context):
    ps = el_str.split('.')
    elx = ''
    for p in ps :
        if p.find('[') > 0 :
            elx += '["' + p[0:p.find('[')] + '"]' + p[p.find('['):]
        else :
            elx += '["' + p + '"]'
    elx = 'cxt' + elx
    print elx
    return eval(elx, {'cxt' : context})



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









