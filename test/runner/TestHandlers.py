'''
Created on 2011-12-2

@author: MingMing
'''
import unittest
import os
from vtest.client.handlers import BaseHandler 
from vtest.client.handlers import SUCCESS 
import json

with open('meta/base.json') as f :
    h = BaseHandler(json.load(f))

class Test(unittest.TestCase):

    def test_img_make(self):
        img_path = '_img_make.bmp'
        if os.path.exists(img_path):
            os.remove(img_path)
        h.img_make(img_path, 800, 480, 0, 255, 90)
        assert os.path.exists(img_path)
        assert os.path.getsize(img_path) > 1024
    
    def test_extends(self):
        type_method = '''
def abc(self, name) :
    print name
    return True
        '''
        h.extends('abc', type_method)
        assert h.abc('wendal')
        
    def test_base(self):
        code = h.run()
        print 'Exit code', code 
        assert SUCCESS == code
    
    def test_random(self):
        assert not h.random("wendal_int", 'int', 10, 30, None)
        print h.context['wendal_int']
        assert h.context['wendal_int']
        assert h.context['wendal_int'] >= 10
        assert h.context['wendal_int'] <= 30
        
        assert not h.random("wendal_str", 'string', 1, 30, None)
        print h.context['wendal_str']
        assert h.context['wendal_str']
        assert len(h.context['wendal_str']) >= 1
        assert len(h.context['wendal_str']) <= 30

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()