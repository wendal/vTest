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
    var bodyJq = $(document.body);
    bodyJq.delegate(".ci", "click", vtest.events.ciClick);

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
            // 这里举个例子,通过Ajax获取数据,然后在回调中返回Grid需要的数据

        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {

        }
    });
    robotDiv.grid(robotConf);
    vtest.grid.robotGrid = robotDiv;
};

function showTask() {
    var taskDiv = $('.workspace .task .list', document.body);
    var taskConf = $.extend(true, {}, vtest.baseConf, {
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
            show: true
        }, {
            name: "ct",
            text: "创建时间",
            show: true
        }, {
            name: "lm",
            text: "最后更新",
            show: true
        }, {
            name: "done",
            text: "完成次数",
            show: true,
            width : 100
        }, {
            name: "nok",
            text: "成功次数",
            show: true,
            width : 100
        }, {
            name: "nfail",
            text: "失败次数",
            show: true,
            width : 100
        }],
        getData: function() {
            // 这里举个例子,通过Ajax获取数据,然后在回调中返回Grid需要的数据

        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {

        }
    });
    taskDiv.grid(taskConf);
    vtest.grid.taskGrid = taskDiv;
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
            show: true
        }, {
            name: "err",
            text: "运行结果",
            show: true
        }, {
            name: "step",
            text: "失败步骤",
            show: true
        }, {
            name: "total",
            text: "总耗时",
            show: true
        }],
        getData: function() {
            // 这里举个例子,通过Ajax获取数据,然后在回调中返回Grid需要的数据

        },
        getId: function(rowData) {
            return rowData.id;
        },
        afterActive: function(rowData) {

        }
    });
    reportDiv.grid(reportConf);
    vtest.grid.reportGrid = reportDiv;
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
        }
    },
    baseConf: {
        rowDD: true,
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
    }
};

$(document).ready(function() {
    // 初始化
    adjust();
    // 事件绑定
    bind();
    // 三个Grid展示
    showGrid();
    // 随着窗口变化调整
    window.onresize = adjust;
});
