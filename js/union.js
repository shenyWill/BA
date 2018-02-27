/**
 * Created by hzh on 16/4/18.
 */
!function($){
    /**
     * 登录注册
     */
    jQuery(function($){

        /**
         * 登录
         */
        !function(){
            var $button,$email,$pwd;

            $button = $("#UnionLoginButton");
            if ($button.length){
                $email = $("#UnionLoginEmail");
                $pwd = $("#UnionLoginPwd");
                $pw_confirm = $("#UnionLoginConfirm");

                $email.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionEmailConfirm);

                $pwd.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionLoginPwdConfirm);
            }
            $button.on("click",function(){
                if (!UnionEmailConfirm.call($email[0]) || !UnionLoginPwdConfirm.call($pwd[0])){
                    return false;
                }
            })
        }(jQuery);

        /**
         * 注册
         */
        !function($){
            var $button,$email,$pwd,$pw_confirm,$agree_condition;

            $button = $("#UnionLoginRegister");
            if ($button.length){
                $email = $("#UnionLoginEmail");
                $pwd = $("#UnionLoginPwd");
                $agree_condition = $("#RegisterAgreeCondition");

                $email.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionEmailConfirm);

                $pwd.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionLoginPwdConfirm);


                //是否选中同意条款
                function set_agree_condition_status(){
                    if ($agree_condition.prop("checked")){
                        $button.removeClass("disabled")
                    } else {
                        $button.addClass("disabled")
                    }
                }

                set_agree_condition_status();
                $agree_condition.on("change",set_agree_condition_status);

                $button.on("click",function(){
                    if ($button.hasClass("disabled")){return false;}
                    if (!UnionEmailConfirm.call($email[0]) || !UnionLoginPwdConfirm.call($pwd[0]) || !UnionPwdEnsure.call($pw_confirm[0])){
                        return false;
                    }
                })
            }


        }(jQuery)
    });



    /**
     * 联合登录绑定
     */
    jQuery(function(){

        /**
         * 跳过绑定
         */
        !function($){
            var state, $union_jump_button;
            $union_jump_button = $("#UnionJumpButton");

            if ($union_jump_button.length){

                state = document.getElementById("UnionState").value;

                $union_jump_button.on("click",function(){
                    $.ajax({
                            url: "/union/binding/skip",
                            type: 'post',
                            data: {state: state},
                            dataType: 'json'
                        })
                        .done(function (d) {
                            if (d.ret == 1) {
                                window.location.href = d.url;
                            } else if (d.ret == 0) {
                                easyDialog.open({
                                    container: {
                                        header: '提示',
                                        content: d.errMsg,
                                        yesFn: function (){},
                                        noFn: false
                                    }
                                });
                            }
                        });
                })
            }
        }(jQuery);

        /**
         * 绑定原有账号
         */
        !function($){
            var $union_bind_button,$email,$pwd,state,ajax_data;

            $union_bind_button = $("#UnionBundle");
            if ($union_bind_button.length){
                $email = $(".UnionBundleLogin .UnionLoginEmail");
                $pwd = $(".UnionBundleLogin .UnionLoginPwd");
                state = document.getElementById("UnionState").value;

                $email.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionEmailConfirm);

                $pwd.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionLoginPwdConfirm);

                $union_bind_button.on("click",function(){
                    if (UnionEmailConfirm.call($email[0]) && UnionLoginPwdConfirm.call($pwd[0])){

                        ajax_data = {
                            state:state,
                            email:$email[0].value.trim(),
                            password: $pwd[0].value
                        };

                        $.ajax({
                                url: "/union/binding/ajaxPost",
                                type: 'post',
                                data: ajax_data,
                                dataType: 'json',
                                beforeSend: function () {
                                    $(".UnionBundleLogin").find('button#UnionBundle').css("background","#ccc").attr("disabled","disabled");
                                },
                                complete: function(){
                                    $(".UnionBundleLogin").find('button#UnionBundle').css("background","#cc1439").removeAttr("disabled");
                                },
                            })
                            .done(function(d){
                                if (d.ret == 1){
                                    window.location.href = d.url;
                                } else if (d.ret == 0){
                                    easyDialog.open({
                                        container: {
                                            header: '提示',
                                            content: d.errMsg,
                                            yesFn: function (){},
                                            noFn: false
                                        }
                                    });
                                }
                            });
                    } else {
                        return false;
                    }
                })
            }


        }(jQuery);

        /**
         * 创建并绑定账号
         */
        !function($){
            var $union_register_button,$email,$pwd,$pw_confirm,ajax_data,state,$agree_condition;

            $union_register_button = $("#UnionBundleAndCreate");
            if ($union_register_button.length){
                $email = $(".UnionBundleRegister .UnionLoginEmail");
                $pwd = $(".UnionBundleRegister .UnionLoginPwd");
                $pw_confirm = $("#UnionLoginConfirm");
                $agree_condition = $("#RegisterAgreeCondition");
                state = document.getElementById("UnionState").value;

                //是否选中同意条款
                function set_agree_condition_status(){
                    if ($agree_condition.prop("checked")){
                        $union_register_button.removeClass("disabled").css("background","#cc1439").html("绑定邮箱");
                    } else {
                        $union_register_button.addClass("disabled").css("background","#ccc").html("请先阅读并同意网站条款");
                    }
                }
                set_agree_condition_status();
                $agree_condition.on("change",set_agree_condition_status);

                $email.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionEmailConfirm);

                $pwd.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionLoginPwdConfirm);
                $pw_confirm.on("focus",function(){
                        $(this).siblings(".union-login-tip").hide();
                    })
                    .on("blur",UnionPwdEnsure);

                $union_register_button.on("click",function(){

                    if ($union_register_button.hasClass("disabled")){return;}

                    var url;
                    url = "/union/binding/create";
                    if (document.getElementById("UnionBindingType").value == "binding"){
                        url = "/union/binding/email";
                    }
                    if (UnionEmailConfirm.call($email[0]) && UnionLoginPwdConfirm.call($pwd[0]) && UnionPwdEnsure.call($pw_confirm[0])){
                        ajax_data = {
                            state:state,
                            email:$email[0].value.trim(),
                            password: $pwd[0].value,
                            confirmation:$pw_confirm[0].value,
                            protocol:$("#RegisterAgreeCondition").prop("checked")
                        };

                        $.ajax({
                                url: url,
                                type: 'post',
                                data: ajax_data,
                                dataType: 'json',
                                beforeSend: function () {
                                    $(".UnionBundleRegister").find('button#UnionBundleAndCreate').css("background","#ccc").attr("disabled","disabled");
                                },
                                complete: function(){
                                    $(".UnionBundleRegister").find('button#UnionBundleAndCreate').css("background","#cc1439").removeAttr("disabled");
                                },
                            })
                            .done(function(d){
                                if (d.ret == 1){
                                    window.location.href = d.url;
                                } else if (d.ret == 0){
                                    easyDialog.open({
                                        container: {
                                            header: '提示',
                                            content: d.errMsg,
                                            yesFn: function (){},
                                            noFn: false
                                        }
                                    });
                                }
                            });
                    } else {
                        return false;
                    }
                })
            }

        }(jQuery);
    });

    function UnionEmailConfirm(){
        var $input,$tip;
        $input = jQuery(this);
        $tip = $input.siblings(".union-login-tip");
        if (!/^.*@[\w-]+(\.[\w-]+)+$/.test($input.val())||/\s/.test($input.val())){
            $tip.html("请输入有效邮件地址").show();
            return false
        } else {
            return true
        }
    }
    function UnionLoginPwdConfirm(){
        var $input,$tip;
        $input = jQuery(this);
        $tip = $input.siblings(".union-login-tip");
        if ($input.val().length < 5 || $input.val().length > 30){
            $tip.html("密码长度为5-30位").show();
            return false
        } else {
            return true
        }
    }
    function UnionPwdEnsure(){
        var $input,$tip;
        $input = jQuery(this);
        $tip = $input.siblings(".union-login-tip");
        if ($input.val() != jQuery(".UnionLoginPwd").val()){
            $tip.html("两次密码不一致").show();
            return false
        } else {
            return true
        }
    }
}(jQuery);
