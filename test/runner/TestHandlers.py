'''
Created on 2011-12-2

@author: MingMing
'''
import unittest
import os
from vtest.client.handlers import BaseHandler 

class Test(unittest.TestCase):


    def test_img_make(self):
        img_path = '_img_make.bmp'
        if os.path.exists(img_path):
            os.remove(img_path)
        BaseHandler().img_make(img_path, 800, 480, 0, 255, 90)
        assert os.path.exists(img_path)
        assert os.path.getsize(img_path) > 1024

    def test_extends(self):
        type_method = '''
def abc(self, name) :
    print name
    return True
        '''
        exec type_method + '''\nglobals()['abc'] = abc'''
        print globals()['abc']
        import new
        print new.function(type_method, globals(), 'abc')

if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()