# -*- coding: UTF-8 -*-

#######################################################################################
#这个模块用于实现与Java中的JsonAction进行通信,by wendal
#######################################################################################

import mysql.connector

def connect(config):
    conn = mysql.connector.Connect(**config)
    cur = conn.cursor()
    cur.execute('SET AUTOCOMMIT = 0')
    return (conn,cur)

def queryOne(cur,sql):
    cur.execute(sql)
    db_re = cur.fetchall()
    if len(db_re) == 0:
        return None
    return db_re[0]

def commit(conn):
    if conn:
        try:
            conn.commit()
        except:
            pass

def close(conn):
    if conn:
        try:
            conn.close()
        except:
            pass

def rollback(conn):
    if conn:
        try:
            conn.rollback()
        except:
            pass

'''
开启事务
'''
def begin(cur):
    cur.execute('''START TRANSACTION WITH CONSISTENT SNAPSHOT''')

#封装MySQL连接器的executemany,原方法实在太蛋疼
def executemany(cur,sql,params):
    n_params = []
    if isinstance(params,list) or isinstance(params,tuple): #恩,是列表
        _FLAG = True
        for param in params:
            if _FLAG and (isinstance(param,list) or isinstance(param,dict) or isinstance(param,tuple)):
                return cur.executemany(sql,params)
            n_params.append((str(param),))
            _FLAG = False
        return cur.executemany(sql,n_params)
    elif isinstance(params,dict):
        for k,v in params:
            n_params.append([k,v])
        return cur.executemany(sql,n_params)
    return cur.executemany(sql,params)