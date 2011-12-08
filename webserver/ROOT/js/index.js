function adjust() {
    // 初始化
    var winBox = z.winsz();
    var vheadBox = $('.vhead').boxing();
    var vfooterBox = $('.vfooter').boxing();
    var vBBHeight = winBox.height - vheadBox.height - vfooterBox.height;
    var vBBWidth = winBox.width;
    $('.vbody').css({
        width: vBBWidth * 3,
        height: vBBHeight,
        top: vheadBox.height
    });
    // vbody需要三个盒子，大小相等
    $('.vbody .workspace').css({
        width: vBBWidth,
        height: vBBHeight
    });
    // 激活的盒子调整到当前窗口中
    $('.vbody').css({
        left: winBox.width * vtest.po * -1
    });
    // 盒子内部调整
    var robotDiv = $('.workspace .innerworkspace', document.body);
    var wsbox = robotDiv.boxing();
    var h3 = $('h3', robotDiv);
    var left = $('.left_ws', robotDiv);
    var right = $('.right_ws', robotDiv);
    var h3box = h3.boxing();
    var leftbox = left.boxing();
    var rightbox = right.boxing();
    // css
    left.css({
        height: wsbox.height - h3box.height,
        width: wsbox.width - rightbox.width
    });
    right.css({
        height: wsbox.height - h3box.height
    });
    // left_ws调整
    var list = $('.list', left);
    var bottonsBox = $('.bottons', left).boxing();
    list.css({
        height: wsbox.height - h3box.height - bottonsBox.height
    });
    // Grid调整
    if(vtest.grid.robotGrid) {
        vtest.grid.robotGrid.grid("resize");
    }
    if(vtest.grid.taskGrid) {
        vtest.grid.taskGrid.grid("resize");
    }
    if(vtest.grid.reportGrid) {
        vtest.grid.reportGrid.grid("resize");
    }
};

function bind() {
    // head部分
    var bodyJq = $(document.body);
    bodyJq.delegate(".ci", "click", vtest.events.ciClick);
    // grid的刷新
    var bottons = $('.bottons');
    bottons.delegate(".ref", "click", vtest.events.refresh);
    bottons.delegate(".ref_time", "click", vtest.events.refreshTime);
    // 输入框只能输入数字
    $("input.number", bodyJq).keypress(function(event) {
        var keyCode = event.keyCode;
        if((keyCode >= 48 && keyCode <= 57)) {
            event.returnValue = true;
        } else {
            event.returnValue = false;
        }
    });
    // 查看report
    var reportEditDiv = $('.workspace .report .right_ws', bodyJq);
    reportEditDiv.delegate("table tbody td a", "click", vtest.events.showReportErrMsg);
};

function fontWithColor(msg, color) {
    return '<span style="color:' + color + ';">' + msg + '</span>';
};

function showGrid() {
    showRobot();
    showTask();
    showReport();
};

