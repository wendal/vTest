(function($) {
var str = (window.navigator.userAgent + "").toLowerCase();

window.os = {
    mac: str.match(/.*mac os.*/) ? true : false,
    pc: str.match(/.*mac os.*/) ? false : true,
};

var KEYS = {
    "16": "shift",
    "18": "alt"
};

if($.browser.webkit) {
    KEYS[os.mac ? "91" : "17"] = "ctrl";
} else {
    KEYS[os.mac && !$.browser.opera ? "224" : "17"] = "ctrl";
}

window.z = {
    /**
     * 获得数字型的属性
     */
    getIntAttr: function(obj, attName) {
        return parseInt(obj.attr(attName));
    },
    winsz: function() {
        if(window.innerWidth) {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        if(document.documentElement) {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        }
        return {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
    },
    msg: function(msg) {
        return msg;
    },
    uname: function(str) {
        return {
            className: '45465',
            name: '123',
            text: str
        };
    },
    sNull: function(str, def) {
        return str ? "" + str : ( def ? def : "");
    },
    /**
     * 获取当前窗口系统滚动条的宽度
     */
    scrollBarWidth: function() {
        var newDivOut = "<div id='div_out' style='position:relative;width:100px;height:100px;overflow-y:scroll;overflow-x:scroll'></div>"
        var newDivIn = "<div id='div_in' style='position:absolute;width:100%;height:100%;'></div>";
        var scrollWidth = 0;
        $("body").append(newDivOut);
        $("#div_out").append(newDivIn);
        var divOutS = $("#div_out").boxing();
        var divInS = $("#div_in").boxing();
        scrollWidth = divOutS.width - divInS.width;
        $("#div_out").remove();
        $("#div_in").remove();
        return scrollWidth;
    },
    /**
     * 监控键盘事件
     */
    watchKeyboard: function() {
        if(!window.keyboard) {
            window.keyboard = {};
            // 创建状态显示图标，需要 DOM 中存在 ".liveinfo .keyboard" 选择器
            for(var keyCode in KEYS) {
                var key = KEYS[keyCode];
            }
            // 监视键盘事件
            $(window).keydown(function(e) {
                var key = KEYS["" + e.which];
                if(key) {
                    window.keyboard[key] = true;
                }
            }).keyup(function(e) {
                var key = KEYS["" + e.which];
                if(key) {
                    window.keyboard[key] = false;
                }
            });
        }
    },
};

z.watchKeyboard();

})(window.jQuery)