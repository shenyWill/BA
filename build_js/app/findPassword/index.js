import loginRegister from 'scss/customer/findPassword.scss';
import serviceData from 'build_js/api/index';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import Validte from 'build_js/modules/validate';
import formData from 'build_js/modules/formData';
'use strict';


var  findPassword ={
    init:function(){
        const path = window.location.pathname;
        //console.log($('.find-form.active').attr('id'))
        if (/o_customer\/security\/findpwdpage/.test(path)) {
             window.formId = $("#FindPwdFrist");
        }else if(/o_customer\/security\/choosepwdauthpage/.test(path)){
             window.formId = $("#"+$('.find-form.active').attr('id'));
        }else if(/o_customer\/security\/resetpwdpage/.test(path)){
             window.formId = $("#resetPwd");
        }else if(/o_customer\/security\/pwdupdatedpage/.test(path)){
            window.formId = $("#resetSuceess");
        }
        formData.getCode();
        formData.codeReflush();
        formData.getPhoneCode();
        formData.setTimeOutIndex();
        this.validte();
        this.fristFindPwd();
        this.typeSelect();
        this.resetFormSubmit();
        this.authFormSubmit();
    },
    typeSelect:function(){
        const item = $('.all-item');
        $('.select-option').hover(function(){
            item.addClass('active');
        },function(){
            item.removeClass('active');
        })
        this.itemSelect();
    },
    itemSelect:function(){
        const _that = this;
        const item = $('.all-item');
        const selected = $('.selected-item');
        const that = item.find('li');
        that.on('click',function(){
            $(formId).off('click','.phone-captcha');
            const _self = $(this);
            const index = _self.index();
            const value = _self.attr('data-value');
            const text = _self.html();
            item.removeClass('active');
            that.removeClass('selected').eq(index).addClass('selected');
            selected.attr('data-value',value).html(text);
            $('.find-form').removeClass('active');
            window.formId = $('#'+value);
            $(formId).addClass('active');
            const captcha = $(formId).find('.j-captcha');
            if(!captcha.length) return false;
            formData.getCode();
            formData.getPhoneCode();
            formData.codeReflush();
            formData.validte();
            _that.authFormSubmit();
        })
    },
    validte:function(){
        const formName = serviceData.removeSekector(formId);
        Validte.config(formName, {
            cellphone: {
                required: ErrorMsg.usernameR,
                cellphone: ErrorMsg.usernameS
            },
            username: {
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
                required: ErrorMsg.captchaR,
                phoneCaptcha: ErrorMsg.phoneCodeS,
                emailCaptcha: ErrorMsg.emailCodeS
            },
            pwdConfirm: {
                required: ErrorMsg.repasswordR,
                compared: ErrorMsg.repasswordS,
                password: ErrorMsg.passwordS
            },
            confirmation: {
                required: ErrorMsg.repasswordR,
                compared: ErrorMsg.repasswordS,
                password: ErrorMsg.passwordS
            }
        });
    },
    fristFindPwd:function(){
        $(formId).find('.submit-btn').on('mouseenter',function(){
            if(document.activeElement.name == 'username'){
                $(formId).find('input[name='+ document.activeElement.name +']').blur();
            }
        })
        $(formId).find('.submit-btn').on('click',function(){
            const user = $(formId).find('input[name="username"]');
            const type = '?type='+$(this).attr('data-type');
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            serviceData.windowUrl('/o_customer/security/choosepwdauthpage/'+type);
        })
    },
    authFormSubmit:function(){
        const that = this;
        const errtips = $('.accout-error-all');
        $(formId).find('.submit-item-type').on('click',function(){
            const captcha = $(formId).find('input[name="captcha"]');
            const code = $(formId).find('input[name="code"]');
            const url = serviceData.requestURL.authPwdUrl;
            const formName = serviceData.removeSekector(formId);
            let type = 'email';
            type = formName.indexOf('email') == -1 ? 'cellphone' : type;
            let argument = {
                formId  : formName,
                code : code.val(),
                type : type,
                captcha : captcha.val()
            };
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    const str = '?token='+data.token.code+'&type='+data.token.type;
                    errtips.removeClass("active");
                    serviceData.windowUrl('/o_customer/security/resetpwdpage/'+str);
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass("active").html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    },
    resetFormSubmit:function(){
        const that = this;
        const errtips = $(formId).find('.accout-error-all');
        $(formId).find('.submit-btn-reset').on('click',function(){
            //检测是否通过检验
            if(!serviceData.isCheckoutValidate(formId)){
                return false;
            }
            const password = $(formId).find('input[name="password"]');
            const confirmation = $(formId).find('input[name="confirmation"]');
            const url = serviceData.requestURL.resetPwdUrl;
            const formName = '&formId='+serviceData.removeSekector(formId);
            let type = 'email';
            const argument = $(formId).serialize() + formName;
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    errtips.removeClass('active');
                    serviceData.windowUrl('/o_customer/security/pwdupdatedpage/');
                    return false;
                } else {
                    const msg = data.errMsg || data.msg;
                    errtips.addClass('active').html('<i class="icon-error"></i>' + msg);
                    return false;
                }
            })
        });
    }
}
$(function(){
    findPassword.init();    
})


