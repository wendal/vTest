'''
Created on 2011-12-2

@author: MingMing
'''
import unittest
import os

class Test(unittest.TestCase):


    def test_img_make(self):
        from vtest.client.handlers import img_make 
        h = img_make()
        img_path = '_img_make.bmp'
        if os.path.exists(img_path):
            os.remove(img_path)
        h.run(img_path, 800, 480, 0, 255, 90)
        assert os.path.exists(img_path)
        assert os.path.getsize(img_path) > 1024


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()