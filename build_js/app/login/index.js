import loginRegister from 'scss/customer/loginRegister.scss';
import serviceData from 'build_js/api/index';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import formData from 'build_js/modules/formData';

/* import { getCaptcha } from 'build_js/api/index' */

'use strict';


var  login ={
    init:function(){
        window.formId = $("#loginForm");
        formData.getCode();
        formData.codeReflush();
        formData.validte();
        formData.loginFormSubmit();
    }
}
$(function(){
    login.init();    
})


