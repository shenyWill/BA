var Customer = function() {
    var _self = this;
    var _extraValidate = {
        clause: function() {
            var $clause = $("#clauseCheckbox");
            if ($clause.is(":checked")) {
                return true;
            } else {
                $clause.parent().addClass("error unvalid");
                return false;
            }
        },
        confirmation: function() {
            var $password = $("#password"),
                $confirmation = $("#confirmation");
            if ($password.val() != $confirmation.val()) {
                $confirmation.parent().addClass("error unvalid");
                return false;
            } else {
                return true;
            }
        }
    }
    this.initAccountValidate = function() {
        //可在此定义需要额外执行的验证,在需要执行的form上
        //赋值给data-extra-valdiate,多个验证以逗号分割
        $("[data-validate='form']").validator({
            isErrorOnParent: true,
            method: "change",
            after: function() { //执行额外验证
                var dataExtraValidate = $(this).attr("data-extra-validate");
                if (dataExtraValidate && dataExtraValidate.split(",").length) {
                    var extraValidateQue = dataExtraValidate.split(",");
                    for (var i = 0; i < extraValidateQue.length; i++) {
                        if (!_extraValidate[extraValidateQue[i]]()) {
                            return false;
                        }
                    }
                }
                $(this).find("[type='submit']").showBtnLoading();
                return true;
            }
        });
    }


    this.initClauseChange = function() { //validator对checkbox的验证支持不完善，另行定义
        $("#clauseCheckbox").on("change", function(event) {
            var $this = $(this);
            if ($this.is(":checked")) {
                $this.parent().removeClass("error unvalid");
            } else {
                $this.parent().addClass("error unvalid");
            }
        });
    }
    var _submitFunc = {
        bindExistAccount: function($form) {
            $.ajax({
                url: "/union/binding/ajaxPost",
                type: "post",
                dataType: "json",
                data: {
                    state: $("#unionState").val(),
                    email: $("#email").val(),
                    password: $("#password").val()
                },
                beforeSend: function(xhr) {
                    _self.bindExistAccountXhr && _self.bindExistAccountXhr.abort();
                    _self.bindExistAccountXhr = xhr;
                    $form.find("[type='submit']").showBtnLoading();
                }
            }).done(function(data) {
                if (data.ret == 1) {
                    window.location.href = data.url;
                } else if (data.ret == 0) {
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: data.errMsg,
                            yesFn: function() {},
                            noFn: false
                        }
                    });
                }
            }).always(function(){
                $form.find("[type='submit']").hideBtnLoading();
            });
        },
        bindCreateAccount : function($form){
            $.ajax({
                url: "/union/binding/create",
                type: "post",
                dataType: "json",
                data: {
                    state: $("#unionState").val(),
                    email: $("#email").val(),
                    password: $("#password").val(),
                    confirmation : $("#confirmation").val(),
                    protocol : $("#clauseCheckbox").prop("checked")
                },
                beforeSend: function(xhr) {
                    _self.bindCreateAccountXhr && _self.bindCreateAccountXhr.abort();
                    _self.bindCreateAccountXhr = xhr;
                    $form.find("[type='submit']").showBtnLoading();
                }
            }).done(function(data) {
                if (data.ret == 1) {
                    window.location.href = data.url;
                } else if (data.ret == 0) {
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: data.errMsg,
                            yesFn: function() {},
                            noFn: false
                        }
                    });
                }
            }).always(function(){
                $form.find("[type='submit']").hideBtnLoading();
            });;
        },
        postForgetPasswordEmail : function($form){
            $.ajax({
                url : "/customer/account/forgotpasswordpostAjax",
                type : "post",
                dataType : "json",
                data : {
                    email : $("#email").val()
                },
                beforeSend : function(xhr){
                    if($("#btnForgot").is(".disabled") || $("#btnForgot").is(":disabled")){
                        return false;
                    }else{
                        $("#btnForgot").showBtnLoading();
                        _self.postForgetPasswordEmailXhr && _self.postForgetPasswordEmailXhr.abort();
                        _self.postForgetPasswordEmailXhr = xhr;
                    }
                }
            }).done(function(data){
                if(data.ret == 0){
                    $("#accountCtn").replaceWith(data.data);
                }else{
                    easyDialog.open({
                        container : {
                            header : "提示",
                            content : data.msg,
                            yesFn : function(){}
                        }
                    });
                }
            }).always(function(){
                $("#btnForgot").hideBtnLoading();
            });
        }
    }

    this.initUnionValidate = function() {
        $("[data-validate='ajaxForm']").validator({
            isErrorOnParent: true,
            method: "change",
            after: function() {
                var dataExtraValidate = $(this).attr("data-extra-validate");
                if (dataExtraValidate && dataExtraValidate.split(",").length) {
                    var extraValidateQue = dataExtraValidate.split(",");
                    for (var i = 0; i < extraValidateQue.length; i++) {
                        if (!_extraValidate[extraValidateQue[i]]()) {
                            return false;
                        }
                    }
                }
                var submitFunc = $(this).attr("data-submit-func");
                _submitFunc[submitFunc]($(this));
                return false;
            }
        })
    }
    this.initSkipBind = function(){
        $("#btnSkip").on("click",function(event){
            var $target = $(event.currentTarget);
            if($target.is('.disabled') || $target.is(":disabled")){
                return false;
            }else{
                $.ajax({
                    url : "/union/binding/skip",
                    type : "post",
                    dataType : "json",
                    data : {
                        state : $target.attr("data-state")
                    },
                    beforeSend : function(xhr){
                        _self.skipBindXhr && _self.skipBindXhr.abort();
                        _self.skipBindXhr = xhr;
                        $target.showBtnLoading();
                    }
                }).done(function(data){
                    if(data.ret == 1){
                        window.location.href = data.url;
                    }else{
                        $target.hideBtnLoading();
                        easyDialog.open({
                            container : {
                                header : "提示",
                                content : data.errMsg,
                                yesFn : function(){}
                            }
                        });
                    }
                });
            }
        });
    }


}

$(function() {
    var customer = new Customer();
    customer.initAccountValidate();
    customer.initClauseChange();
    customer.initUnionValidate();
    customer.initSkipBind();
});
