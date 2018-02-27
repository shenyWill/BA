import pop from 'scss/customer/pop.scss';
import serviceData from 'build_js/api/index';
import Validte from 'build_js/modules/validate';
import formData from 'build_js/modules/formData';
import base from 'build_js/modules/base';
var popBindCellphone = require("build_js/hbs/popBindCellphone.hbs"); 
'use strict';
const Pop = {
    /* 判断是否需要弹窗（含联合登录） */
    getPopFn:function(btn){
        window.beforeId = window.formId || $('#popSecurityBindEmail');
        const _self = this;
        const url = serviceData.requestURL.bindStatusUrl;
        let messageTips = '为了保护您的账号安全，完成绑定手机有机会获取到大礼包';
        try{
            messageTips = $('#popBindTips').html() || '';
        }catch(e){}
        const isBind = base.getCookie('isBindStatus');
        if(isBind == 1 && !btn) {
            window.formId = beforeId;
            return false;/* 一天弹窗一次 */
        }
        serviceData.requestdata(url, {}, function (req) {
            if(req.ret == 2){
                let union = req.is_union || '';
                //弹窗绑定
                var text = popBindCellphone({
                    message:messageTips,
                    isUnionLogin : union
                });
                easyDialog.open({
                    container: {
                        header: '绑定手机',
                        content: text,
                        yesFn: false,
                        noFn: false
                    }
                });
                $('.easyDialog_wrapper').addClass('rebuy-alert bind-alert'); //区分弹窗插件样式
                window.formId = $('#popSecurityBindEmail');
                if (!$(formId).find('.j-captcha').length) return false;
                formData.getCode();
                formData.validte();
                formData.codeReflush();
                formData.getPhoneCode();
                _self.securityBindSubmit('bind-alert');
                _self.closeFn();
                base.setCookie('isBindStatus','1');
                return true;
            }else{
                //easyDialog.close();
                base.delCookie('isBindStatus');
                return true;
            }
        })
    },
    /* 关闭 */
    closeFn:function(){
        $('#closeBtn').on('click',function(){
            window.formId = beforeId;
            base.setCookie('isBindStatus','1');
        })
    },
    /* 绑定手机号验证和绑定邮箱身份验证 */
    securityBindSubmit: function (bind) {
        $(".security-item-type").on('click', function () {

            const type = $(this).attr('data-type');
            const errtips = $(formId).find('.accout-error-all');
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            var url = serviceData.requestURL.securityAuthUrl;
            //console.log(type)
            if(type == 'bind-cellphone'){
                url = serviceData.requestURL.bindCellphoneAuthUrl;
                bind = true;
            }
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const _this = $(this);
            if(_this.attr('disabled')){
                return false;
            }
            _this.attr('disabled','disabled');
            serviceData.requestdata(url, argument, function (data) {
                _this.removeAttr('disabled');
                if (data.ret == 1) {
                    if(type == 'bind-cellphone' && $('#coupon-popup').length && data.need_popover == 1){
                        easyDialog.open({
                            container: 'coupon-popup'
                        });
                        $('#coupon-popup').on('click','.coupon-popup-button',function(){
                            base.setCookieFn();
                            serviceData.reload();
                        })
                    }else{
                        base.setCookieFn();
                        serviceData.reload();
                    }
                    
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    }
}
export default  Pop;