# -*- coding: UTF-8 -*-

from vtest.client.helper import WebClient, renderTpl
from vtest.client.helper import el
import shutil
import json
import new
import time
import os
import socket
import vtest.client.bmp as bmp
import logging

log = logging.getLogger('handlers')

NEXT_NODE=0
SUCCESS=1
FAIL=2
ERROR=3
LOOP_NEXT=4
LOOP_BREAK=5

class BaseHandler(object):
    
    def __init__(self, task, robot_conf):
        self.last_msg = 'Unkown ERROR'
        self.last_code = ERROR
        self.webclient = WebClient(server_url=task['server'])
        self.context = {
                            'task' : task['task'] ,
                            'tmp'  : '/tmp/',
                            'robot': {
                                        'id' : robot_conf['rid'],
                                        'pid': os.getpid()
                                      },
                            'sys'  : {
                                        'name' : socket.gethostname(),
                                        'ipv4' : socket.gethostbyname(socket.gethostname())
                                      }
                        }
        log.debug('Robot init context -->\n' + json.dumps(self.context, indent=2, ensure_ascii=False))
        self.task = task
            
        
    def run(self):
        self.control_foreach(self.task['steps'], need_report=True)
        if not self.last_code :
            self.last_code = SUCCESS
        log.info('Exit code=%d, is OK? %s' % (self.last_code, self.last_code == SUCCESS))
        return self.last_code
    
    def _use(self, key):
        if not key :
            return {}
        return self.context.get(key,{})
    
    def _paser(self, val):
        if isinstance(val, dict) :
            _val = dict(val.items())
            if val.get('$use') :
                _val.pop("$use")
                _v = self._eval(val['$use'])
                _val = dict(_val.items() + _v.items())
            #print "Headers ---> ", json.dumps(_val, indent=2)
            return _val
        elif isinstance(val, str) and val.find(r'\${') > -1:
            return self._render(val)
        return val
    
    def _render(self, tpl, _context=None):
        r'''模板渲染,返回值是一个str'''
        if not _context :
            _context = self.context
        result = renderTpl(tpl, _context)
        if isinstance(result, unicode) :
            result = result.encode()
        #print result
        return result
    
    def _eval(self, el_str):
        return el(el_str, self.context)
    
    def _render_headers_params(self, args):
        headers = self._paser(args.get('headers'))
        if not headers :
            headers = self.context['task']['headers']
        if args.get('cookie') :
            headers['Cookie'] = self._render(args['cookie'])
        new_headers = {}
        for k,v in headers.items() :
            #if k.startswith("Z_") :
            #    print v, type(v)
            if isinstance(v, str) or isinstance(v, unicode) :
                v = self._smart(v)
            else :
                v = str(v)
            new_headers[k] = v
        headers = new_headers
        params = {}
        if args.get('params') :
            for k,v in args['params'].items() :
                params[k] = self._render(str(v))
        #log.debug('Headers -->\n' + json.dumps(headers, indent=2))
        #log.debug('Params  -->\n' + json.dumps(params, indent=2))
        return (headers, params)
    
    def _smart(self, value, read_file=False):
        if not isinstance(value, str) and not isinstance(value, unicode) :
            return value
        if value.startswith('context:') :
            return self._eval(value[8:])
        if value.startswith('file:') :
            file_path = self._render(value[5:])
            if read_file :
                with open(file_path) as f :
                    return f.read()
            return file_path
        return self._render(value)
                
    
    def run_node(self, node):
        log.debug("Run node --> " + json.dumps(node, indent=2, ensure_ascii=False))
        try :
            node_type = node['type'].replace('.', '_')
            type_method = self.__getattribute__(node_type)
            args = node.get('args') or {'Nothing' : None}
            if node_type == 'control_switch' :
                self.last_code = type_method(args)
            else :
                _args = {}
                for k,v in args.items() :
                    if isinstance(v, str) :
                        v = self._render(v)
                    _args[k.replace('.', '_')] = v
                self.last_code = type_method(**args)
        except :
            log.error('Fail to execute node', exc_info=1)
            self.last_code = ERROR
        return self.last_code

    #---------------------------------------------------------------------------------------------
    #控制器

    def control_foreach(self, nodes, need_report=False):
        self.nodes_report = {'times' : []}
        i = 1 #特别定义一下
        for node_info in nodes :
            if node_info.get('node') :
                node = self.task['nodes'][node_info['node']]
            else :
                node = node_info
            self.nodes_report['step'] = i
            start_time = time.time()
            try :
                if self.run_node(node) :
                    if self.last_code in (SUCCESS, FAIL, ERROR) :
                        return self.last_code
                    elif self.last_code == LOOP_BREAK :
                        return NEXT_NODE
                #LOOP_NEXT对foreach无意义
            finally:
                self.nodes_report['times'].append((time.time() - start_time ) * 1000)
            i += 1
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
        for k,nodes in args.items() :
            if k != 'default' and eval(k, None, self.context) :
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
    def http_send(self, url=None, method='GET', reps_header=None, reps_body=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        resp = self.webclient.send(method, url, 
                            headers=headers, 
                            data=params)
        if not resp :
            log.error('Resp is NULL!!')
            return FAIL
        #log.debug('Resp code=%d, body=\n%s' % (resp.status, resp.read()))
        if resp.status >= 303 :
            log.error('Resp is None or resp.status > 303 !!')
            return FAIL
        if reps_header :
            hs = {}
            for header in resp.getheaders() :
                hs[header[0]] = header[1]
            self.context[reps_header] = hs
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
                        
    def ajax_upload(self, url=None, method='POST', file=None, **kwargs):
        headers, params = self._render_headers_params(kwargs)
        file_path = self._smart(file)
        #headers['Context-Length'] = str(os.path.getsize(file_path))
        with open(file_path, 'rb') as f :
            resp = self.webclient.post(url, headers, None, body=f)
        #log.debug('Ajax return = \n' + resp.read())
        if resp and resp.status == 200 :
            return NEXT_NODE
        else :
            return FAIL
    
    def img_make(self, file=None, width=800, height=640, bgcolor="#FF00FF", format='png'):
        file_path = self._smart(file)
        bgcolor = self._smart(bgcolor)
        file_path = os.path.abspath(file_path)
        if not os.path.exists(os.path.dirname(file_path)) :
            os.makedirs(os.path.dirname(file_path))
        if isinstance(bgcolor, str) and bgcolor.startswith("#") :
            bgcolor = bgcolor[1:]
            bgcolor = int(bgcolor, 16)
            bgcolor = bmp.Color.fromLong(bgcolor)
        else :
            bgcolor = bmp.Color.fromLong(int(bgcolor))
        log.info("Write image into path --> " + file_path)
        with open(file_path, 'w') as f :
            if format == 'png' :
                log.debug('Creating a png image ....')
                from vtest.client.helper import create_png
                create_png(file_path, width, height, r=bgcolor.red, g=bgcolor.grn, b=bgcolor.blu)
            else :
                log.debug('Creating a bmp image ....')
                img = bmp.BitMap( width, height, bgcolor)
                f.write(img.getBitmap())
        log.debug('Image info : size=%d , path=%s', os.path.getsize(file_path), file_path)
        return NEXT_NODE

    def json_parse(self, source='', dest=None):
        if source.startswith('context') :
            self.context[dest] = json.loads(self.context[source[8:]])
        elif source.startswith('file') :
            with open(self._render(source[5:])) as f :
                self.context[dest] = json.load(f)
        else :
            log.error('Not a vaild val -->' + source)
            return FAIL
        return NEXT_NODE

    def json_found(self, source=None, dest=None, tp=None, match=None):
        source = el(source, self.context)
        res = self._match(source, match, tp == 'list')
        self.context[dest] = res
        return NEXT_NODE
    
    def _match(self, source, match, return_list):
        if isinstance(source, list) :
            res = []
            for s in source :
                r = self._match(s, match, return_list)
                if r and len(r) :
                    if return_list :
                        res.append(s)
                    else :
                        return [s]
            return res
        if isinstance(source, dict) :
            res = []
            for s in source :
                flag = True
                for k,v in match.items() :
                    if not s.get(k) or s[k] != v :
                        flag = False
                        break
                if flag :
                    if return_list:
                        res.append(s)
                    else :
                        return [s]
            return res
        
        

    def set(self, name=None, value=None, remove=None):
        if remove :
            value = None
        _value = value
        from vtest.client.helper import to_python_el
        exec "ctx"+ to_python_el(name) + ' = _value'
        return NEXT_NODE
    
    def random(self, name=None, tp='int', min=0, max=1, values=None):
        import random as r
        if values :
            self.context[name] = r.sample(values, 1)
        else :
            if tp == 'int' :
                self.context[name] = r.randint(min, max)
            else :
                s = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPMNBVCXZLKJHGFDSA'
                self.context[name] = ''.join(r.sample(list(s), r.randint(min, max) or 1))
        #log.debug('Current context=\n' + json.dumps(self.context, indent=2))
        
    def extends(self, type_name=None, type_method=None):
        _self = self
        _context = self.context
        if type_name and type_method :
            _method = None
            exec type_method + '''\n_method = %s''' % type_name
            self.__dict__[type_name] = new.instancemethod(_method, self, None)
        elif type_method :
            exec type_method

    def segment(self, dest=None, tmpl=None, params=None):
        ps = {}
        for k,v in params.items() :
            if v.startswith('file:') :
                with open(self._render(v[5:])) as f :
                    ps[k] = f.read()
            elif v.startswith('context:') :
                v = self.context[v[8:]]
                if isinstance(v, str) :
                    ps[k] = v
                else :
                    ps[k] = json.dumps(v)
            else :
                ps[k] = self._render(v)
        with open(self._render(tmpl)) as f :
            self.context[dest] = self._render(f.read(), _context=ps)
                





