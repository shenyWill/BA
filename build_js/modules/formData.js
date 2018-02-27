import serviceData from 'build_js/api/index';
import base from 'build_js/modules/base';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import Validte from 'build_js/modules/validate';
'use strict';

const commonInput = function () {
    const _self = this;
    /* 初始化获取验证码 */
    _self.getCode = function () {
        if ($(formId).find('input[name="captcha"]').length > 0) {
            serviceData.getCaptcha();
        }
    },
    /* 点击获取验证码 */
    _self.codeReflush = function () {
        const that = this;
        const captchaImg = $(formId).find('.j-captcha');
        $(formId).off('click','.j-captcha');
        $(formId).on('click','.j-captcha',function (e) {
            $(formId).find('input[name="captcha"]').val('');
            $(formId).find('input[name="code"]').val('');
            e.preventDefault();
            that.getCode();
            $(formId).find('.phone-captcha').removeAttr('disabled');
        })
    },
    /* 检验 */
    _self.validte = function () {
        const formName = serviceData.removeSekector(formId);
        if (!formName) return;
        Validte.config(formName, {
            cellphone: {
                required: ErrorMsg.phoneR,
                cellphone: ErrorMsg.phoneS
            },
            username: {
                required: ErrorMsg.usernameR,
                username: ErrorMsg.usernameS
            },
            account: {
                required: ErrorMsg.usernameR,
                username: ErrorMsg.usernameS
            },
            email: {
                required: ErrorMsg.emailR,
                email: ErrorMsg.emailS
            },
            password: {
                required: ErrorMsg.passwordR,
                password: ErrorMsg.passwordS
            },
            captcha: {
                required: ErrorMsg.captchaR,
                captcha: ErrorMsg.captchaS,
            },
            code: {
                required: ErrorMsg.captchaT,
                phoneCaptcha: ErrorMsg.phoneCodeS,
                emailCaptcha: ErrorMsg.emailCodeS
            },
            pwdConfirm: {
                required: ErrorMsg.repasswordR,
                password: ErrorMsg.passwordS,
                compared: ErrorMsg.repasswordS,
            }
        });
    }
    /*是否登录 */
    _self.loginStatusFn = function () {
        const url = serviceData.requestURL.loginStatusUrl;
        serviceData.requestdata(url, {}, function (param) {
            if (param.code == 200) {
                return param.data.customer_id;
            } else {
                return false;
            }
        })
    }
    /* 注册 */
    _self.registerFormSubmit = function (item) {
        $('.register-accout-btn').on('click', function () {
            const errtips = $(formId).find('.accout-error-all');
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            const pwd = $(formId).find('input[name="password"]').val();
            const pwdConfirm =  $(formId).find('input[name="pwdConfirm"]').val();
            var url = '';
            !formName.includes('Phone') ? url = serviceData.requestURL.createAjaxPostUrl : url = serviceData.requestURL.createPhonePostUrl;
            //检测是否通过检验
            if(pwd != pwdConfirm){
                errtips.addClass('active').html('<i class="icon-error"></i>密码必须和确认密码相同！');
                return false;
            }
            if (!serviceData.isCheckoutValidate(formId)) {
                return false;
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass('active');
                    base.setCookieFn();
                    if(formName.indexOf('Phone') == -1){ //邮箱注册
                        if (item) {
                            serviceData.reload();
                        } else {
                            let newUrl = '/o_customer/security/create';
                            serviceData.windowUrl(newUrl);
                        }
                    }else{//手机注册
                        if($('#coupon-popup').length){
                            if(data.need_popover == 1){
                                easyDialog.open({
                                    container: 'coupon-popup'
                                });
                                $('#coupon-popup').on('click','.coupon-popup-button',function(){
                                    if (item) {
                                        serviceData.reload();
                                    } else {
                                        let newUrl = data.url;
                                        serviceData.windowUrl(newUrl);
                                    }
                                })
                            }else{
                                if (item) {
                                    serviceData.reload();
                                } else {
                                    let newUrl = data.url;
                                    serviceData.windowUrl(newUrl);
                                }
                            }
                            
                        }
                    }
                    // if (item) {
                    //     serviceData.reload();
                    // } else {
                    //     let newUrl = data.url;
                    //     formName.indexOf('Email') > -1 ? newUrl = '/o_customer/security/create' : newUrl;
                    //     serviceData.windowUrl(newUrl);
                    // }
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { //神策注册信息埋点
                        indexSensors.register('union', [msg.replace(/<\/?[^>]*>/g,'')]);
                    }
                    return false;
                }
            })
        });
    }
    /* 联合登录绑定注册 */
    _self.bindRegister = function () {
        $(formId).find('.bind-register').on('click', function () {
            const errtips = $(formId).find('.accout-error-all');
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            var url = serviceData.requestURL.bindRegisterUrl;
            //检测是否通过检验
            if (!serviceData.isCheckoutValidate(formId)) {
                return false;
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    let newUrl = '/';
                    if(data.url){
                        newUrl = data.url;
                    }
                    if($('#coupon-popup').length && data.need_popover == 1){
                        easyDialog.open({
                            container: 'coupon-popup'
                        });
                        $('#coupon-popup').on('click','.coupon-popup-button',function(){
                            base.setCookieFn();
                            errtips.removeClass('active');
                            serviceData.windowUrl(newUrl);
                        })
                    }else{
                        base.setCookieFn();
                        errtips.removeClass('active');
                        serviceData.windowUrl(newUrl);
                    }
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    },
    /* 联合登录绑定 */
    _self.bindLogin = function () {
        if(base.getCookie('unionLoginErrorTime') > 3){
            $(formId).find('.captcha').addClass('active');
        }
        $(formId).find('.bind-login-btn').on('click', function () {
            const formName = serviceData.removeSekector(formId);
            const errtips = $(formId).find('.accout-error-all');
            let time = base.getCookie('unionLoginErrorTime');
            const argument = $(formId).serialize() + '&formId=' + formName + '&time=' + time;
            //检测是否通过检验
            if (!serviceData.isCheckoutValidate(formId)) {
                return false;
            }
            /* 错误提示超过三次显示验证码并触发验证码获取 */
            if (time > 3) {
                $(formId).find('.captcha').addClass('active');
                $(formId).find('.j-captcha').trigger('click');
            }
            var url = serviceData.requestURL.bindExistAccountUrl;
           
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    base.setCookieFn();
                    errtips.removeClass('active');
                    let newUrl = '/o_customer/security/index/';
                    if(data.url){
                        newUrl = data.url;
                    }
                    serviceData.windowUrl(newUrl);
                } else {
                    let errorTime = base.getCookie('unionLoginErrorTime') - 0 || 0;
                    errorTime = errorTime + 1;
                    base.setCookie('unionLoginErrorTime', errorTime);
                    if (errorTime > 3) {
                        $(formId).find('.captcha').addClass('active');
                        $(formId).find('.j-captcha').trigger('click');
                    }
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    }
    /* 弹窗切换方式 */
    _self.tabForm = function () {
        const that = this;
        const btnItem = $('.accout-box');
        const tab = btnItem.find(' .tab-register');
        const tabBtn = btnItem.find('.tab-btn');
        tabBtn.on('click', function () {
            tab.removeClass("active");
            const itemId = $(this).attr('data-event');
            window.formId = $('#' + itemId);
            formId.addClass('active');
            that.getCode();
            that.validte();
            that.codeReflush();
        })
    }
    /* 获取手机或者邮箱验证码 */
    _self.getPhoneCode = function () {
        const that = this;
        $(formId).find('.phone-captcha').on('mouseenter',function(){
            if(document.activeElement.name == 'cellphone' || document.activeElement.name == 'captcha' || document.activeElement.name == 'email'){
                $(formId).find('input[name='+ document.activeElement.name +']').blur();
            }
           
        })
        $(formId).on('click','.phone-captcha', function () {
            const codeItme = $(formId).find('input[name="captcha"]');
            const phoneItem = $(formId).find('input[name="cellphone"]');
            const formName = serviceData.removeSekector(formId);
            const _self = $(this);
            var item = _self.parents('.input-group').find('.accout-error');
            let url = '';
            var type = 0;
            if($(formId).selector =='#registerByPhone' || $(formId).selector =='#popSecurityBindEmail'  || $(formId).selector =='#securityBindEmailEdit'|| $(formId).selector =='#RegisByPhone' || $(formId).selector =='#RegisByPhone' || $(formId).selector =='#securityEditPhone' || $(formId).selector =='#bindRegisterByPhone' || $(formId).selector =='#regBindCellphoneForm' ){
                type = 1;
            }
            //console.log($(formId).selector)
            let argument = {
                formId: formName,
                captcha: codeItme.val(),
                type:type
            };
            // if(!codeItme.attr('valid') || !phoneItem.attr('valid')){
            //     let str = item.html() || '<i class="icon-error"></i>请先输入验证码';
            //     item.addClass('active').html(str);
            //     return false;
            // }
            if (_self.attr('disabled') == 'disabled' || _self.attr('disabled') || _self.hasClass('disabled') || _self.attr('disabled-user')) {
                let str = item.html() || '<i class="icon-error"></i>请先输入正确的手机号或验证码';
                item.addClass('active').html(str);
                return false;
            }
            if (_self.attr('data-type') == 'email') {
                let email =  $(formId).find('input[name="email"]');
                if(email.attr('valid') != 'true'){
                    return false;
                }
                argument.email = email.val();
                url = serviceData.requestURL.sendEmailUrl;
            } else {
                let cellphone = $(formId).find('input[name="cellphone"]');
                if(cellphone.attr('valid') != 'true'){
                    return false;
                }
                argument.cellphone = cellphone.val();
                url = serviceData.requestURL.sendSMSUrl;
            }
            $('[data-event-check]').attr('isChecked', true);
            _self.html('正在获取中...');
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    $('[data-event-check]').removeAttr('isChecked');
                    that.setTimeOutCode(_self);
                    _self.siblings('.icon-check-ok').addClass('active');
                    item.removeClass('active is-ok');
                    item.addClass('active is-ok').html('<i class="icon-check-ok active-success"></i>已发送验证码');
                    _self.attr('valid', 'true');
                    return true;
                } else {
                    that.setTimeOutCode(_self, 0);
                    item.removeClass('active is-ok');
                    _self.siblings('.icon-check-ok').removeClass('active is-ok');
                    item.addClass('active').html('<i class="icon-error"></i>' + data.msg);
                    _self.removeAttr('disabled valid');
                }
                
            })
        })
    }
    /* 倒计时显示 */
    _self.setTimeOutCode = function (options, time = 60) {
        var timeFn = setInterval(function () {
            time--;
            options.html('倒计时还有(' + time + 's)').addClass('disabled');
            if (time < 1) {
                clearInterval(timeFn);
                $('[data-event-check]').removeAttr('isChecked');
                options.html('获取验证码').removeAttr('disabled').removeClass('disabled');
                $('.accout-error .is-ok').removeClass('is-ok');
            }
        }, 1000)
    }
    /* 倒计时跳转 */
    _self.setTimeOutIndex = function (time) {
        const event = $(formId).find('.seconds');
        if (!event.length) return false;
        var time = event.attr('data-time') || '5';
        var url = event.attr('data-countdown') || '';
        var timeFn = setInterval(function () {
            time--;
            event.html(time);
            if (time < 1) {
                clearInterval(timeFn);
                serviceData.windowUrl(url);
            }
        }, 1000)
    },
    /* 跳过绑定 */
    _self.UnionJumpButton = function () {
        $('.UnionJumpButton').on('click', function () {
            const _this = $(this);
            if(_this.attr('disabled')){
                return false;
            }
            _this.attr('disabled','disabled');
            serviceData.isCheckoutValidate(formId, $(this));
            const url = serviceData.requestURL.bindSkipAccountUrl;
            serviceData.requestdata(url, {}, function (data) {
                base.setCookieFn();
                if (data.url) {
                    serviceData.windowUrl(data.url);
                } else {
                    serviceData.windowUrl('/o_customer/security/index/');
                }
                _this.removeAttr('disabled');
            })
        })
    }
    /* 协议勾选 */
    _self.agreeBtn = function () {
        $('.website .icon-checked').on('click', function () {
            const clauseCheckbox = $('#clauseCheckbox');
            const accoutBtn = $('.accout-btn');
            if (clauseCheckbox.attr('checked')) {
                accoutBtn.addClass('disabled').attr('disabled', 'disabled');
            } else {
                accoutBtn.removeClass('disabled').removeAttr('disabled');
            }
        })
    }
    /* 登录 */
    /* 
     */
    _self.loginFormSubmit = function (item) {
        let time = base.getCookie('loginErrorTime');
        /* 错误提示超过三次显示验证码并触发验证码获取 */
        if (time > 3) {
            $(formId).find('.captcha').addClass('active');
            $(formId).find('.j-captcha').trigger('click');
        }
        $(formId).find('.login-accout-btn').on('click', function () {
            const errtips = $(formId).find('.accout-error-all');
            var formName = serviceData.removeSekector(formId);
            if ($(formId).find('.captcha').hasClass("active")) {
                formName = '&formId=' + formName;
            } else {
                formName = '';
            }
            const argument = $(formId).serialize() + formName;
            const url = serviceData.requestURL.loginURL;
            //检测是否通过检验
            if (!serviceData.isCheckoutValidate(formId)) {
                return false;
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass('active');
                    base.setCookieFn();
                    if (item) {
                        serviceData.reload();
                    } else {
                        serviceData.windowUrl(data.url);
                    }
                } else {
                    let time = base.getCookie('loginErrorTime') - 0 || 0;
                    time = time + 1;
                    base.setCookie('loginErrorTime', time);
                    if (data.ret == 2) {
                        if (data.num > 3 || time > 3) {
                            $(formId).find('.captcha').addClass('active');
                            $(formId).find('.j-captcha').trigger('click');
                        }
                    }
                    errtips.addClass('active').html('<i class="icon-error"></i>' + data.msg);
                    if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { //神策登录信息埋点
                        indexSensors.login('union', [data.msg]);
                    }
                    return false;
                }
            })
        });
    }
    /* 邮箱注册成功绑定手机号 */
    _self.regBindCellphoneForm = function (popEvent) {
        if (popEvent && popEvent.length > 0) {
            popEvent = popEvent; //弹窗待优化
        } else {
            popEvent = formId;
        }
        $(".reg-bind-cellphone-btn").on('click', function () {
            //检测是否通过检验
            if (!serviceData.isCheckoutValidate(popEvent)) {
                return false;
            }
            const errtips = $(formId).find('.accout-error-all');
            const formName = serviceData.removeSekector(popEvent);
            const argument = $(popEvent).serialize() + '&formId=' + formName;
            const eventType = $(this).attr('data-type');
            let url = '';
            if (eventType == 'email') {
                url = serviceData.requestURL.bindEmailUrl;
            } else {
                url = serviceData.requestURL.bindCellphoneUrl;
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass('active');
                    base.setCookie('isBindStatus', '1');
                    base.setCookieFn();
                    let newUrl = '/customer/account/index';
                    if(data.url){
                        newUrl = data.url;
                    }
                    if(eventType == 'email' || data.need_popover == 0){
                        serviceData.windowUrl(newUrl);
                    }else{
                        if($('#coupon-popup').length){
                            easyDialog.open({
                                container: 'coupon-popup'
                            });
                            $('#coupon-popup').on('click','.coupon-popup-button',function(){
                                serviceData.windowUrl(newUrl);
                            })
                        }
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
export default new commonInput()