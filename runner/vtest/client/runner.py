# -*- coding: UTF-8 -*-

import os, json, time
import DatabaseHelper as DB
import socket
from vtest.client.handlers import BaseHandler
import logging

log = logging.getLogger('runner')

def main():
    
    r'''加载配置文件,如果没有,就选默认的robot.cnf'''
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
    
    if not robot_conf.get('rid') :
        log.info('No robot id found, create it!!')
        conn, cur = DB.connect(db_info)
        sql = '''insert into t_robot(ipv4, hnm, prid, lm) values('%s', '%s', %d, now())''' % (socket.gethostbyname(socket.gethostname()),
                                             socket.gethostname(),
                                             os.getpid())
        print sql
        cur.execute(sql)
        conn.commit()
        robot_conf['rid'] = cur.getlastrowid()
        conn.close()
    else :
        renew_robot_status(robot_conf['rid'], db_info)
    log.info('Robot id = %d' % robot_conf['rid'])
    
    while 1 :
        print 'Scan new task ...'
        conn = None
        try :
            conn, cur = DB.connect(db_info)
            cur.execute('select id,detail from t_task where stat < 2 order by rand() limit 1')
            res = cur.fetchall()
            if res :
                record = {'id' : res[0][0], 'detail' : res[0][1]}
                log.info('Found a task , id=%d', record['id'])
                cur.execute('update t_task set lm=now() where id=%d' % record['id'])
                conn.commit()
                conn.close()
                start_task(record, robot_conf, db_info)
                log.info('Task is Done, great!!')
            else :
                log.info('No task found ....')
        except :
            log.error('Fail to execute task?!!', exc_info=1)
            DB.rollback(conn)
        finally:
            DB.close(conn)
        
        renew_robot_status(robot_conf['rid'], db_info)
        
        log.info('Sleep 1s ... ... ...')
        time.sleep(1)
    
    
def start_task(record, robot_conf, db_info):
    start_time = time.time()
    
    try :
        err = 0
        dura = ''
        step = 0
        msg = None
        
        task_d = json.loads(record['detail'])
        
        h = BaseHandler(task_d, robot_conf)
        from vtest.client.handlers import SUCCESS, FAIL
        try :
            result = h.run()
            if result == SUCCESS :
                err = 0
            elif result == FAIL :
                err = 1
            else :
                err = 2
            dura = ','.join([str(t) for t in h.nodes_report['times']])
            if err :
                step = h.nodes_report['step']
                msg = h.last_msg
        except :
            log.error('Fail to start new task', exc_info=1)
        time_used = (time.time() - start_time) * 1000
        log.info('Time use = %dms' % time_used)
        conn = None
        try :
            conn, cur = DB.connect(db_info)
            cur.execute('''insert into t_task_re(rid,tid,lm,err,step,msg,total,dura) values(%d,%d,now(),%d,%d,'%s',%d,'%s')''' % 
                        (robot_conf['rid'], record['id'], err, step, msg, time_used, dura))
            if err == 0 :
                cur.execute('''update t_task set done=done+1 , nok=nok+1 where id=%d''' % record['id'])
            else :
                cur.execute('''update t_task set done=done+1 , nfail=nfail+1 where id=%d''' % record['id'])
            cur.execute('''update t_task set stat=2 where done >= fnn''')
            conn.commit()
            log.info('Task done and update t_task_re success')
        except :
            log.error('Fail to update task status?!!', exc_info=1)
        finally:
            DB.close(conn)
    except :
        raise
        log.error('Fail to execute task?!!', exc_info=1)
        
def renew_robot_status(rid, db_info):
    sql = '''update t_robot set ipv4='%s', hnm='%s', prid=%d where id=%d ''' % (socket.gethostbyname(socket.gethostname()),
                                             socket.gethostname(),
                                             os.getpid(),
                                             rid)
    conn = None
    try :
        conn, cur = DB.connect(db_info)
        cur.execute(sql)
        conn.commit()
    except :
        log.error('Fail to renew robot status!!', exc_info=1)
    finally:
        DB.close(conn)
