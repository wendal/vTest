# -*- coding: UTF-8 -*-

from vtest.client.helper import WebClient, renderTpl
import shutil
import json
import logging
import new

log = logging.getLogger('vtest')

class BaseHandler:
    
    def __init__(self):
        self.webclient = WebClient()
        self.context = {}
    
    def _use(self, key):
        if not key :
            return {}
        return self.context.get(key)
    
    def _paser(self, values):
        if not values :
            return
        if values.get('$use') :
            headers = dict(values.items(), self._use(values.get('$use')).items())
            headers.pop('$use')
    
    def _render(self, tpl):
        r'''模板渲染,返回值是一个str'''
        result = renderTpl(tpl, self.context)
        if isinstance(result, unicode) :
            result = result.encode()
            #print result
        return result
    
    def _eval(self, el):
        return eval(el, None, self.context)
    
    def _render_headers_params(self, args):
        headers = self._paser(args.get('headers'))
        if args.get('cookie') :
            headers['Cookie'] = ';'.join(self._eval(args['cookie']))
        params = {}
        if args.get('params') :
            for k,v in args['params'] :
                params[k] = self._render(v)
        return (headers, params)
    
    def _run_briefs(self, briefs):
        for brief_info in briefs :
            brief = self.context['briefs'][brief_info['brief']]
            if not self.run_brief(brief) :
                return False
        return True
    
    def run_brief(self, brief):
        return self.__getattr__(brief['type'])(**brief['args'])

    #---------------------------------------------------------------------------------------------
    
    def http_send(self, uri, method='GET', reps_header=None, reps_body=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        resp = self.webclient.send(method, uri, 
                            headers=headers, 
                            params=params)
        if not resp or resp.status >= 303 :
            return False
        if reps_header :
            self.context[reps_header] = resp.getheaders()
        if reps_body :
            if reps_body.startswith('context') :
                context_key = reps_body[len('context:'):]
                self.context[context_key] = resp.read()
            elif reps_body.startswith('file') :
                file_path_tpl = reps_body[len('file:'):]
                file_path = self._render(file_path_tpl)
                with open(file_path, 'wb') as f :
                    shutil.copyfileobj(resp, f)
        return True
                        
    def ajax_upload(self, uri, method='POST', file=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        file_path = self._render(file)
        with open(file_path) as f :
            resp = self.webclient.post(uri, headers, params, body=f)
        if resp and resp.status == 200 :
            return True
        else :
            return False
    
    def img_make(self, file, width, height, r, g , b):
        with open(self._render(file), 'w') as f :
            import bmp
            img = bmp.BitMap( width, height, bmp.Color(r,g,b))
            f.write(img.getBitmap())
        return True

    def json_parse(self, source, dest):
        if source.startswith('context') :
            self.context[dest] = json.loads(self.context[source[len('context:'):]])
        elif source.startswith('file') :
            with open(self._render(source[len('file:'):])) as f :
                self.context[dest] = json.load(f)
        return True

    def set(self, name, value=None, remove=None):
        if remove :
            value = None
        self.context[name] = value
        return True
    
    def loop(self, var_index, start, end, delay, briefs):
        for n in xrange(start, end) :
            self.context[var_index] = n
            if not self._run_briefs(briefs) :
                return False
        return True
    
    def switch(self, **kwargs):
        for k,briefs in kwargs :
            if k != 'default' and self._eval(k) :
                return self._run_briefs(briefs)
        return self._run_briefs(kwargs.get('default'))
    
    def random(self):
        pass
        
    def extends(self, type_name, type_method):
        exec type_method + '''\nglobals()['vtest_NNN_%s'] = %s''' % (type_name, type_name)
        m = new.instancemethod(globals()['vtest_NNN_%s' % type_name], self, BaseHandler)
        self.__dict__[type_name] = m
        globals().pop('vtest_NNN_%s' % type_name)
