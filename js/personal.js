$(function() {
    var personal = new Personal();
    personal.initAddNewAddressHandler();
    personal.initCancelAddNewAddressHandler();
    personal.initToggleAddressEvent();
    personal.initNewAddressValidate();
    personal.initAccountValidate();
    personal.initMyOrderCountdown();
    personal.initMyOrderDetailsCountdown();
    personal.initMyOrderRepayCountdown();
});
var Personal = function() {
    var _self = this;
    /*<收货地址>*/
    _self.$addressList = $("#addressList");
    _self.$addressItem = _getAddressItem;

    function _getAddressItem() {
        return _self.$addressList.find(".address-item");
    }

    function _getDefaultAddressItem() {
        return _getAddressItem().filter(".default");
    }
    /*<新增地址弹窗>*/
    this.initAddNewAddressHandler = function() {
        var $btnNewAddress = $("#btnNewAddress");
        $btnNewAddress.on("click", function(event) {
            _resetAddressForm();
            easyDialog.open({
                container: "newAddressCtn"
            });
        });
    }
    this.initCancelAddNewAddressHandler = function() {
        $("#btnCancel").on("click", function(event) {
            _setNewAddressDialogTitle("add");
            easyDialog.close();
        });
    }
    function _setNewAddressDialogTitle(type){
        type = type || "add";
        var $addressTitle = $("#newAddressCtn").find(".newaddress-title");
        var $addressTitleToShow = $addressTitle.filter("."+type).show();
        $addressTitle.not($addressTitleToShow).hide();
        if(type == "verified"){
            $("#newAddressCtn").find("#firstname").attr("readonly","readonly");
        }else{
            $("#newAddressCtn").find("#firstname").removeAttr("readonly");
        }
    }
    /*</新增地址弹窗>*/
    /*<切换地址>*/
    this.initToggleAddressEvent = function() {
            _self.$addressList.on("click", function(event) {
                var $target = $(event.target);
                if ($target.is(event.currentTarget)) {
                    return false;
                }
                if (!$target.is(".address-item")) { //点击地址内部元素时，找到对应的item
                    $target = $target.parentsUntil(".address-list").filter(".address-item");
                }
                if ($target.is(".newaddress-item") || $target.length == 0) { //已经是被选择或是新增地址按钮，终止
                    return false;
                } else {
                    _toggleAddress($target);
                }

                var $isCtrlTarget = $(event.target);
                if ($isCtrlTarget.is(".ctrl-setdefault")) { //点击设置默认
                    var addressId = $isCtrlTarget.attr("data-address-id");
                    _setDefaultAddress(addressId);
                } else if ($isCtrlTarget.is(".ctrl-edit")) { //点击编辑
                    var addressId = $isCtrlTarget.attr("data-address-id");
                    var isVerified = $isCtrlTarget.attr("data-verify");
                    _editAddress(addressId,isVerified);
                } else if ($isCtrlTarget.is(".ctrl-delete")) { //点击删除
                    var addressId = $isCtrlTarget.attr("data-address-id");
                    _deleteAddress(addressId);
                }

            });
        }
        /*</切换地址>*/
        /*<保存地址表单验证>*/
    this.initNewAddressValidate = function() {
            $("#newAddressForm").validator({
                isErrorOnParent: true,
                after: function() {
                    if ($("#btnSaveAddress").is(".disabled") || $("#btnSaveAddress").is(":disabled")) {
                        return false;
                    }
                    if(!_extraAddressValidate()){
                        return false;
                    }
                    _saveAddress();
                    return false;
                }
            });
        }
        /*</保存地址表单验证>*/
    function _extraAddressValidate(){
        var postcode = $.trim($("#postcode").val());
        if($("#country").val() == "中国大陆" && (postcode == "000000" ||  postcode.length !=6)){
            $("#postcode").parent().addClass("error unvalid");
            return false;
        }else{
            return true;
        }
    }
    function _toggleAddress($targetAddress) { //切换至点击的地址
        $targetAddress.addClass("selected").siblings().removeClass("selected");
    }




    function _saveAddress() { //保存地址
        var addressParams = _getAddressParams();
        var isEdit = addressParams.id ? true : false;
        $.ajax({
            url: "/customer/address/saveAddress",
            type: "post",
            dataType: "json",
            data: addressParams,
            beforeSend: function(xhr) {
                $("#btnSaveAddress").showBtnLoading();
                _self.saveAddressXhr && _self.saveAddressXhr.abort();
                _self.saveAddressXhr = xhr;
            }
        }).done(function(data) {
            easyDialog.close();
            if (data.ret == 0) {
                addressParams["id"] = data.addressid;
                _updateAddressList(addressParams, isEdit);
            } else {
                easyDialog.open({
                    container: {
                        header: "提示",
                        content: data.msg,
                        yesFn: true
                    }
                })
            }
        }).always(function() {
            $("#btnSaveAddress").hideBtnLoading();
        });
    }


    function _updateAddressList(addressParams, isEdit) { //更新地址列表
        var addressItemTemplate = $("#addressItemTemplate").html();
        for (var addressKey in addressParams) {
            var addressRegExp = new RegExp("{{" + addressKey + "}}", "g");
            addressItemTemplate = addressItemTemplate.replace(addressRegExp, addressParams[addressKey]);
        }
        var $newAddressItem = $(addressItemTemplate);
        if (isEdit) {
            var $editAddressItem = _self.$addressItem().filter("[data-address-id='" + addressParams["id"] + "']");
            $editAddressItem.replaceWith($newAddressItem);
        } else {
            if(_getAddressItem().length){
                _getAddressItem().first().before($newAddressItem);
            }else{

                $("#btnNewAddress").before($newAddressItem);
            }
        }
        if (addressParams["default"]) {
            $newAddressItem.siblings().removeClass("default");
        }
        _toggleAddress($newAddressItem);

    }

    function _resetAddressForm() {
        var $newAddressForm = $("#newAddressForm");
        $newAddressForm.find(".address-group").removeClass("error unvalid empty");
        $newAddressForm.get(0).reset();
        $newAddressForm.find("#addressId").val("");
        $newAddressForm.find("#setDefault").removeAttr("checked");
        $newAddressForm.find(".error").removeClass("error");
        $newAddressForm.find("#country").find("[value='国家、地域']").attr("selected", "selected");
        change(0);
    }

    function _getAddressParams() { //获取新增/修改地址表单数据
        var specialCountry = {
            "香港" : "HK",
            "澳门" : "MO",
            "台湾" : "TW"
        };
        var $newAddressForm = $("#newAddressForm");
        var addressParams = {};
        addressParams["firstname"] = $newAddressForm.find("#firstname").val();
        addressParams["lastname"] = "."; //$newAddressForm.find("#lastname").val();
        addressParams["region"] = $newAddressForm.find("#region_id").val();
        addressParams["city"] = $newAddressForm.find("#city").val();
        addressParams["county"] = $newAddressForm.find("#s_county").val();
        addressParams["street[]"] = $newAddressForm.find("#street").val();
        addressParams["postcode"] = $newAddressForm.find("#postcode").val();
        addressParams["telephone"] = $newAddressForm.find("#telephone").val();
        addressParams["email"] = $newAddressForm.find("#email").val();
        addressParams["form_key"] = $newAddressForm.find("#formkey").val();
        addressParams["country_id"] = addressParams["country_id"] = specialCountry[addressParams["region"]] ? specialCountry[addressParams["region"]] : "CN";
        addressParams["default_shipping"] = $newAddressForm.find("#setDefault").is(":checked") ? 1 : 0;
        addressParams["default"] = $newAddressForm.find("#setDefault").is(":checked") ? "default" : "";
        addressParams["streetinfo"] = addressParams["region"] + addressParams["city"] + addressParams["county"] + addressParams["street[]"];
        addressParams["isVerified"] = $newAddressForm.find("#verify").val();
        if ($("#addressId").val()) {
            addressParams["id"] = $("#addressId").val();
        }
        if (_self.$addressItem().length == 0) {
            addressParams["default_shipping"] = 1;
            addressParams["default"] = "default";
        }
        return addressParams;
    }

    function _setAddressFormParams(address) {
        if (address.countryId == "HK" || address.countryId == "MO" || address.countryId == "TW") {
            address.countryId = "港澳台";
        } else {
            address.countryId = "中国大陆";
        } 
        var $newAddressForm = $("#newAddressForm");
        var selection = [$newAddressForm.find("#country"),$newAddressForm.find("#region_id"), $newAddressForm.find("#city"), $newAddressForm.find("#s_county")];
        var selectionVal = [address.countryId,address.region, address.city, address.county];
        for (var i = 0; i < selection.length; i++) {
            change(i); //func in area.js
            selection[i].find("[value='" + selectionVal[i] + "']").attr("selected", "selected");
        }
        $newAddressForm.find("#addressId").val(address.addressId);
        $newAddressForm.find("#firstname").val(address.firstname);
        $newAddressForm.find("#street").val(address.street);
        $newAddressForm.find("#postcode").val(address.postcode);
        $newAddressForm.find("#telephone").val(address.telephone);
        $newAddressForm.find("#email").val(address.email);
        $newAddressForm.find("#country_id").val(address.countryId);
        $newAddressForm.find("#verify").val(address.isVerified);
        if (address.isDefault) {
            $newAddressForm.find("#setDefault").attr("checked", "checked");
        }
        if(address.isVerified == 1){
            $newAddressForm.find("#firstname").attr("readonly","readonly");
        }

    }

    function _setDefaultAddress(addressId) { //设为默认地址
        var $lastDefaultAddressId = _getDefaultAddressItem().attr("data-address-id");
        $.ajax({
            url: "/customer/address/setAddressDefault",
            type: "post",
            dataType: "json",
            data: {
                addressId: addressId
            },
            beforeSend: function(xhr) {
                _self.setDefaultXhr && _self.setDefaultXhr.abort();
                _self.setDefaultXhr = xhr;
                _toggleToDefaultAddress(addressId); //直接显示为默认地址，设置失败再重置
            }
        }).done(function(data) {
            if (data.ret == 1) { //设置失败，页面展示还原之前的显示效果
                _toggleToDefaultAddress($lastDefaultAddressId);
                easyDialog.open({ //设置失败，提醒用户。成功不提醒。
                    container: {
                        header: "提示",
                        content: data.msg,
                        yesFn: function() {}
                    }
                });
            }
        });
    }

    function _toggleToDefaultAddress(addressId) { //页面地址样式切换
        _self.$addressItem().filter("[data-address-id='" + addressId + "']").addClass("default")
            .siblings(".default").removeClass("default");
    }

    function _deleteAddress(addressId) { //删除地址
        easyDialog.open({
            container: {
                header: "提示",
                content: "<i class='icon-status warning'></i>确认要删除该地址?",
                yesFn: function() {
                    var $deleteAddressItem = _self.$addressItem().filter("[data-address-id='" + addressId + "']");
                    $.ajax({
                        url: "/customer/address/delAddress",
                        type: "post",
                        dataType: "json",
                        data: {
                            addressId: addressId
                        },
                        beforeSend: function(xhr) {
                            _self.deleteAddressXhr && _self.deleteAddressXhr.abort();
                            _self.deleteAddressXhr = xhr
                        }
                    }).done(function(data) {
                        if (data.ret == 0) {
                            _deleteAddressItemReally($deleteAddressItem)
                        } else if (data.ret == 1) {
                            _recoveryDeleteAddressItem($deleteAddressItem);
                            easyDialog.open({
                                container: {
                                    header: "提示",
                                    content: data.msg,
                                    yesFn: function() {}
                                }
                            })
                        }
                    })
                },
                noFn: true
            }
        })
    }
    /*<编辑地址>*/
    function _editAddress(addressId,isVerified) {
        $.ajax({
            url: "/customer/address/getUserAddressInfo",
            type: "get",
            dataType: "json",
            data: {
                addressId: addressId
            },
            beforeSend: function(xhr) {
                _self.getUserAddressInfoXhr && _self.getUserAddressInfoXhr.abort();
                _self.getUserAddressInfoXhr = xhr;
            }
        }).done(function(data) {
            if (data.ret == 0) {
                data.address.isVerified = isVerified;
                _openEditAddressDialog(data.address);
            } else {
                easyDialog.open({
                    container: {
                        header: "提示",
                        content: "获取地址信息失败，请稍后再试",
                        yesFn: function() {}
                    }
                });
            }
        });
    }

    function _openEditAddressDialog(address) {
        _resetAddressForm();
        _setAddressFormParams(address);
        if(address.isVerified == 0 ){
            _setNewAddressDialogTitle("edit");
        }else{
            _setNewAddressDialogTitle("verified");
        }
        easyDialog.open({
            container: "newAddressCtn"
        });
    }
    /*</编辑地址>*/
    function _hideAddressItemTemporary($deleteAddressItem) {
        if ($deleteAddressItem.is(".selected")) { //如果删除的是选中的，则删除后选中第一个
            var $newSelectedAddressItem = _self.$addressItem().not($deleteAddressItem).first();
            _toggleAddress($newSelectedAddressItem);
        }
        if ($deleteAddressItem.is(".default")) { //如果删除的是默认的，则删除后id最小为新的默认
            var $newDefaultAddressItem = _getNewDefaultAddressItem($deleteAddressItem);
            if ($newDefaultAddressItem) {
                $newDefaultAddressItem.addClass("default");
            }
            $deleteAddressItem.removeClass("default").addClass("last-default");
        }
        $deleteAddressItem.addClass("wait-for-delete").fadeOut();
    }

    function _deleteAddressItemReally($deleteAddressItem) {
        $deleteAddressItem.remove();
    }

    function _recoveryDeleteAddressItem($deleteAddressItem) {
        $deleteAddressItem.removeClass("wait-for-delete").fadeIn();
        if ($deleteAddressItem.is(".last-default")) { //删除时是默认的，删除失败，恢复其默认的身份地位~~
            $deleteAddressItem.addClass("default").siblings().removeClass(".default");
        }
    }

    function _getNewDefaultAddressItem($deleteAddressItem) { //id小的将为新的默认地址
        var $surplusAddressItem = _self.$addressItem().not($deleteAddressItem);
        if ($surplusAddressItem.length > 0) {
            var addressIdArray = [];
            $surplusAddressItem.each(function(index, ele) {
                addressIdArray.push(parseInt($(ele).attr("data-address-id")));
            });
            var newDefaultAddressId = addressIdArray.sort()[0];
            return $surplusAddressItem.filter("[data-address-id='" + newDefaultAddressId + "']");
        } else {
            return false;
        }
    }
    /*</收货地址>*/


    /*<修改密码>*/
    var _extraValidate = {
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
        var $button = $("#btnSave");
        $("[data-validate='form']").validator({
            isErrorOnParent: true,
            method: "change",
            after: function() {
                var dataExtraValidate = $(this).attr("data-extra-validate");
                if (dataExtraValidate && dataExtraValidate.split(",").length) {
                    var extraValidateQue = dataExtraValidate.split(",");
                    for (var i = 0; i < extraValidateQue.length; i++) {
                        if (!_extraValidate[extraValidateQue[i]]()) {
                            return false
                        }
                    }
                }
                if ($button.hasClass("disabled")) {
                    return false
                }
                $button.addClass("disabled");
                return true
            }
        })
    }
        /*</修改密码>*/
        /*<我的订单倒计时>*/
    this.initMyOrderCountdown = function() {
            $(".order-table .countdown-time").countdown({
                callback: function() {
                    var $this = $(this);
                    var $orderTable = $this.parentsUntil(".order-table").parent();
                    $orderTable.find(".overtime-remove").remove();
                    $orderTable.find(".order-status").removeClass("pending").text("已取消");
                }
            })
        }
        /*</我的订单倒计时>*/
        /*<我的订单 详情倒计时>*/
    this.initMyOrderDetailsCountdown = function() {
            $("#orderDetailsSurplusTime").countdown({
                callback: function() {
                    var $this = $(this);
                    $("#orderDetailsCountdown").remove();
                    $("#orderDetailsStatus").text("已取消");
                }
            })
        }
        /*</我的订单 详情倒计时>*/
        /*<我的订单 repay倒计时>*/
    this.initMyOrderRepayCountdown = function() {
            $("#repaySurplusTime").countdown({
                callback: function() {
                    $("#validtimeInfo").remove();
                    $("#overtimeInfo").show();
                }
            })
        }
        /*</我的订单 repay倒计时>*/
}
/**
 * 修改用户信息
 */
