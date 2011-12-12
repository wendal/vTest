# -*- coding: UTF-8 -*-
import os, json

if __name__ == '__main__':
    conf_path = os.getenv('vtest.robot.cnf', 'robot.cnf')
    robot_conf = {}
    with open(conf_path) as f :
        for line in f :
            if line.startswith('#') :
                continue
            if line.find('=') :
                line = line[0:-1]
                key = line[0:line.find('=')]
                value = line[(line.find('=') + 1):]
                robot_conf[key] = value
    print 'Robot conf :\n',json.dumps(robot_conf, indent=2)
    if not robot_conf.get('tmp') :
        robot_conf['tmp'] = '/tmp/'
    db_info = {
               'host' : robot_conf.get('db_host','127.0.0.1'),
               'port' : int(robot_conf.get('db_port','3306')),
               'user' : robot_conf.get('db_username','root'),
               'password' : robot_conf.get('db_password','123456'),
               'database' : robot_conf.get('db_name','vtest'),
               'charset'       : 'utf8',
               'use_unicode'   : True,
               'get_warnings'  : False
               }
    from vtest.client.helper import init_log
    init_log(None, '%s/vtest_main.log' % robot_conf['tmp'])
    from vtest.client import runner
    runner.main(robot_conf, db_info)
    