import address from 'scss/customer/address.scss';
import serviceData from 'build_js/api/index';
import ErrorMsg from 'build_js/modules/validErrorMessage';
import Validte from 'build_js/modules/validate';
var addressHbs = require('build_js/hbs/address.hbs');

'use strict';


$(function () {
    var address = new addressFn();
    window.formId = $('#newAddressForm');
    address.initAddNewAddressHandler();
    address.initCancelAddNewAddressHandler();
    address.initToggleAddressEvent();
    address.initNewAddressValidate();
    address.validte();
})

var addressFn = function () {
    var _self = this;
    /*<收货地址>*/
    _self.$addressList = $('#addressList');
    _self.$addressItem = _getAddressItem;

    function _getAddressItem() {
        return _self.$addressList.find('.address-item');
    }

    function _getDefaultAddressItem() {
        return _getAddressItem().filter('.default');
    }
    /*<新增地址弹窗>*/
    this.initAddNewAddressHandler = function () {
        var $btnNewAddress = $('#btnNewAddress');
        $btnNewAddress.on('click', function (event) {
            _resetAddressForm();
            easyDialog.open({
                container: 'newAddressCtn'
            });
            /* 移除修改地址后添加的验证信息并重置 */
            $('#newAddressForm').find('[valid="true"]').removeAttr('valid');
            $("#clauseCheckbox").attr('valid',true);
        });
    }
    this.initCancelAddNewAddressHandler = function () {
        $('.btn-cancel').on('click', function (event) {
            _setNewAddressDialogTitle('add');
            easyDialog.close();
        });
    }

    function _setNewAddressDialogTitle(type) {
        type = type || 'add';
        var $addressTitle = $('#newAddressCtn').find('.newaddress-title');
        var $addressTitleToShow = $addressTitle.filter('.' + type).show();
        const addCtn = $('#newAddressCtn').find('#firstname');
        $addressTitle.not($addressTitleToShow).hide();
        if (type == 'verified') {
            addCtn.attr('readonly', 'readonly');
        } else {
            addCtn.removeAttr('readonly');
        }
    }
    /*</新增地址弹窗>*/
    /*<切换地址>*/
    this.initToggleAddressEvent = function () {
        _self.$addressList.on('click', function (event) {
            var $target = $(event.target);
            if ($target.is(event.currentTarget)) {
                return false;
            }
            if (!$target.is('.address-item')) { //点击地址内部元素时，找到对应的item
                $target = $target.parentsUntil('.address-list').filter('.address-item');
            }
            if ($target.is('.newaddress-item') || $target.length == 0) { //已经是被选择或是新增地址按钮，终止
                return false;
            }
            var $isCtrlTarget = $(event.target);
            if ($isCtrlTarget.is(".ctrl-setdefault")) { //点击设置默认
                var addressId = $isCtrlTarget.attr("data-address-id");
                _setDefaultAddress(addressId);
            } else if ($isCtrlTarget.is(".ctrl-edit")) { //点击编辑
                var addressId = $isCtrlTarget.attr("data-address-id");
                var isVerified = $isCtrlTarget.attr("data-verify");
                _editAddress(addressId, isVerified);
            } else if ($isCtrlTarget.is(".ctrl-delete")) { //点击删除
                var addressId = $isCtrlTarget.attr("data-address-id");
                _deleteAddress(addressId);
            }

        });
    }
    /*</切换地址>*/
    /*<保存地址表单验证>*/
    this.initNewAddressValidate = function () {
        $("#newAddressForm").on("click", "#btnSaveAddress", function () {
            if($('input[name="telephone"]').length){
                $('input[name="telephone"]').blur()
            }
            if($('input[name="postcode"]').length){
                $('input[name="postcode"]').blur()
            }
            if ($("#btnSaveAddress").is(".disabled") || $("#btnSaveAddress").is(":disabled")) {
                return false;
            }
            if (!_extraAddressValidate()) {
                return false;
            }
            _saveAddress();
            return false;
        });
    }
    /*</保存地址表单验证>*/
    function _extraAddressValidate() {
        var postcode = $.trim($("#postcode").val());
        var country = $.trim($("#country").val());
        var region_id = $.trim($("#region_id").val());
        var city = $.trim($("#city").val());
        var s_county = $.trim($("#s_county").val());
        if(country == '国家、地域' || region_id == '省份' || city == '地级市' || s_county == '市、县级市'){
            $('#s_county').trigger('blur');
            return false;
        }
        
        if ($("#country").val() == "中国大陆" && (postcode == "000000" || postcode.length != 6) ) {
            $("#postcode").parent().addClass("error unvalid");
            return false;
        } else {
            return true;
        }
    }

    function _saveAddress() { //保存地址
        var addressParams = _getAddressParams();
        var isEdit = addressParams.id ? true : false;
        let url = serviceData.requestURL.saveAddressUrl;
        //检测是否通过检验
        if(!serviceData.isCheckoutValidate(formId)){
            $('#btnSaveAddress').removeAttr('disabled').removeClass('disabled');
            return false;
        }
        serviceData.showBtnLoading($("#btnSaveAddress"));
        serviceData.requestdata(url, addressParams, function (data) {
            var item = $(this).parents('.input-group').find('.accout-error');
            if (data.ret == 0) {
                easyDialog.close();
                
                addressParams["id"] = data.addressid;
                _updateAddressList(addressParams, isEdit);
                $('.no-items').addClass('hidden');
                const length = $('.address-list li').length;
                /* if(length == 1 || length == 10){
                    serviceData.reload();
                } */
                $('.page-bottom .left i').html(length);
                if(addressParams.default == 'default'){
                    _setDefaultAddress(addressParams["id"]);
                }
            } else {
                easyDialog.open({
                    container: {
                        header: "提示",
                        content: data.msg,
                        yesFn: true
                    }
                })
            }
            serviceData.hideBtnLoading($("#btnSaveAddress"));
        })
        
    }
    /*<编辑地址>*/
    function _editAddress(addressId, isVerified) {
        let url = serviceData.requestURL.getUserAddressInfoUrl;
        const argument = {
            addressId: addressId,
            method: 'GET'
        }
        serviceData.requestdata(url, argument, function (data) {
            var item = $(this).parents('.input-group').find('.accout-error');
            if (data.ret == 0) {
                data.address.isVerified = isVerified;
                _openEditAddressDialog(data.address);
            } else {
                easyDialog.open({
                    container: {
                        header: "提示",
                        content: data.msg,
                        yesFn: function () {}
                    }
                });
            }
        })
    }

    function _openEditAddressDialog(address) {
        _resetAddressForm();
        _setAddressFormParams(address);
        if (address.isVerified == 0) {
            _setNewAddressDialogTitle("edit");
        } else {
            _setNewAddressDialogTitle("verified");
        }
        easyDialog.open({
            container: "newAddressCtn"
        });
    }
    /*</编辑地址>*/
    function _hideAddressItemTemporary($deleteAddressItem) {
        if ($deleteAddressItem.is(".default")) { //如果删除的是默认的，则删除后id最小为新的默认
            var $newDefaultAddressItem = _getNewDefaultAddressItem($deleteAddressItem);
            if ($newDefaultAddressItem) {
                $newDefaultAddressItem.addClass("default");
            }
            $deleteAddressItem.removeClass("default").addClass("last-default");
        }
        $deleteAddressItem.addClass("wait-for-delete").fadeOut();
    }

    function _updateAddressList(addressParams, isEdit) { //更新地址列表
        const addressList = addressHbs({
            addressParams
        });
        if (isEdit) {
            var $editAddressItem = _self.$addressItem().filter("[data-address-id='" + addressParams["id"] + "']");
            $editAddressItem.replaceWith(addressList);
        } else {
            if (_getAddressItem().length) {
                _getAddressItem().first().before(addressList);
            } else {
                $("#addressList").html(addressList);
            }
        }
        /*         if (addressParams["default"]) {
                    $newAddressItem.siblings().removeClass("default");
                } */

    }

    function _resetAddressForm() {
        var $newAddressForm = $("#newAddressForm");
        $newAddressForm.find(".address-group").removeClass("error unvalid empty");
        $newAddressForm.get(0).reset();
        $newAddressForm.find("#addressId").val("");
        $newAddressForm.find("#setDefault").removeAttr("checked");
        $newAddressForm.find(".error").removeClass("error");
        $newAddressForm.find("#country").find("[value='国家、地域']").attr("selected", "selected");
        $('#btnSaveAddress').removeAttr('disabled').removeClass('disabled');
        $('.accout-error').removeClass('active');
        change(0);
    }

    function _getAddressParams() { //获取新增/修改地址表单数据
        var specialCountry = {
            "香港": "HK",
            "澳门": "MO",
            "台湾": "TW"
        };
        var $newAddressForm = $("#newAddressForm");
        var addressParams = {};
        addressParams["firstname"] = $newAddressForm.find("#firstname").val();
        addressParams["lastname"] = ".";
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
        addressParams["default"] = $newAddressForm.find("#clauseCheckbox").is(":checked") ? 'default' : 0;
        addressParams["streetinfo"] = addressParams["street[]"];
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
    this.validte = function () {
        const formName = serviceData.removeSekector(formId);
        Validte.config(formName, {
            telephone: {
                required: ErrorMsg.phoneR,
                cellphone: ErrorMsg.phoneS
            },
            streetinfo: {
                required: ErrorMsg.streetinfoR,
                streetinfo: ErrorMsg.streetinfoRule,
                /* requireRule: ErrorMsg.streetinfoRule */
            },
            postcode: {
                required: ErrorMsg.postcodeR,
                postcode: ErrorMsg.postcodeS
            },
            email: {
                required: ErrorMsg.emailR,
                email: ErrorMsg.emailS
            },
            firstname: {
                required: ErrorMsg.firstnameR,
                firstname: ErrorMsg.firstnameRule,
                /* requireRule: ErrorMsg.firstnameRule, */
            },
            nation_NoUse: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            region: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            county: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            },
            city: {
                required: ErrorMsg.addressR,
                address: ErrorMsg.addressS
            }
        });
    }

    function _setAddressFormParams(address) {
        if (address.region == "香港" || address.region == "台湾" || address.region == "澳门") {
            address.countryId = "港澳台";
        } else {
            address.countryId = "中国大陆";
        }
        var $newAddressForm = $("#newAddressForm");
        var selection = [$newAddressForm.find("#country"), $newAddressForm.find("#region_id"), $newAddressForm.find("#city"), $newAddressForm.find("#s_county")];
        var selectionVal = [address.countryId, address.region, address.city, address.county];
        for (var i = 0; i < selection.length; i++) {
            change(i); //func in area.js
            selection[i].find("[value='" + selectionVal[i] + "']").attr("selected", "selected");
        }
        $newAddressForm.find("#addressId").val(address.addressId).attr('valid',true);
        $newAddressForm.find("#firstname").val(address.firstname).attr('valid',true);
        $newAddressForm.find("#street").val(address.street).attr('valid',true);
        $newAddressForm.find("#postcode").val(address.postcode).attr('valid',true);
        $newAddressForm.find("#telephone").val(address.telephone).attr('valid',true);
        $newAddressForm.find("#email").val(address.email).attr('valid',true);
        $newAddressForm.find("#country_id").val(address.countryId).attr('valid',true);
        $newAddressForm.find("#verify").val(address.isVerified).attr('valid',true);
        if (address.isDefault) {
            $newAddressForm.find("#setDefault").attr("checked", "checked");
        }
        if (address.isVerified == 1) {
            $newAddressForm.find("#firstname").attr("readonly", "readonly");
        }
    }

    function _setDefaultAddress(addressId) { //设为默认地址
        var $lastDefaultAddressId = _getDefaultAddressItem().attr("data-address-id");
        let url = serviceData.requestURL.setAddressDefaultUrl;
        const argument = {
            addressId: addressId
        }
        _toggleToDefaultAddress(addressId); //直接显示为默认地址，设置失败再重置
        serviceData.requestdata(url, argument, function (data) {
            if (data.ret == 1) { //设置失败，页面展示还原之前的显示效果
                _toggleToDefaultAddress($lastDefaultAddressId);
                easyDialog.open({ //设置失败，提醒用户。成功不提醒。
                    container: {
                        header: "提示",
                        content: data.msg,
                        yesFn: function () {}
                    }
                });
            }
        })
    }

    function _toggleToDefaultAddress(addressId) { //页面地址样式切换
        _self.$addressItem().filter("[data-address-id='" + addressId + "']").addClass("default")
            .siblings(".default").removeClass("default");
    }

    function _deleteAddress(addressId) { //删除地址
        $(".easyDialog_wrapper").addClass("rebuy-alert bind-alert");
        easyDialog.open({
            container: {
                header: "提示",
                content: `<p class="warning"><i class='icon-status warning'></i>确认要删除该地址?</p>`,
                yesFn: function () {
                    var $deleteAddressItem = _self.$addressItem().filter("[data-address-id='" + addressId + "']");
                    let url = serviceData.requestURL.deleteAddressUrl;
                    const argument = {
                        addressId: addressId
                    }
                    serviceData.requestdata(url, argument, function (data) {
                        if (data.ret == 0) {
                            _deleteAddressItemReally($deleteAddressItem);
                            if($('.address-item').length < 1){
                                $('.no-items').removeClass('hidden');
                            }
                            const length = $('.address-list li').length;
                            if(length == 0){
                                serviceData.reload();
                            }
                        } else{
                            _recoveryDeleteAddressItem($deleteAddressItem);
                            $(".easyDialog_wrapper").addClass("rebuy-alert bind-alert");
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: data.msg,
                                    yesFn: false,
                                    noFn: false
                                }
                            });
                        }
                    })
                },
                noFn: true
            }
        })
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
}