jQuery(function () {
    var PageLoginAndRegisterView = function ($) {
        return {
            show_error: function ($ele, msg) {
                // ele为验证不通过的表单，msg为表单的错误信息
                var $tip = $ele.siblings(".error-tips");
                $tip.html(msg);
                $tip.show();
                $ele.addClass("validation-failed");
            },
            hide_error: function ($ele) {
                var $tip = $ele.siblings(".error-tips");
                $tip.hide();
                $ele.removeClass("validation-failed");
            }
        }
    }(jQuery);
    var ele_data;
    var $button = jQuery(".save");
    if ($button.length) {
        ele_data = {
            new_pw: jQuery("#EditPassword"),
            confirm_pw: jQuery("#EditConfirmPassWord"),
            current_pw: jQuery("#current_password")
        };
        $button.on("click", function (e) {
            if (!EditInfoConfirm(PageLoginAndRegisterView, ele_data)) {
                e.preventDefault();
            }
        });

    }

    /**
     *  是否修改密码选取
     */
    jQuery("#change_password").on("change", function () {
        var $this = jQuery(this);
        if ($this.prop("checked")) {
            jQuery('#current_password').parents(".fieldset").show();
        } else {
            jQuery('#current_password').parents(".fieldset").hide();
        }

    });
});
/**
 * 我的订单页支付订单
 */
