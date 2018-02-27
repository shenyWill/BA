import loginRegister from 'scss/customer/loginRegister.scss';
import serviceData from 'build_js/api/index';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import Validte from 'build_js/modules/validate';
import formData from 'build_js/modules/formData';

/* import { getCaptcha } from 'build_js/api/index' */

'use strict';


var register = {
    init: function () {
        const path = window.location.pathname;
        if(/o_customer\/security\/choosepwdauthpage/.test(path)){
             window.formId = $("#"+$('.forgot-form.active').attr('id'));
        }else if(/o_customer\/security\/resetpwdpage/.test(path)){
             window.formId = $("#resetPwd");
        }else if(/o_customer\/security\/pwdupdatedpage/.test(path)){
            window.formId = $("#resetSuceess");
        }else if(/union\/binding\/index\/state/.test(path)){
            window.formId = $("#bindRegisterByPhone");
        }else if(/union\/binding\/register\/state/.test(path)){
            window.formId = $("#bindRegisterByPhone");
        }else if(/union\/binding\/login\/state/.test(path)){
            window.formId = $("#unionLogin");
        }else if(/o_customer\/security\/create/.test(path)){
            window.formId = $("#regBindCellphoneForm");
        }else{
            window.formId = $('#registerByPhone');
        }
        formData.tabForm();
        formData.getCode();
        formData.codeReflush();
        formData.validte();
        formData.registerFormSubmit();
        formData.getPhoneCode();
        formData.agreeBtn();
        formData.bindRegister();
        formData.bindLogin();
        formData.UnionJumpButton();
        formData.regBindCellphoneForm();
    }
}
$(function () {
    register.init();
})