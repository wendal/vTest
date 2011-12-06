'''
Created on 2011-12-2

@author: MingMing
'''
import unittest
import os
from vtest.client.handlers import BaseHandler 
from vtest.client.handlers import SUCCESS 
import json

class Test(unittest.TestCase):

    
    def test_img_make(self):
        img_path = '_img_make.bmp'
        if os.path.exists(img_path):
            os.remove(img_path)
        with open('meta/base.json') as f :
            BaseHandler(json.load(f)).img_make(img_path, 800, 480, 0, 255, 90)
        assert os.path.exists(img_path)
        assert os.path.getsize(img_path) > 1024
    
    def test_extends(self):
        type_method = '''
def abc(self, name) :
    print name
    return True
        '''
        with open('meta/base.json') as f :
            b = BaseHandler(json.load(f))
            b.extends('abc', type_method)
            assert b.abc('wendal')
        
    def test_base(self):
        base_json = 'meta/base.json'
        with open(base_json) as f :
            task = json.load(f)
            BaseHandler(task)
            code = BaseHandler(task).run()
            print 'Exit code', code 
            assert SUCCESS == code

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()