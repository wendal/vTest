{
    server  : 'http://192.168.1.11:8080',     // Domain 服务器地址
    task    : {                               // 任务上下文的初始值
        "headers"     : {
            "User-Agent" : "Strato Robot",
            ...
        }
    },
    steps : [                                // 任务列表，每个对象都是一个节点
        // 有两种节点, 普通节点和控制节点
        // 每个节点都有一个返回值 
        // 默认值 NEXT_NODE(继续下一个node),
        // SUCCESS(成功),,FAIL(任务失败),ERROR(内部错误) -- 全部导致任务结束
        // 仅供控制节点使用 -- LOOP_BREAK(退出循环),LOOP_NEXT(进入下一次循环)
        //....................................................................
        {
            node : "login" //引用全局节点定义,如果存在其他普通参数,则合并之
        },
        //....................................................................
        {
            //这是一个匿名的普通节点
            brief : '发送 AJAX 请求得到根目录的列表',        //可选
            type  : 'http.send',
            args  : {
                "url"     : "/ajax/ls",
                "method"  : "GET",
                "headers"     : { $use : "task.headers" },   // 复用全局设置
                "reps-headers-name" : "http_reps_headers",    // 请求服务器给出的响应 header，存放在任务上下文的键值
                "reps-body" : "context:JsonObj"               // 请求返回的内容存放的在任务上下文中的键值
            }
        },
        {
            //这是一个控制节点
            brief : '循环获取一个node列表',
            type  : 'control.loop',
            args  : {
                "var-index" : "i",      // 循环计数，在上下文中的名字
                "start" : 0,            // 开始计数
                "end"   : 10,           // 计数最大值（不包含），相当于 for(i=start;i<end;i++)
                "delay" : 100,          // 每次循环，延迟多少 ms，默认为不延迟
                "run"   : [             // 每次循环执行的内容
                    { node : '' }, 
                    { brief:'...',  type:'xxx', args:{...} }, 
                    ...
                ]
            }
        },
        //....................................................................
        
        //如果最后一步仍返回NEXT_NODE,则认为是SUCCESS
    ] ,// end steps
    nodes : {            //定义可重用的节点
        "login" : {
            brief : '登录',
            type  : 'http.send',        // 任务类型
            args  : {                   // 任务参数表
                "url"         : '/do/login',
                "method"      : "POST",
                "headers"     : { $use : "task.headers" },   // 复用全局设置
                "params"      : {
                    "dmn"  : "danoo",
                    "unm"  : "danoo",
                    "pwd"  : "123456"
                },
                "reps-headers-name" : "http_reps_headers",    // 请求服务器给出的响应 header，存放在任务上下文的键值
                "reps-body" : "file:${tmp}/httpre.body"       // 请求返回的内容存放的位置
            }
        },
        
        //内置节点
        "exit.success" : {
            brief : '任务成功完成',
            type : 'exit.success'
        },
        "exit.fail" : {
            brief : '任务失败',
            type : 'exit.fail'
        },
        "control.break" : {
            brief : '退出循环',
            type : 'control.break'
        },
        "control.next" : {
            brief : '继续下一次循环',
            type : 'control.next'
        },
    }
} 