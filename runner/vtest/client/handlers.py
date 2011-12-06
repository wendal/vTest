# -*- coding: UTF-8 -*-

from vtest.client.helper import WebClient, renderTpl
import shutil
import json
import logging
import new
import time
import uuid
import os
import socket

log = logging.getLogger('vtest')

NEXT_NODE=0
SUCCESS=1
FAIL=2
ERROR=3
LOOP_NEXT=4
LOOP_BREAK=5

class BaseHandler(object):
    
    def __init__(self, task=None):
        if task :
            self.webclient = WebClient(task['host'], task['port'])
        self.context = {
                            'task' : task ,
                            'tmp'  : '/tmp/',
                            'robot': {
                                        'id' : uuid.uuid4().hex,
                                        'pid': os.getpid()
                                      },
                            'sys'  : {
                                        'name' : socket.gethostname(),
                                        'ipv4' : socket.gethostbyname(socket.gethostname())
                                      }
                        }
        log.debug('Robot init context -->\n' + json.dumps(self.context, indent=2))
        self.task = task
        
    def run(self):
        self.control_foreach(self.task.get('steps'))
        log.info('Exit code=%d' % self.last_code)
        if not self.last_code :
            return SUCCESS
        return self.last_code
    
    def _use(self, key):
        if not key :
            return {}
        return self.context.get(key) or  {}
    
    def _paser(self, values):
        if not values :
            return
        if values.get('$use') :
            headers = dict(values.items() + self._use(values.get('$use')).items())
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
    
    def run_node(self, node):
        log.debug("Run node --> " + json.dumps(node))
        try :
            node_type = node['type'].replace('.', '_')
            type_method = self.__getattribute__(node_type)
            args = node.get('args') or {'Nothing' : None}
            if node_type == 'control_switch' :
                self.last_code = type_method(args)
            else :
                self.last_code = type_method(**args)
        except :
            log.error('Fail to execute node', exc_info=1)
            self.last_code = ERROR
        return self.last_code

    #---------------------------------------------------------------------------------------------
    #控制器

    def control_foreach(self, nodes):
        for node_info in nodes :
            if node_info.get('node') :
                node = self.task['nodes'][node_info['node']]
            else :
                node = node_info
            if self.run_node(node) :
                if self.last_code in (SUCCESS, FAIL, ERROR) :
                    return self.last_code
                elif self.last_code == LOOP_BREAK :
                    return NEXT_NODE
                #LOOP_NEXT对foreach无意义
        return NEXT_NODE
    
    def control_loop(self, var_index='i', start=0, end=1, delay=0, run=[]):
        for n in xrange(start, end) :
            self.context[var_index] = n
            if self.control_foreach(run) :
                if self.last_code in (SUCCESS, FAIL, ERROR) :
                    return self.last_code
            if delay :
                time.sleep(delay * 0.001)
        return NEXT_NODE #其他code?无意义,返回标准的
    
    def control_switch(self, args):
        for k,nodes in args :
            if k != 'default' and self._eval(k) :
                return self.control_foreach(nodes)
        if args.get('default') :
            return self.control_foreach(args.get('default'))
    
    def control_break(self, *args, **kwargs):
        return LOOP_BREAK
    
    def control_next(self, *args, **kwargs):
        return LOOP_NEXT
    
    def control_exit(self, **kwargs):
        if kwargs and kwargs.get('exit') :
            return FAIL
        return NEXT_NODE
    
    def exit_success(self, **kwargs):
        return SUCCESS
    
    def exit_fail(self, **kwargs):
        return FAIL
    
    #---------------------------------------------------------------------------------------------
    #普通节点
    def http_send(self, uri=None, method='GET', reps_header=None, reps_body=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        resp = self.webclient.send(method, uri, 
                            headers=headers, 
                            data=params)
        if not resp or resp.status >= 303 :
            log.debug('Resp is None or resp.status > 303' + str(resp))
            return FAIL
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
        return NEXT_NODE
                        
    def ajax_upload(self, uri=None, method='POST', file=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        file_path = self._render(file)
        with open(file_path) as f :
            resp = self.webclient.post(uri, headers, params, body=f)
        if resp and resp.status == 200 :
            return NEXT_NODE
        else :
            return FAIL
    
    def img_make(self, file=None, width=800, height=640, r=0, g=90 , b=90):
        with open(self._render(file), 'w') as f :
            import bmp
            img = bmp.BitMap( width, height, bmp.Color(r,g,b))
            f.write(img.getBitmap())
        return NEXT_NODE

    def json_parse(self, source='{}', dest=None):
        if source.startswith('context') :
            self.context[dest] = json.loads(self.context[source[len('context:'):]])
        elif source.startswith('file') :
            with open(self._render(source[len('file:'):])) as f :
                self.context[dest] = json.load(f)
        return NEXT_NODE

    def json_found(self, source, type, match):
        pass #TODO

    def set(self, name=None, value=None, remove=None):
        if remove :
            value = None
        self.context[name] = value
        return NEXT_NODE
    

    
    def random(self):
        pass #TODO
        
    def extends(self, type_name=None, type_method=None):
        if type_name and type_method :
            _method = None
            exec type_method + '''\n_method = %s''' % type_name
            self.__dict__[type_name] = new.instancemethod(_method, self, None)
        elif type_method :
            exec type_method

if 1 :
    import logging.handlers
    fh = logging.handlers.RotatingFileHandler("test.log")
    fh.setLevel(logging.DEBUG)
    formatter = logging.Formatter('$: %(asctime)s > %(levelname)s > %(funcName)s@%(filename)s %(lineno)s > %(message)s')
    fh.setFormatter(formatter)
    log.addHandler(fh)
    
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    console.setLevel(logging.DEBUG)
    log.addHandler(console)
    
    log.setLevel(logging.DEBUG)








