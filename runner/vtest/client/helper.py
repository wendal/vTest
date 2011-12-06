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
        conn.set_debuglevel(5)
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
        conn.set_debuglevel(5)
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
    from jinja2 import Environment
    env = Environment(autoescape=False,
                      variable_start_string='${',
                      variable_end_string='}')
    return env.from_string(tpl).render(datas)

class obj(object):
    def __init__(self, d):
        for a, b in d.iteritems():
            if isinstance(b, (list, tuple)):
                setattr(self, a, [obj(x) if isinstance(x, dict) else x for x in b])
            else:
                setattr(self, a, obj(b) if isinstance(b, dict) else b)
                
    def __getattr__(self, name):
        return getattr(self.__dict__, name)
                
    def get(self, key, default_obj=None):
        return self.__dict__.get(key) or default_obj
    
    def __setitem__(self, key, val):
        setattr(self, key, val)
        
    def __iter__(self):
        return self.__dict__.__iter__()
    
    def items(self):
        return self.__dict__.items()
    
    
def el(el_str, context):
    con = obj(context)
    return eval('context.' + el_str, {'context' : con})