jQuery(document).ready(function () {
    var $form = jQuery('#repay-order');
    var $payOrder = jQuery("#pay-order");
    if (!$form.length) return false;
    $form.bind('submit', function (e) {
        $payOrder.attr("disabled","disabled");
        if (!jQuery('#checkout-payment-method-load :radio:checked').length) {
            easyDialog.open({
                container: {
                    header: '提示',
                    content: '<p>请选择支付方式后继续完成支付！</p>',
                    yesFn: function () {
                        $payOrder.removeAttr("disabled");
                    },
                    noFn: false
                }
            });
            e.preventDefault();
            return false;
        }
    });
});
/**
 * 我的优惠券
 */
jQuery(function(){
    var $ = jQuery;
    $("#bindingCoupon").click(function () {
        var couponCode = $("#coupon_code").val(),
            actionUrl = '/customer/account/bindCoupon/code/' + couponCode + "";
        jQuery.ajax({
            type: 'post',
            url: actionUrl,
            dataType: 'json',
            success: function (data) {
                if (data.ret === 1) {
                    var coupon = data.coupon,
                        element = "";
                    element += '<div id="' + coupon.id + '" class="single clearfix">';
                    element += '<div class="cut-off">';
                    if (coupon.type == 2) {
                        element += '<span class="price">';
                        element += '' + coupon.value + '';
                        element += '</span>';
                        /*element += '<i>优惠券</i>';*/
                    }
                    else if(coupon.type == 5){
                        element += '<span class="price">';
                        element += '' + coupon.value + '';
                        element += '</span>';
                        /*element += '<i>优惠券</i>';*/
                    }
                    else {
                        element += '<span class="varchar">' + coupon.value + '</span>';
                    }
                    element += '</div>';
                    element += '<div class="detail">';
                    element += '<div class="desc">' + coupon.name +  '</div>';
                    element +=  '<div class="line">|</div>';
                    element +=  '<div class="code">优惠码：' + couponCode + '</div>';
                    element += '</div>';
                    element += '<div class="other-info">';
                    element += coupon.expire_time;
                    element += '</div>';
                    element += '</div>';
                    $(".promo-wrap").prepend(element);
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: '<p>'+ data.msg + '</p>',
                            yesFn: function () {
                            }
                        }
                    });
                }
                else {
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: '<p>'+ data.msg + '</p>',
                            yesFn: function () {
                            }
                        }
                    });
                }
            },
            error: function (data) {
                if (data.status == 404) {
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: '<p>'+ 请重新登录 + '</p>',
                            yesFn: function () {
                            }
                        }
                    });
                }
                else {
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: '<p>'+ data.msg + '</p>',
                            yesFn: function () {
                            }
                        }
                    });
                }
            },
            beforeSend: function () {
                $("#loading").show();
            },
            complete: function () {
                $("#loading").hide();
            }
        });
    });
});
/**
 * 个人中心，删除我的收藏
 */
