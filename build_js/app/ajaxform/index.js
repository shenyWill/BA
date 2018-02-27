import loginRegister from 'scss/customer/loginRegister.scss';
import ajaxformScss from 'scss/customer/ajaxform.scss';
import serviceData from 'build_js/api/index';
import Validte from 'build_js/modules/validate';
import formData from 'build_js/modules/formData';
import base from 'build_js/modules/base';

'use strict';
var  ajaxform ={
    init:function(){
        window.formId = $("#LoginForm");
        this.loginAlertFn();
        this.closeAlertFn();
        this.couponLoginFn();
        this.tabHeaderFn();
        this.tabRegisterFn();
        formData.loginFormSubmit('alert');
        formData.registerFormSubmit('alert');
        formData.agreeBtn();
        base.init();
    },
    /* 调用公用 */
    commonGetFn:function(){
        formData.getPhoneCode();
        formData.getCode();
        formData.codeReflush();
        formData.validte();
    },
    /* 注册登录切换 */
    tabHeaderFn:function(){
        const _self = this;
        const tab = $(".tab-header .item");
        const box = $(".accout-box");
        const tabType = $(".tab-register");
        tab.on("click",function(){
            $(formId).off('click','.phone-captcha');
            const index = $(this).index();
            tab.removeClass("active");
            tabType.removeClass("active");
            box.removeClass("active");
            $(this).addClass("active");
            tabType.eq(0).addClass("active");//初始化为手机注册
            box.eq(index).addClass("active");
            $('.ajax-title .title').html($(this).attr('data-title'))
            const item = box.eq(index);
            if(item.find("form").hasClass("active")){
                formId = $("#"+item.find("form.active").attr('id'));
            }else{
                formId = $("#"+item.find("form").attr('id'));
            }
            _self.commonGetFn();
        })
    },
    /* 注册类型切换 */
    tabRegisterFn:function(){
        const _self = this;
        const tab = $('.tab-register .change-type');
        const box = $('.tab-register');
        tab.on('click',function(){
            $(formId).off('click','.phone-captcha');
            tab.removeClass('active');
            box.addClass('active');
            $(this).addClass('active');
            $(this).parents('.tab-register').removeClass('active');
            formId = $('#'+$('form.active').attr('id'));
            _self.commonGetFn();
        })
    },
    /* 点击弹窗 */
    loginAlertFn:function(){
        const _self = this;
        const event = $("[data-event]");
        //event.find('a').attr('href','javascript:void(0)');
        /* 判断是否已经登录，如果没有登录弹窗 */
        const isLogin = base.getCookie('loginRet');
        if(!isLogin || isLogin == 10 || isLogin == ''){
            event.on('click',function(e){
                e.preventDefault();
                const open = $("#open-mask");
                const type = $(this).attr('data-event');
                const main = $(".accout-box");
                const item = $(".tab-header .item");
                item.removeClass("active");
                item.eq($(this).index() -1 ).addClass("active");
                open.addClass("active");
                if(type){
                    main.removeClass("active");
                    $("."+type).addClass("active");
                    if($("."+type).find("form").hasClass("active")){
                        formId = $("#"+$("."+type).find("form.active").attr("id"));
                    }else{
                        formId = $("#"+$("."+type).find("form").attr("id"));
                    }
                    _self.commonGetFn();
                }
            });
        }
    },
    /* 弹窗关闭 */
    closeAlertFn:function(){
        $(".open-header .close").on('click',function(e){
            const open = $("#open-mask");
            e.preventDefault();
            open.removeClass("active");
        });
    },
    couponLoginFn:function(){
        const _self = this;
        /* 判断是否已经登录，如果没有登录弹窗 */
        const isLogin = base.getCookie('loginRet');
        if(!isLogin || isLogin == 10 || isLogin == ''){
            $("#couponSelected,#J-display-block,#submitCouponCode,#btnCheckout").on('click',function(e){
                e.preventDefault();
                $('#easyDialogBox,#overlay').hide();
                const open = $("#open-mask");
                const main = $(".accout-box");
                const item = $(".tab-header .item");
                item.removeClass("active");
                item.eq(0).addClass("active");
                e.preventDefault();
                open.addClass("active");
                main.removeClass("active");
                $(".login").addClass("active");
                if($(".login").find('form').hasClass('active')){
                    formId = $('#'+$('.login').find('form.active').attr('id'));
                }else{
                    formId = $('#'+$('.login').find('form').attr('id'));
                }
                _self.commonGetFn();
                return false;
            });
        }
    }
}
$(function(){
    ajaxform.init();   

})