function showRobot() {
    var robotDiv = $('.workspace .robot .list', document.body);
    var robotConf = $.extend(true, {}, vtest.baseConf, {
        columns: [{
            name: "id",
            text: "主键",
            show: false,
            width: 100
        }, {
            name: "ipv4",
            text: "IP地址",
            show: true
        }, {
            name: "hnm",
            text: "机器名称",
            show: true
        }, {
            name: "prid",
            text: "进程号",
            show: true
        }, {
            name: "lm",
            text: "最后更新",
            show: true
        }],
        getData: function() {
            var gridJq = this;
            $.getJSON('robot/list', function(data) {
                gridJq.grid('load', {
                    rowDatas: data
                });
                // 如果有数据的话，选中第一个
                if(data.length > 0) {
                    gridJq.grid('activeRow', 0);
                }
            });
        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {
            showRobotDetail(rowData);
        }
    });
    robotDiv.grid(robotConf);
    vtest.grid.robotGrid = robotDiv;
    // 右边编辑框
    var editDiv = $('.workspace .robot .right_ws', document.body);
    editDiv.append('<h2>没有选中信息!</h2>');
};

function showRobotDetail(rowData) {
    var editDiv = $('.workspace .robot .right_ws', document.body);
    editDiv.empty();
    //
    var rohtml = '<div class="imgs"><img src="../css/robot_128.png"></div>';
    rohtml += '<div class="infolist">';
    rohtml += '<table cellspacing="0" cellpadding="0" border="0"><tbody>';
    rohtml += '<tr><td class="tkey">IPv4地址</td><td class="tvalue">' + rowData.ipv4 + '</td></tr>';
    rohtml += '<tr><td class="tkey">机器人名称</td><td class="tvalue">' + rowData.hnm + '</td></tr>';
    rohtml += '<tr><td class="tkey">进程号</td><td class="tvalue">' + rowData.prid + '</td></tr>';
    rohtml += '<tr><td class="tkey">最后心跳时间</td><td class="tvalue">' + rowData.lm + '</td></tr>';
    rohtml += '</tbody></table>';
    rohtml += '</div>';
    editDiv.append(rohtml);
};

function showTask() {
    var taskDiv = $('.workspace .task .list', document.body);
    var taskConf = $.extend(true, {}, vtest.baseConf, {
        hideCols: true,
        columns: [{
            name: "id",
            text: "主键",
            show: false,
            width: 100
        }, {
            name: "name",
            text: "任务名称",
            show: true
        }, {
            name: "stat",
            text: "任务状态",
            show: true,
            cellHtml: function(rowData) {
                // 任务状态，0 新创建，1 开始执行，2 已经完成
                var re = rowData[this.name];
                if(re == 0) {
                    return "新创建";
                } else if(re == 1) {
                    return "开始执行";
                } else if(re == 2) {
                    return "已经完成";
                } else {
                    return "未知状态";
                }
            }
        }, {
            name: "ct",
            text: "创建时间",
            show: true,
            width: 145
        }, {
            name: "lm",
            text: "最后更新",
            show: true,
            width: 145
        }, {
            name: "done",
            text: "完成",
            show: true,
            width: 50
        }, {
            name: "nok",
            text: "成功",
            show: true,
            width: 50
        }, {
            name: "nfail",
            text: "失败",
            show: true,
            width: 50
        }, {
            name: "fnn",
            text: "状态",
            show: true,
            width: 80,
            cellHtml: function(rowData) {
                // 表示 done>= 多少后，这个任务算完成
                var re = rowData[this.name];
                var done = rowData['done'];
                if(done >= re) {
                    return fontWithColor('任务完成', 'green');
                } else {
                    return "任务未完成";
                }
            }
        }],
        getData: function() {
            var gridJq = this;
            $.getJSON('task/list', function(data) {
                gridJq.grid('load', {
                    rowDatas: data
                });
                // 如果有数据的话，选中第一个
                if(data.length > 0) {
                    gridJq.grid('activeRow', 0);
                }
            });
        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {

        }
    });
    taskDiv.grid(taskConf);
    vtest.grid.taskGrid = taskDiv;
    // 右边编辑框
    var editDiv = $('.workspace .task .right_ws', document.body);
    editDiv.append('<h2>没有选中信息!</h2>');
};

function showReport() {
    var reportDiv = $('.workspace .report .list', document.body);
    var reportConf = $.extend(true, {}, vtest.baseConf, {
        columns: [{
            name: "id",
            text: "主键",
            show: false,
            width: 100
        }, {
            name: "rid",
            text: "机器人ID",
            show: true
        }, {
            name: "tid",
            text: "任务ID",
            show: true
        }, {
            name: "lm",
            text: "最后更新",
            show: true,
            width: 145
        }, {
            name: "err",
            text: "运行结果",
            show: true,
            width: 80,
            cellHtml: function(rowData) {
                // 结果类型 0 表示成功，1 表示任务失败, 2 表示内部错误
                var re = rowData[this.name];
                if(re == 0) {
                    return fontWithColor('成功', 'green');
                } else if(re == 1) {
                    return fontWithColor('失败', 'red');
                } else if(re == 2) {
                    return fontWithColor('内部错误', 'yellow');
                } else {
                    return "未知状态";
                }
            }
        }, {
            name: "step",
            text: "失败步骤",
            show: true,
            cellHtml: function(rowData) {
                // 第几步失败的，0 表示没有失败，>0 表示第几步失败
                var re = rowData[this.name];
                if(re == 0) {
                    return "没有失败";
                } else {
                    return "第" + fontWithColor(re + '', 'red') + "步操作出现错误";
                }
            }
        }, {
            name: "total",
            text: "总耗时",
            show: true,
            cellHtml: function(rowData) {
                // 单位 ms
                var re = rowData[this.name];
                return fontWithColor(re + '', '#A53688') + "毫秒";
            }
        }],
        getData: function() {
            var gridJq = this;
            $.getJSON('report/list', function(data) {
                gridJq.grid('load', {
                    rowDatas: data
                });
                // 如果有数据的话，选中第一个
                if(data.length > 0) {
                    gridJq.grid('activeRow', 0);
                }
            });
        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {
            showReportDetail(rowData);
        }
    });
    reportDiv.grid(reportConf);
    vtest.grid.reportGrid = reportDiv;
    // 右边编辑框
    var editDiv = $('.workspace .report .right_ws', document.body);
    editDiv.append('<h2>没有选中信息!</h2>');
};

function showReportDetail(rowData) {
    var editDiv = $('.workspace .report .right_ws', document.body);
    editDiv.empty();
    //
    var rohtml = '<div class="imgs"><img src="../css/report_128.png"></div>';
    rohtml += '<div class="infolist">';
    rohtml += '<table cellspacing="0" cellpadding="0" border="0">';
    rohtml += '<thead><tr><td>步骤</td><td>耗时</td><td>结果</td><td>错误</td></tr></thead>';
    rohtml += '<tbody>';
    var duras = rowData.dura.split(",");
    var step = rowData.step;
    //字符分割
    for( i = 0, j = 1; i < duras.length; i++, j++) {
        rohtml += '<tr><td class="tkey">第 ' + fontWithColor(j + '', 'red') + ' 步</td>';
        rohtml += '<td class="tvalue">' + fontWithColor(duras[i] + '', '#A53688') + '毫秒</td>';
        if(step != 0 && step == j) {
            rohtml += '<td class="tvalue">' + fontWithColor('失败', 'red') + '</td>';
            rohtml += '<td class="tvalue"><a>查看</a></td>';
        }else{
            rohtml += '<td class="tvalue">成功</td>';
            rohtml += '<td class="tvalue"></td>';
        }
        rohtml += '</tr>';
    }
    rohtml += '</tbody></table>';
    rohtml += '</div>';
    editDiv.append(rohtml);
    // 数据绑定
    vtest.reportErrMsg = rowData.msg;
};

window.vtest = {
    po: 0,
    events: {
        ciClick: function() {
            var ci = $(this);
            var po = z.getIntAttr(ci, 'po');
            if(!ci.hasClass('active')) {
                // 激活自己
                $('.ci', ci.parent().parent()).removeClass('active').children().removeClass('active');
                ci.addClass('active');
                ci.children().first().addClass('active');
                // 移动vbody
                var winBox = z.winsz();
                vtest.po = po;
                $('.vbody', document.body).animate({
                    left: winBox.width * po * -1
                }, 300, function() {
                });
            }
        },
        refresh: function() {
            var ref = $(this);
            var gridName = ref.attr('grid');
            var grid = vtest.grid[gridName + "Grid"];
            var icon = $('i', ref);
            icon.addClass('yes');
            icon.oneTime('300ms', function() {
                icon.removeClass('yes');
            })
            grid.grid("reload");
        },
        refreshTime: function() {
            var ref = $(this);
            var gridName = ref.attr('grid');
            var grid = vtest.grid[gridName + "Grid"];
            var input = $('input', ref.parent().parent());
            var countdown = $('.countdown', ref.parent().parent());
            var icon = $('i', ref);
            if(icon.hasClass('yes')) {
                icon.removeClass("yes");
                $('b', ref).first().html("定时刷新(关闭)");
                countdown.pause();
                input.show();
                countdown.hide();
            } else {
                icon.addClass("yes");
                $('b', ref).first().html("定时刷新(开启)");
                var time = z.getIntAttr(input, "value");
                if(time) {
                    input.hide();
                    countdown.show();
                    countdown.CRcountDown({
                        startNumber: time,
                        callBack: function() {
                            grid.grid("reload");
                        },
                        redo: true
                    });
                }
            }
        },
        showReportErrMsg : function(){
            alert(vtest.reportErrMsg);
        }
    },
    baseConf: {
        rowDD: false,
        colDD: true,
        multiSelect: true,
        hideCols: false,
        orderable: true,
        resizable: true,
        columns: null,
        getData: null,
        getId: null,
        beforeActive: null,
        afterActive: null,
        moveTo: null
    },
    grid: {
        robotGrid: null,
        taskGrid: null,
        reportGrid: null
    },
    reportErrMsg : null
};

$(document).ready(function() {
    // 初始化
    adjust();
    // 三个Grid展示
    showGrid();
    // 事件绑定
    bind();
    // 随着窗口变化调整
    window.onresize = adjust;
});
