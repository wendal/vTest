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
};

var events = {
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
            $('.vbody', document.body).animate({
                left: winBox.width * po * -1
            }, 300, function() {
            });
        }
    }
};

function bind() {
    var bodyJq = $(document.body);
    bodyJq.delegate(".ci", "click", events.ciClick);

};


$(document).ready(function() {
    // 初始化
    adjust();
    // 随着窗口变化调整
    window.onresize = adjust;
    // 事件绑定
    bind();
});
