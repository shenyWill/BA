import security from 'scss/customer/security.scss';
import serviceData from 'build_js/api/index';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import Validte from 'build_js/modules/validate';
import formData from 'build_js/modules/formData';
import popBind from 'build_js/modules/popBind';
import base from 'build_js/modules/base';
'use strict';

var securityindex = {
    init: function () {
        const path = window.location.pathname;
        if (/o_customer\/security\/setpasswordpage/.test(path)) {
            window.formId = $('#securityForm');
        } else if (/o_customer\/security\/bindpage/.test(path)) {
            window.formId = $('#' + $('.find-form.active').attr('id'));
        } else if (/o_customer\/security\/cellphoneauthpage/.test(path)) {
            window.formId = $('#securityEditPhone');
        } else if (/o_customer\/security\/cellphoneupdatedpage/.test(path)) {
            window.formId = $('#bindPhoneSuceess');
        } else if (/o_customer\/security\/updatefirstnamepage/.test(path)) {
            window.formId = $('#usernameEditForm');
        } else if (/o_customer\/security\/emailauthpage/.test(path)) {
            window.formId = $('#securityBindEmailEdit');
        } else {
            window.formId = $($('form').attr('id'));
        }
        this.typeSelect();
        this.validte();
        this.securityBindSubmit();
        this.securityEditSubmit();
        this.securityUsernameEditSubmit();
        this.setpasswordFormSubmit();
        this.securityBindEmailSubmit();
        this.SecurityCellphoneMainBtn();
        this.likeSliderEmarsys();
        formData.getCode();
        formData.codeReflush();
        formData.getPhoneCode();
        formData.setTimeOutIndex();
        popBind.getPopFn();
    },
    typeSelect: function () {
        const that = this;
        $('.select-type').on('click', function () {
            $(formId).off('click','.phone-captcha');
            const item = $('.find-form');
            const itemType = item.attr('data-select');
            $('.find-form').addClass('active');
            $(this).parents('form').removeClass('active');
            formId = $('#' + $('form.active').attr('id'));
            if (!formId.find('.j-captcha').length) return false;
            formData.getCode();
            formData.codeReflush();
            formData.getPhoneCode();
            that.validte();
        })
    },
    /* 弹窗绑定 */
    SecurityCellphoneMainBtn: function () {
        var that = this;
        $('.btn-binding').on('click', function () {
            popBind.getPopFn('btn');
        })
    },
    validte: function () {
        const formName = serviceData.removeSekector(formId);
        if (!formName) return;
        Validte.config(formName, {
            cellphone: {
                required: ErrorMsg.usernameR,
                cellphone: ErrorMsg.usernameS
            },
            current_password: {
                required: ErrorMsg.passwordR,
                password: ErrorMsg.passwordS
            },
            firstname:{
                required: ErrorMsg.nicknameR,
                nickname: ErrorMsg.firstnameS
            },  
            password: {
                required: ErrorMsg.passwordR,
                password: ErrorMsg.passwordS
            },
            email: {
                required: ErrorMsg.emailR,
                email: ErrorMsg.emailS
            },
            captcha: {
                required: ErrorMsg.captchaR,
                captcha: ErrorMsg.captchaS,
            },
            code: {
                required: ErrorMsg.captchaR,
                phoneCaptcha: ErrorMsg.phoneCodeS,
            },
            confirmation:{
                required: ErrorMsg.repasswordR,
                password: ErrorMsg.passwordS,
                compared: ErrorMsg.repasswordS,
            },
            pwdConfirm: {
                required: ErrorMsg.repasswordR,
                password: ErrorMsg.passwordS,
                compared: ErrorMsg.repasswordS,
            }
        });
    },
    /* 绑定手机号验证和绑定邮箱身份验证 */
    securityBindSubmit: function (bind) {
        $(".security-item-type").on('click', function () {
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const _this = $(this);
            if(_this.attr('disabled')){
                return false;
            }
            _this.attr('disabled','disabled');
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
            serviceData.requestdata(url, argument, function (data) {
                _this.removeAttr('disabled');
                if (data.ret == 1) {
                    base.setCookieFn();
                    let tokentype = data.token.type;
                    let bindUrl = '';
                    if (type.includes('email')) {
                        bindUrl = 'emailauthpage/';
                        tokentype = type;
                    } else {
                        bindUrl = 'cellphoneauthpage/';
                    }
                    const str = '?token=' + data.token.code + '&type=' + tokentype;
                    errtips.removeClass('active');
                    /* 弹窗绑定 */
                    if (bind) {
                        serviceData.reload();
                    } else {
                        serviceData.windowUrl('/o_customer/security/' + bindUrl + str);
                    }
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    },
    /* 修改密码 */
    setpasswordFormSubmit: function () {
        $('.security-setpassword-btn').on('click', function () {
            var oldPwd = $(formId).find('input[name="current_password"]').val();
            var newPwd = $(formId).find('input[name="password"]').val(); 
            const errtips = $(formId).find('.accout-error-all');
            //检测是否通过检验
            if(oldPwd == newPwd){
                errtips.addClass('active').html('<i class="icon-error"></i>新密码和原密码不能一样！');
                return false;
            }
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            var url = serviceData.requestURL.updatePwdUrl;
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass('active');
                    $('#securityForm').hide();
                    $('#result-security').show();
                    setTimeout(function () {
                        serviceData.windowUrl('/o_customer/security/index/');
                    }, 5000);
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    $('#securityForm').show();
                    $('#result-security').hide();
                    return false;
                }
            })
        });
    },
    /* 修改手机号码 */
    securityEditSubmit: function () {
        const errtips = formId.find('.accout-error-all');
        $('.security-item-edit').on('click', function () {
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            var url = serviceData.requestURL.updateBindingAuthUrl;
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    base.setCookieFn();
                    errtips.removeClass("active");
                    serviceData.windowUrl('/o_customer/security/cellphoneupdatedpage//?type=cellphone');
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass("active").html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    },
    /* 修改昵称 */
    securityUsernameEditSubmit: function () {
        const errtips = $(formId).find('.accout-error-all');
        $('.security-username-btn').on('click', function () {
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            const firstname = $(formId).find('input[name="firstname"]').val();
            var url = serviceData.requestURL.updateFirstNameUrl;
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass("active");
                    $("#usernameEditForm").hide();
                    $("#result-username").show();
                    base.setCookieFn();
                    setTimeout(function () {
                        serviceData.windowUrl('/o_customer/security/index/');
                    }, 3000);
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass("active").html('<i class="icon-error"></i>' + msg);
                    $('#usernameEditForm').show();
                    $('#result-username').hide();
                    return false;
                }
            })
        });
    },
    //用户中心首页我的猜你喜欢emarsys
    likeSliderEmarsys: function () {
        const _this = this;
        const item = $('#userCenterEmarsys');
        if (!item.length) return;
        const limit = item.attr('data-limit');
        const logicId = item.attr('data-logic-id');
        let logic = logicId.split(",");
        for (var i = 0; i < logic.length; i++) {
            ScarabQueue.push(['recommend', {
                logic: logic[i],
                containerId: 'topic' + i,
                templateId: 'simple-tmpl' + i,
                success: function (SC, render) {
                    render(SC);
                    _this.productReplace();
                }
            }]);
        };
        //ScarabQueue.push(['go']);
    },
    /* 绑定邮箱 */
    securityBindEmailSubmit: function () {
        const errtips = formId.find('.accout-error-all');
        $('.security-email-bind').on('click', function () {
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const formName = serviceData.removeSekector(formId);
            const argument = $(formId).serialize() + '&formId=' + formName;
            var url = serviceData.requestURL.bindEmailUrl;
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    base.setCookieFn();
                    errtips.removeClass('active');
                    serviceData.windowUrl('/o_customer/security/cellphoneupdatedpage/?type=email');
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    }
}
$(function () {
    securityindex.init();
})