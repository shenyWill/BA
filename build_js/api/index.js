var Promise = require("bluebird");
// var $ = jQuery.noConflict();
const serviceData = {
    removeSekector: function (item) {
        if (!item || !item.selector) return false;
        return item = item.selector.indexOf("#") != -1 ? item.selector.split("#")[1] : item.selector.split(".")[1];
    },
    fitterStr: function (obj, val) {
        if (!obj.length) {
            return false;
        }
        obj = obj.filter(function (item) {
            return item['method'] != 'POST';
        });
    },
    getCaptcha: function () {
        const url = this.requestURL.CaptchaUrl;
        const formName = this.removeSekector(formId);
        const captchaImg = $(formId).find(".j-captcha");
        const argument = {
            formId: formName
        };
        if (!captchaImg.length) return false;
        if(formId.selector == '#loginForm' && !$(formId).find('.captcha.active').length){
            return false;
        }
        //$('.phone-captcha').attr('disabled','disabled');
        this.requestdata(url, argument, function (data) {
            if (data.ret == 1) {
                $(captchaImg).attr('src', data.img);
                $(formId).find(".captcha .icon-check-ok").removeClass("active");
                $(formId).find('input[name="captcha"]').removeAttr('valid');
            } else {
                // alert("获取验证码失败！");
            }
        })
    },
    checkCaptcha: function (_self) {
        const url = this.requestURL.CheckCaptchaUrl;
        const formName = this.removeSekector(formId);
        const captcha = formId.find("input[name='captcha']");
        const argument = {
            formId: formName,
            captcha: captcha.val()
        };
        $('[data-event-check]').attr('isChecked', true);
        $('.phone-captcha').attr('disabled','disabled');
        this.requestdata(url, argument, function (data) {
            var item = _self.parents('.input-group').find('.accout-error');
            if (data.ret == 1) {
                _self.attr('valid', 'true');
                _self.siblings('.icon-check-ok').addClass('active');
                item.removeClass("active");
                $('[data-event-check]').removeAttr('isChecked');
                $('.phone-captcha').removeAttr('disabled');
            } else {
                _self.removeAttr('valid');
                _self.siblings('.icon-check-ok').removeClass('active');
                item.addClass("active").html('<i class="icon-error"></i>' + data.msg);
            }
        })
    },
    isNeedCheckUser:function(){
        let f = this.removeSekector(formId);
        const a = ['registerByPhone','registerByEmail','FindPwdFrist'];
        let back = 1;
        for(var i in a){
            if(f == a[i]){
                back = 0;
                break;
            }
        }
        return back;
    },
    usernameCheck: function (_self) {
        const url = this.requestURL.usernameCheckUrl;
        const formName = this.removeSekector(formId);
        const username = formId.find('.username');
        var item = _self.parents('.input-group').find('.accout-error');
        var type = '1';
        //是否检测用户存在
        if (formName == 'FindPwdFrist') {
            type = '0';
        }
        if (!username.val() || item.hasClass('active')) {
            item.addClass("active").html(`<i class="icon-error"></i>请输入正确的账号！`);
            return false;
        }
        const argument = {
            username: username.val(),
            type: type
        };
        $('.phone-captcha').attr('disabled-user','disabled');
        $('[data-event-check]').attr('isChecked-user', true);
        this.requestdata(url, argument, function (param) {
            if (param.ret == 1 || param.code == 200) {
                _self.siblings('.icon-check-ok').addClass('active');
                item.removeClass('active');
                if (formName == 'FindPwdFrist') {
                    $(formId).find('.submit-btn').attr('data-type', param.data.type);
                }
                _self.attr('valid', 'true');
                $('[data-event-check]').removeAttr('isChecked-user');
                $('.phone-captcha').removeAttr('disabled-user');
            } else {
                _self.attr('valid', 'false');
                _self.siblings('.icon-check-ok').removeClass('active');
                item.addClass("active").html(`<i class="icon-error"></i>${param.message}`);
            }
        })
    },
    /* btnLoading */
    showBtnLoading: function (ele) {
        let $btn = $(formId).find('[data-event-loading]');
        $btn.length == 0 ? $btn = $('[data-event-loading]') : $btn;
        ele ? $btn = ele : $btn;
        var originalValue = $btn.attr("value");
        $btn.html('<i class="load"></i>' + originalValue);
        $btn.attr('disabled","disabled');
        $btn.addClass('loading-img disabled');
        return false;
    },
    hideBtnLoading: function (ele) {
        var $btn = $(formId).find('[data-event-loading]');
        $btn.length == 0 ? $btn = $('[data-event-loading]') : $btn;
        $btn.html($btn.attr("original-value"))
            .removeClass("loading-img disabled")
            .removeAttr("disabled");
        if (!ele && $btn.attr("data-relative-btn")) {
            var $relativeBtn = $($btn.attr("data-relative-btn"));
            $relativeBtn.hideBtnLoading(true);
        }
    },
    getRequstdata: function (url, argument) {
        const that = this;
        let xhr = false;
        
        //const data = this.fitterStr(argument,'method');//干掉传值
        //argument.timestamp = parseInt(new Date().getTime() / 1000);
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                url: that.requestURL.hostURL + url,
                type: argument.method || 'POST',
                dataType: "json",
                cache: false,
                data: argument,
                beforeSend: function () {
                    if (xhr) {
                        xhr && xhr.abort();
                        xhr = jqXHR;
                    }
                },
                success: function (data) {
                    xhr = true;
                    if (data) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                },
                complete: function () {
                    xhr = false;
                    try {
                        that.hideBtnLoading();
                    } catch (error) {
                        //console.log("不存在formid")
                    }
                }
            });
        });
        return promise;
    },
    isCheckoutValidate: function (formId, ele) {
        let isGo = false;
        const that = this;
        const input = $(formId).find('input');
        if (ele) {
            that.showBtnLoading(ele);
            return false;
        }
        if (input.length > 0) {
            for (let i = 0; i < input.length; i++) {
                const _self = input.eq(i);
                const _type = _self.attr('type');
                const _name = _self.attr('name');
                const _valid = _self.attr('valid');
                
                /* 排除是否启用图形验证码 */
                if (!_name || _name == '' || _name == 'undefined' || _name == 'captcha' && $(formId).find('.captcha.active').length < 1) {
                    break;
                }
                if (_type != 'hidden' && (!_valid || _valid == 'false' || _valid == '' || _valid == 'undefined')) {
                    //const errtips = _self.parents('.input-group').find('.accout-error');
                    //let str = errtips.html();
                    _self.trigger('blur');
                    isGo = true;
                    break;
                }
            }
        }
        if ($('[data-event-check]').attr('isChecked') || $('[data-event-check]').attr('isChecked-user') == 'true' || (!$(formId).attr('isChecked') && $(formId).attr('data-event-check'))){
            return false;
        }
        let url = window.location.href;
        const errtips = $(formId).find('.form-error.active');
        for(let  j = 0;j< errtips.length;j++){
            /* 神策登录 */
            if(url.includes('customer/account/login') || formId.selector == '#LoginForm'){
                if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { //神策登录信息埋点
                    indexSensors.login('union', [errtips[j].innerText]);
                }
            }else if(url.includes('customer/account/create') || formId.selector == '#RegisByPhone' || formId.selector == '#RegisByEmail'){
                if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { //神策注册信息埋点
                    indexSensors.register('union', [errtips[j].innerText]);
                }
            }
        }
        if (isGo) {
            isGo = false;
            return false;
        }
        var $btn = $(formId).find('[data-event-loading]');
        $btn.length == 0 ? $btn = $('[data-event-loading]') : $btn;
        if($btn.attr('disabled') || $btn.hasClass('disabled')){
            return false;
        }
        that.showBtnLoading();
        return true;
    },
    requestdata: function (url, argument, callback, errCallback, options) {
        this.getRequstdata(url, argument).then(function (data) {
            typeof callback === "function" && callback(data);
        }, function (error) {
            typeof errCallback === "function" && errCallback(data);
        });
    },
    addCart: function (productId) {
        const url = this.requestURL.addCartAjaxUrl;
        const argument = {
            qty: '1',
            product: productId
        };
        this.requestdata(url, argument, function (param) {
            if (param.ret == 1) {
                var num = param.itemCount;

                if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { 
                    indexSensors.add_shopping_cart(param.event,param.properties);//神策加入购物埋点
                }


                easyDialog.open({
                    container: {
                        content: '<div class="tip-success-content"><p>商品已成功添加到购物车</p><p>购物车一共有<span style="color:#f00">' + num + '</span>件商品</p></div>',
                        yesFn: false,
                        noFn: false
                    },
                    autoClose: 1200
                });
            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: param.msg,
                        noText: '继续购物',
                        noFn: true
                    }
                });
                return false;
            }
        })
    },
    /*购物车对接促销系统*/
    promoAddCart: function(productId){
        const url = this.requestURL.promoAddcartUrl;
        const argument = {
            qty: '1',
            product_id: productId,
            method:'GET'
        };
        this.requestdata(url, argument, function (param) {
            if (param.status == 200) {
                var num = param.data.total_count;
                easyDialog.open({
                    container: {
                        content: '<div class="tip-success-content"><p>商品已成功添加到购物车</p><p>购物车一共有<span style="color:#f00">' + num + '</span>件商品</p></div>',
                        yesFn: false,
                        noFn: false
                    },
                    autoClose: 1200
                });
            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: param.message,
                        noText: '继续购物',
                        noFn: true
                    }
                });
                return false;
            }
        })
    },
    /*购物车对接促销系统*/
    promoAddCart: function(productId){
        const _self = this;
        const url = this.requestURL.promoAddcartUrl;
        const argument = {
            qty: '1',
            product_id: productId,
            method:'GET'
        };
        this.requestdata(url, argument, function (param) {
            if (param.status == 200) {
                if(typeof sa_enabled !== undefined && sa_enabled && typeof indexSensors !== undefined) { 
                    var saUrl = _self.requestURL.promoCartSuccessUrl;
                    var saArgument = {
                        product_id: productId,
                        method:'GET'
                    }
                    _self.requestdata(saUrl,saArgument,function(result){
                        if(result.status == 200){
                            indexSensors.add_shopping_cart('add_shopping_cart', JSON.stringify(result.data)); //神策加入购物埋点                                
                        }
                    })
                }
                var num = param.data.total_count;
                easyDialog.open({
                    container: {
                        content: '<div class="tip-success-content"><p>商品已成功添加到购物车</p><p>购物车一共有<span style="color:#f00">' + num + '</span>件商品</p></div>',
                        yesFn: false,
                        noFn: false
                    },
                    autoClose: 1200
                });
            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: param.message,
                        noText: '继续购物',
                        noFn: true
                    }
                });
                return false;
            }
        })
    },
    requestURL: {
        hostURL: ROOT_URL || '/', //正式地址
        loginStatusUrl: "o_customer/security/loginStatus", //检测是否登录
        bindStatusUrl: "o_customer/security/hasBindPhone", //检测已经绑定手机和联合登录
        loginURL: "o_customer/account/loginNew", //登录
        CaptchaUrl: "o_customer/security/getCaptcha", //获取验证码
        CheckCaptchaUrl: "o_customer/security/verifyCaptcha", //检测验证码
        createPhonePostUrl: "o_customer/account/createPhonePost", //手机注册
        createAjaxPostUrl: "o_customer/account/createAjaxPost", //邮箱注册
        sendSMSUrl: "o_customer/security/sendSMSCheckPhone", //获取手机验证码
        sendEmailUrl: "o_customer/security/sendEmailCheckPhone", //获取邮箱验证码
        usernameCheckUrl: "o_customer/security/usernameCheck", //获取注册是否存在
        authPwdUrl: "o_customer/security/auth", //验证身份
        resetPwdUrl: "o_customer/security/pwdReset", //重置密码
        bindRegisterUrl: "union/binding/bindNewCellPhone", //注册绑定
        bindExistAccountUrl: "union/binding/bindExistAccount", //注册绑定
        bindSkipAccountUrl: "union/binding/skip", //跳过绑定
        addCartAjaxUrl: "checkout/cart/addCartAjax", //加入购物车
        deleteFavouriteUrl: "o_customer/favourites/delete", //删除收藏
        deleteAllFavouriteUrl: "o_customer/favourites/massDelete", //批量删除收藏
        logisticsTrackUrl: "pt_sales/trade/logisticsTrack", //获取订单物流轨迹
        rebuyUrl: "pt_sales/order/rebuy", //再次购买
        rebuyAddCartUrl: "pt_sales/order/addCart", //有商品缺货后仍然继续购买
        orderCancelUrl: "pt_sales/order/getTime", //订单取消时间
        updatePwdUrl: "o_customer/security/updatePwd", //修改密码
        securityAuthUrl: "o_customer/security/auth", //绑定手机号验证
        bindCellphoneAuthUrl: "o_customer/security/bindCellphone", //初次绑定手机号验证
        updateBindingAuthUrl: "o_customer/security/updateBinding", //修改绑定手机号验证
        updateFirstNameUrl: "o_customer/security/updateFirstName", //修改昵称
        getBindDataUrl: "o_customer/security/getBindData", //检测是否已经绑定手机号
        bindEmailUrl: "o_customer/security/bindEmail", //绑定邮箱
        bindCellphoneUrl: "o_customer/security/bindCellphone", //绑定手机
        saveAddressUrl: "customer/address/saveAddress", //保存地址
        getUserAddressInfoUrl: "customer/address/delAddress", //编辑地址
        setAddressDefaultUrl: "customer/address/setAddressDefault", //设为默认地址
        deleteAddressUrl: "customer/address/delAddress", //删除地址
        getCustomerUrl: "o_customer/info/getBaseCustomer", //获取登录信息
        getShareDataUrl: "o_share/activity/getShareData", //个人中心我的分享
        bindCouponUrl:"o_customer/account/bindCoupon",//绑定优惠券

        /*对接促销系统URL */
        promoAddressAllUrl:"order/address/all",//地址信息
        promoGetCartNumUrl:"cart/item/count",//获取购物车数量
        promoSetAddressDefaultUrl:"order/address/default",//设为默认地址
        promoGetUserAddressInfoUrl:"order/address/edit", //编辑地址
        promoDeleteAddressUrl: "order/address/delete", //删除地址
        promoSaveAddressUrl: "order/address/update", //保存地址
        promoCreateAddressUrl:"order/address/create",//新增地址
        promoAddressInfo:"api/address/allCity",//地址联动城市信息
        promoAddressCounty:"api/address/county",//地址联动城区信息
        promoCoponUrl:"coupon/index/my-coupon",//优惠券
        promoBindCouponUrl:"coupon/index/bind-code",//绑定优惠券
        promoCouponSumUrl:"coupon/index/coupon-count",//优惠券数量
        promoAddcartUrl:"v2/item/add",//加入购物车
        promoCartUrl:"cart/index",//购物车跳转
        promoCartSuccessUrl:"cart/data/add-shopping-cart",//加入购物车成功的神策
    },
    windowUrl: function (url) {
        window.location.href = url;
    },
    reload: function (url) {
        window.location.reload()
    }
};
export default serviceData;