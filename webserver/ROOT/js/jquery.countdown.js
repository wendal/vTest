$(function() {
    jQuery.fn.countDown = function(settings, to) {
        if(!to && to != settings.endNumber) {
            to = settings.startNumber;
        }
        this.data("CR_currentTime", to);
        $(this).text(to).animate({
            "none": "none"
        }, settings.duration, '', function() {
            if(to > settings.endNumber) {
                $(this).countDown(settings, to - 1);
            } else {
                settings.callBack(this);
                if(settings.redo) {
                    $(this).countDown(settings);
                }
            }
        });
        return this;
    };
    //计时&&重新计时
    jQuery.fn.CRcountDown = function(settings) {
        settings = jQuery.extend({
            startNumber: 10,
            endNumber: 0,
            duration: 1000,
            callBack: function() {
            },
            redo: false
        }, settings);
        this.data("CR_duration", settings.duration);
        this.data("CR_endNumber", settings.endNumber);
        this.data("CR_callBack", settings.callBack);
        return this.stop().countDown(settings);
    };
    //计时暂停
    jQuery.fn.pause = function(settings) {
        return this.stop();
    };
    //暂停后，重新开始
    jQuery.fn.reStart = function() {
        return this.pause().CRcountDown({
            startNumber: this.data("CR_currentTime"),
            duration: this.data("CR_duration"),
            endNumber: this.data("CR_endNumber"),
            callBack: this.data("CR_callBack")
        });
    };
})