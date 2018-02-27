// var $ = jQuery.noConflict();
$.fn.Timecountdown = function(options){
    return this.each(function(index,element){
        var $this = $(this);
        var _self_ = this;
        _self_.totalTime = options && options.totalTime ? options.totalTime :  (parseInt($this.attr("data-total-time")) ? parseInt($this.attr("data-total-time")) : 0);
        _self_.countdownTime = _self_.totalTime;
        _self_.pastTime = 0;
        _self_.startTime = new Date().getTime();
        _self_.timer = null;

        var daysDivisor,hoursDivisor,minutesDivisor,secondsDivisor;
        daysDivisor = 24 * 60 * 60 * 1000;
        hoursDivisor = 60 * 60 * 1000;
        minutesDivisor = 60 * 1000;
        secondsDivisor = 1000;
        function getCNSurplusTime(surplusTime){
            var days,hours,minutes,seconds;
            days = Math.floor(surplusTime / daysDivisor);
            hours = Math.floor((surplusTime - days * daysDivisor)/hoursDivisor);
            minutes = Math.floor((surplusTime - days * daysDivisor - hours * hoursDivisor) / minutesDivisor);
            seconds = Math.floor((surplusTime - days * daysDivisor - hours * hoursDivisor - minutes * minutesDivisor) / secondsDivisor );
            return paddingTime(days) + "天"+ paddingTime(hours) + "时" + paddingTime(minutes) + "分" + paddingTime(seconds) + "秒"
        }
        function paddingTime(time){
            var timeStr = time.toString();
            if(timeStr.length == 1){
                return "0"+timeStr;
            }else{
                return timeStr;
            }
        }
        function doCallback(){
            if(options && options.callback && typeof options.callback === "function"){
                options.callback.call(_self_);
            }
            _self_.countdownTime = 0;
            clearInterval(_self_.timer);
        }
        function setCountdownText(){
            var CNSruplusTime = getCNSurplusTime(_self_.countdownTime);
            $this.text(CNSruplusTime);
        }
        if(_self_.totalTime > 0){
            setCountdownText();
            _self_.timer = setInterval(function(){
                _self_.pastTime = new Date().getTime() - _self_.startTime;
                _self_.countdownTime = _self_.totalTime - _self_.pastTime;
                _self_.countdownTime <= 0 ? doCallback() : false;
                setCountdownText();
            }, 1000);
        }else{
            doCallback();
        }
    });
}


