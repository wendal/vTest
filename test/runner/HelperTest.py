# -*- coding: UTF-8 -*-
'''
Created on 2011-12-6

@author: MingMing
'''
import unittest


class Test(unittest.TestCase):


    #def test_obj(self):
    #    from vtest.client.helper import obj
    #    users = {'wendal' : {'age' : 26 , 'location' : ['广州','深圳']}}
    #    us = obj(users)
    #    assert us.wendal.age == 26
    #    assert us.wendal.location[1] == '深圳'

    def test_el(self):
        from vtest.client.helper import el
        context = {'wendal' : {'age' : 26 , 'location' : ['广州','深圳']}}
        assert el('wendal.age', context) == 26
        assert el('wendal.location[1]', context) == '深圳'
        print type(el('wendal.location', context))
        assert type(el('wendal', context)) == dict


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.test_obj']
    unittest.main()