jQuery(function(){
//    jQuery('.lazy_product').lazyload();
    !function($){
        $('body').on('click','.J-close-button',function(a){
            a.stopPropagation();
            a.preventDefault();
            var customer_id=$(this).attr('data-customer-id'),
                product_id=$(this).attr('data-product-id');
            var myDate = new Date();
            var year=myDate.getFullYear(),
                month=myDate.getMonth()+1,
                date=myDate.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            };
            if (date >= 0 && date <= 9) {
                date = "0" + date;
            };
            var mytime=year+''+month+date;
            var sign=mytime+'cecs@po'+customer_id+product_id;
            var url='/o_customer/favourites/delete?customer_id='+customer_id+'&product_id='+product_id+'&sign='+sign;
            var Product=$(this).parents('.ProductPanel');
            easyDialog.open({
                container: {
                    header: '提示',
                    content: '<p>确认要删除?</p>',
                    yesText: '确定',
                    yesFn: function () {
                        jQuery.ajax({
                            type: 'GET',
                            url: url,
                            dataType: "json",
                            success: function (data) {
                                if (data.ret == 0) {
                                    easyDialog.open({
                                        container: {
                                            header: '提示',
                                            content: '<p>删除最近收藏记录成功！</p>',
                                            yesText: '确定',
                                            yesFn: function () {
                                                window.location.href=window.location.href;
                                            },
                                            noFn: false
                                        }
                                    });
                                    return;
                                } else {
                                    easyDialog.open({
                                        container: {
                                            header: '提示',
                                            content: '<p>删除最近收藏记录不成功！</p>',
                                            yesText: '确定',
                                            yesFn: function () {
                                            },
                                            noFn: false
                                        }
                                    });
                                    return;
                                }
                            }
                        })
                    },
                    noFn: function(){}
                }
            });
        })
    }(jQuery);
});