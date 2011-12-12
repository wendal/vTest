'''
Created on 2011-12-5

@author: MingMing
'''

import os,sys,json,time
import DatabaseHelper as DB
from vtest.client.helper import init_log
import socket
from vtest.client.handlers import BaseHandler

log = None

def main():
    conf_path = os.getenv('vtest.robot.cnf', 'robot.cnf')
    global robot_conf 
    with open(conf_path) as f :
        robot_conf = json.load(f)
    if not robot_conf.get('tmp') :
        robot_conf['tmp'] = '/tmp/'
    log = init_log(name='main', file_name= ('%s/main.%d.log' % (robot_conf['tmp'] , os.getpid())))
    global db_info
    db_info = robot_conf['dbinfo']
    my_id = robot_conf.get('rid')
    if my_id == None :
        log.info('No robot id found, create it!!')
        conn, cur = DB.connect(db_info)
        cur.execute('''insert into t_robot(ipv4, hnm, prid, lm) values('%s', '%s', %d, now())''' %
                                            (socket.gethostbyname(socket.gethostname()),
                                             socket.gethostname(),
                                             os.getpid())
                        )
        conn.commit()
        robot_conf['rid'] = cur.getlastrowid()
    #    with open(conf_path, 'w') as f :
    #        json.dump(robot_conf, f, ensure_ascii=False, indent=2)
    #else :
    #    conn, cur = DB.connect(db_info)
    #    cur.execute('''update t_robot ipv4='%s', hnm='%s', prid=%d where id=%d ''' %
    #                                        (socket.gethostbyname(socket.gethostname()),
    #                                         socket.gethostname(),
    #                                         os.getpid(),
    #                                         my_id)
    #                )
    
    while 1 :
        print 'Scan new task ...'
        conn = None
        try :
            conn, cur = DB.connect(db_info)
            cur.execute('select * from t_task where stat < 2 order by rand() limit 1')
            res = cur.fetchall()
            if res :
                record = res[0]
                log.info('Found a task --> \n%s', json.dumps(record, indent=2, ensure_ascii=False))
                cur.execute('update t_task set lm=now() where id=%d' % record['id'])
                conn.commit()
                conn.close()
                start_task(record, robot_conf['rid'])
            else :
                log.info('No task found ....')
        except :
            DB.rollback(conn)
            log.error('Fail to execute task?!!', exc_info=1)
        finally:
            DB.close(conn)
        print 'Sleep 1s'
        time.sleep(1)
    
    
def start_task(record, rid):
    start_time = time.time()
    
    try :
        err = 0
        dura = ''
        step = 0
        msg = None
        task_d = json.loads(record['detail'])
        h = BaseHandler(task_d)
        from vtest.client.handlers import SUCCESS,FAIL
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
            pass
        time_used =  (time.time() - start_time) / 100.0
        conn = None
        try :
            conn, cur = DB.connect(db_info)
            cur.execute('''insert into t_task_re(rid,tid,lm,err,step,msg,total,dura) values(%s,%s,now(),%d,%d,%s,%d,%s)''',
                        [rid,record['id'],err,step,msg,time_used, dura])
            conn.commit()
        except :
            log.error('Fail to update task status?!!')
        finally:
            DB.close(conn)
    except :
        log.error('Fail to execute task?!!', exc_info=1)
        
    
    

if __name__ == '__main__':
    main()