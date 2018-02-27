$(function() {
    var checked_checkbox=$('.supplier .nostock:checked');
    if(checked_checkbox.length>0){
        var part=checked_checkbox.parents('.country-part'),
            select_all=part.find('.select-all'),
            item_checkbox=part.find('.supplier .nostock'),
            select_checkboc=part.find('.supplier .nostock:checked');
        if(item_checkbox.length==select_checkboc.length)
        {
            select_all.attr('checked',true);
        };
    }
    var Checkout = function() {
        this.supplierId = $(".supplier").attr("id"); //购物车表格id
        this.subTotal = $("#priceSubtotal"); //总价
        this.weight = $("#itemWeight"); //重量
        this.freight = $("#priceFreight"); //运费
        this.discount = $("#priceDiscount"); //折扣
        this.grandTotal = $("#priceGrandtotal"); //应付总额
        this.itemQty = $("#itemQty"); //选择商品的数量
        this.cartNum = $(".cart-num"); //购物车数量
        this.currencySymbol = $("#currencySymbol").val(); //货币符号
        this.selectItemUrl = window.SELECT_ITEM_URL ? window.SELECT_ITEM_URL : ""; //output in checkout/chart.phtml
        this.qtyDecrease = $(".qty-handler-decrease"); //商品数量减
        this.qtyIncrease = $(".qty-handler-increase"); //商品数量加
        this.qty = $(".qty-num"); //商品数量
        this.supplier = $(".supplier"); //商品列表表格
        this.checkAllItem = $(".select-all"); //全选
        this.itemCheckbox = this.supplier.find(".item-checkbox"); //商品单项选择
        this.deleteSelectedItem = $("#deleteSelected"); //删除全部
        this.deletePlacedItem = $(".icon-cart-delete"); //删除指定
        this.moveToCollect = $(".move-to-collect"); //移入收藏夹
        this.submitCouponCode = $("#submitCouponCode"); //提交优惠码
        this.couponCode = $("#couponCode"); //优惠码
        this.couponDropdownHandler = $(".coupon-dropdown-handler"); //优惠券下拉
        this.couponLoading = $(".coupon-loading"); //优惠券加载提示
        this.couponList = $("#couponList"); //优惠券列表
        this.couponSelected = $("#couponSelected"); //已选优惠券
        this.cancelSelectedCoupon = $("#cancel-coupon"); //取消优惠券
        this.couponItemTemplate = $("#couponItemTemplate"); //优惠券item模板
        this.checkout = $("#btnCheckout"); //结账

        if (!this.__proto__) {
            this.__proto__ = Checkout.prototype;
        }
        var funcs = Object.keys(Checkout.prototype.autoRunFuncs);
        for (var i = 0; i < funcs.length; i++) {
            Checkout.prototype.autoRunFuncs[funcs[i]].call(this);
        }
        return this;
    };
    Checkout.prototype = {
        autoRunFuncs: {
            /*页面初次加载商品价格*/
            getInfo: function() {
                var _this_ = this;
                if ($("#noitems").length) return false;
                //_this_.__proto__.updateSettlement.call(_this_);
                $.ajax({
                    type: 'post',
                    url: '/cart/item/getInfo',
                    dataType: 'json',
                    data: 'ShippingMethod=tablerate',
                    beforeSend: function() {
                        _this_.__proto__.disableCheckout.call(_this_);
                    }
                }).done(function(data) {
                    _this_.__proto__.updateCartSettlement.call(_this_, data);
                }).always(function() {
                    _this_.__proto__.enableCheckout.call(_this_);
                });
            },
            /*初始化结账按钮*/
            initCheckout: function() {
                var _this_ = this;
                this.checkout.bind("click", function(event) {
                    if (_this_.checkout.hasClass("disabled") || _this_.checkout.is(":disabled")) {
                        return false;
                    } else if(!_this_.__proto__.checkLogin.call(_this_)){
                        return false;
                    }  else if(!$(".item-checkbox:checked").length){
                        easyDialog.open({
                            container: {
                                header: "提示",
                                content: "请选择商品再进行结账",
                                yesFn: function() {},
                                noFn: false
                            }
                        });
                    } else {
                        $.ajax({
                            url: "/checkout/cart/check",
                            type: "GET",
                            dataType: "json",
                            beforeSend: function() {
                                _this_.__proto__.disableCheckout.call(_this_);
                                _this_.checkout.showBtnLoading();
                            },
                            error:function(){
                                _this_.checkout.hideBtnLoading();
                                _this_.__proto__.enableCheckout.call(_this_);
                            }
                        }).done(function(data) {
                            if (data.ret == 1) {
                                window.location.href = "/onestepcheckout/";
                            } else {
                                _this_.__proto__.showDialog.call(_this_, {
                                    header: '提示',
                                    content: data.message,
                                    yesFn: function() {},
                                    noFn: false
                                });
                                _this_.checkout.hideBtnLoading();
                                _this_.__proto__.enableCheckout.call(_this_);
                            }
                        })
                    }
                });
            },
            /*初始化商品选中*/
            initItemCheckboxChange: function() {
                var _this_ = this;
                this.itemCheckbox.bind("change", function(event) {
                    _this_.__proto__.toggleRowStatus.call(_this_,$(event.currentTarget));
                    _this_.__proto__.updateSettlement.call(_this_);
                    if (_this_.itemCheckbox.not(":checked").length == 0) {
                        _this_.checkAllItem.attr("checked", "checked");
                    } else {
                        _this_.checkAllItem.attr("checked", false);
                    }
                });
            },
            /*初始化全选*/
            initCheckAllItem: function() {
                var _this_ = this;
                this.checkAllItem.bind("change", function(event) {
                    var isCheckAll = $(this).is(":checked");
                    if (isCheckAll) {
                        _this_.checkAllItem.attr("checked", "checked");
                        _this_.itemCheckbox.attr("checked", "checked");
                    } else {
                        _this_.checkAllItem.attr("checked", false);
                        _this_.itemCheckbox.attr("checked", false);
                    }
                    _this_.__proto__.toggleRowStatus.call(_this_,_this_.itemCheckbox);
                    _this_.__proto__.updateSettlement.call(_this_);
                });
            },
            /*初始化商品数量变更事件*/
            initQtyChange: function() {
                var _this_ = this;
                var timer;
                this.qty.bind("keyup", function(event) {
                    var $qty = $(this);
                    if (!$qty.val().match(/^[1-9]\d*$/)) {
                        $qty.val("1");
                    }
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function() {
                        _this_.__proto__.checkLimited.call(_this_, $qty);
                        _this_.__proto__.updateSettlement.call(_this_, true);
                    }, 100);
                });
                this.qtyDecrease.bind("click", function(event) {
                    var $decrease = $(event.currentTarget),
                        $qty = $decrease.next(),
                        limitedQty = parseInt($qty.attr("data-limitedqty"));
                    if ($decrease.is(".disabled")) {
                        return false;
                    }
                    if($qty > limitedQty){
                        return false
                    }
                    //判断freesample
                    if($(this).hasClass("free")){
                        return false;
                    }
                    if ($qty.val() != 1) {
                        $qty.val(parseInt($qty.val()) - 1);
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(function() {
                            _this_.__proto__.checkLimited.call(_this_, $qty);
                            _this_.__proto__.updateSettlement.call(_this_, true);
                        }, 100);
                    }
                    if ($qty.val() == 1) {
                        $decrease.addClass("disabled");
                    }
                });
                this.qtyIncrease.bind("click", function(event) {
                    var $increase = $(event.currentTarget),
                        $qty = $increase.prev(),
                        $decrease = $qty.prev(),
                        limitedQty = parseInt($qty.attr("data-limitedqty")),
                        qty_num = parseInt($qty.val());
                    $decrease.removeClass("disabled");
                    //判断最多购买
                    if(qty_num >= limitedQty){
                        return false;
                    }
                    //判断freesample
                    if($(this).hasClass("free")){
                        return false;
                    }
                    $qty.val(parseInt($qty.val()) + 1);
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(function() {
                        _this_.__proto__.checkLimited.call(_this_, $qty);
                        _this_.__proto__.updateSettlement.call(_this_, true);
                    }, 100);
                });
            },
            /*初始化删除选中商品*/
            initDeleteSelectedItem: function() {
                var _this_ = this;
                this.deleteSelectedItem.bind("click", function(event) {
                    var selectedItem = _this_.itemCheckbox.filter(":checked");
                    if (!selectedItem.length) {
                        _this_.__proto__.showDialog.call(_this_, {
                            header: '提示',
                            content: '没有任何商品被选中',
                            yesFn: function() {},
                            noFn: false
                        });
                    } else {
                        var selectedItemId = [],
                            num = 0,
                            itemQty = 0;
                        selectedItem.each(function(index, ele) {
                            itemQty = $(ele).parents(".item-row").find('.qty-num').val() - 0;
                            num+=itemQty;
                            selectedItemId.push($(ele).attr("data-item"));
                        });
                        _this_.__proto__.showDialog.call(_this_, {
                            header: '提示',
                            content: '您要删除选中的商品吗？',
                            yesFn: function() {
                                $.ajax({
                                    url: "/cart/item/deleteSelect",
                                    type: "POST",
                                    data: {
                                        id: selectedItemId.join(",")
                                    }
                                }).done(function(data) {
                                    var cartItemCount = $.cookie('cartItemCount') - 0;
                                    num = cartItemCount - num;
                                    num < 0 ? num = 0 : num = num;
                                    $.cookie('cartItemCount', num, { path: '/' });
                                    window.location.reload();
                                });
                            },
                            noFn: function() {}
                        });
                    }
                });
            },
            /*初始化删除指定的商品*/
            initDeletePlacedItem: function() {
                var _this_ = this;
                this.deletePlacedItem.bind("click", function(event) {
                    var deleteUrl = $(event.currentTarget).attr("data-deleteurl");
                    var deleteNum = $(event.currentTarget).parents(".item-row").find('.qty-num').val() - 0 || 0;
                    _this_.__proto__.showDialog.call(_this_, {
                        header: '提示',
                        content: '你确定要删除这个商品吗？',
                        yesFn: function() {
                            $.ajax({
                                url: deleteUrl,
                                type: "get",
                                dataType: "json"
                            }).done(function(data) {
                                if (data.ret == 1) {
                                    var cartItemCount = $.cookie('cartItemCount') - 0;
                                    var num = cartItemCount - deleteNum;
                                    $.cookie('cartItemCount', num, { path: '/' });
                                    _this_.__proto__.showDialog.call(_this_, {
                                        header: '提示',
                                        content: "删除成功",
                                        yesFn: function() {
                                            window.location.reload();
                                        },
                                    });
                                }
                            });
                        },
                        noFn: function() {}
                    });
                });
            },
            /*初始化移入收藏夹*/
            initMoveToCollect: function() {
                var _this_ = this;
                this.moveToCollect.bind("click", function(event) {
                    var $target = $(event.target);
                    if ($target.is(".collected")) {
                        return false;
                    }
                    var productId = $target.attr("data-product-id");
                    var deleteUrl = $target.attr("data-deleteurl");
                    var itemId = $target.attr("data-item-id");
                    var deleteNum = $target.parents(".item-row").find('.qty-num').val() - 0 || 0;
                    $.ajax({
                        url : "/checkout/cart/removeAndFavorite",
                        type : "post",
                        dataType : "json",
                        data : {
                            item_id : itemId
                        }
                    }).done(function(data){
                        if(data.ret == 0){
                            var cartItemCount = $.cookie('cartItemCount') - 0;
                            var num = cartItemCount - deleteNum;
                            $.cookie('cartItemCount', num, { path: '/' });
                            _this_.__proto__.showDialog.call(_this_, {
                                header: '提示',
                                content: "已为您将该产品移入收藏夹",
                                yesFn: function() {
                                    window.location.reload();
                                },
                            });
                            $("#closeBtn").hide();
                        }else{
                            _this_.__proto__.showDialog.call(_this_, {
                                header: '提示',
                                content: data.msg,
                                yesFn: function() {}
                            });
                        }
                    });
                });
            },
            /*初始化提交优惠码*/
            initSubmitCouponCode: function() {
                var _this_ = this;
                this.submitCouponCode.bind("click", function(evnet) {
                    if (!_this_.couponCode.val()) {
                        _this_.__proto__.showDialog.call(_this_, {
                            header: '提示',
                            content: "请输入优惠码",
                            yesFn: function() {}
                        });
                        return false;
                    }
                    if (!_this_.__proto__.checkLogin.call(_this_)) {
                        return false;
                    }
                    var options = {
                        settings: {
                            data: {
                                coupon_code: _this_.couponCode.val(),
                                currency: 0
                            },
                            beforeSend: function() {
                                _this_.submitCouponCode.showBtnLoading();
                            }
                        },
                        always: function() {
                            _this_.submitCouponCode.hideBtnLoading();
                        }
                    }
                    _this_.__proto__.useCoupon.call(_this_, options);
                });
            },
            /*初始化异步加载优惠券*/
            initGetAjaxCoupon: function() {
                var _this_ = this;
                this.couponDropdownHandler.bind("click", function(event) {
                    if (!_this_.__proto__.checkLogin.call(_this_)) {
                        return false;
                    }
                    _this_.__proto__.cancelLastRequest.call(_this_);
                    $.ajax({
                        url: "/customer/account/getCustomerCoupon",
                        type: "GET",
                        dataType: "json",
                        beforeSend: function(xhr) {
                            _this_.updateSettlementXhr = xhr;
                            _this_.couponLoading.show();
                        }
                    }).done(function(data) {
                        _this_.isLoadCoupon = true;
                        if (data.ret == 1) {
                            var coupons = data.data;
                            _this_.couponList.children().remove();
                            for (var couponId in coupons) {
                                var coupon = coupons[couponId];
                                var $_coupon_item = $("<li class='coupon-item clearfix'>").attr({
                                    "data-id": coupon.id,
                                    "data-code": coupon.code,
                                    "data-value": coupon.value,
                                    "title": coupon.title
                                });
                                var $_coupon_price = $("<span class='coupon-value'>").text(coupon.value);
                                var $_coupon_desc = $("<span class='coupon-name'>").text(coupon.title);
                                $_coupon_item.append($_coupon_price).append($_coupon_desc);
                                _this_.couponList.append($_coupon_item);
                            }

                        } else if (data.ret == 0) {
                            var $_nothing = $("<li class='coupon-item nothing'>").text("您没有可用的优惠券");
                            _this_.couponList.children().remove()
                                .end().append($_nothing);
                        }
                    }).always(function() {
                        _this_.couponList.show();
                        _this_.couponLoading.hide();
                    });
                });
            },
            /*初始化选择优惠券*/
            initSelectCoupon: function() {
                var _this_ = this;
                this.couponList.bind("click", function(event) {
                    var $target = $(event.target);
                    if (!$target.is(".coupon-item")) {
                        $target = $target.parent();
                    }
                    var couponCode = $target.attr("data-code"),
                        couponValue = $target.attr("data-value");
                    if (couponCode) {
                        var options = {};
                        options.settings = {
                            data: {
                                coupon_code: couponCode,
                                currency: 0
                            },
                            beforeSend: function() {
                                _this_.couponList.hide();
                                _this_.couponSelected.text("使用中，请稍后...");
                            }
                        };
                        options.done = function(data) {
                            if (data.ret == 0) {
                                _this_.couponSelected.text(couponValue);
                                _this_.cancelSelectedCoupon.show();
                                _this_.__proto__.resetCouponCode.call(_this_);
                            } else {
                                _this_.__proto__.resetSelectedCoupon.call(_this_);
                            }
                        };
                        _this_.__proto__.useCoupon.call(_this_, options);
                    }

                });
            },
            /*取消使用优惠券*/
            initCancelCoupon: function() {
                var _this_ = this;
                this.cancelSelectedCoupon.on("click", function(event) {
                    _this_.__proto__.showDialog.call(_this_, {
                        header: "提示",
                        content: "您确定要取消使用优惠券吗？",
                        yesFn: function() {
                            var options = {};
                            options.settings = {
                                data: {
                                    coupon_code: "",
                                    currency: 0
                                }
                            };
                            options.done = function(data) {
                                _this_.__proto__.resetSelectedCoupon.call(_this_);
                            }
                            _this_.__proto__.useCoupon.call(_this_, options);
                        },
                        noFn: function() {}
                    })
                });
            },
            /*点击页面其他部分隐藏下拉优惠券*/
            initHideAjaxContent: function() {
                var _this_ = this;
                $("body").on("click", function(event) {
                    if ($(event.target).find(".coupon-ajaxcontent").length != 0) {
                        _this_.couponList.hide();
                    }
                });
            },
            /*阻止头部及无产品登录跳转，在购物车页面异步登录*/
            initPreventHeaderLogin : function(){
                var _this_ = this;
                $(".login,#noItemsLogin").on("click",function(event){
                   // event.preventDefault();
                   // _this_.__proto__.showLoginBox.call(_this_);
                });
            },
            /*异步登录*/
            initValidateForm: function() {
                var $errorMsg = $("#errorMsg");
                var _extraValidate = {};
                var _submitFunc = {
                    ajaxlogin: function($form) {
                        $.ajax({
                            url: "/o_customer/accountservice/login",
                            type: "post",
                            dataType: "json",
                            data: {
                                email: $form.find("#LoginEmail").val(),
                                password: $form.find("#LoginPwd").val()
                            },
                            beforeSend: function() {
                                var $btnLogin = $form.find(".btn-login");
                                if ($btnLogin.is(".loading")) return false;
                                $btnLogin.showBtnLoading();
                                $errorMsg.text("");
                            }
                        }).done(function(data) {
                            if (data.ret == 0) {
                                window.location.reload();
                            } else {
                                $errorMsg.text(data.msg);
                                $form.find(".btn-login").hideBtnLoading();
                            }
                        }).fail(function(){
                            $errorMsg.text("登录失败，请稍后重试");
                            $form.find(".btn-login").hideBtnLoading();
                        });
                    }
                };
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
            },
            initCloseDialog: function(){
                $("#iconDialogClose").on("click",function(event){
                    easyDialog.close();
                });
            }

        },
        showDialog: function(options) {
            easyDialog.open({
                container: options
            });
        },
        /*填充结算金额*/
        updateCartSettlement: function(data) {
            if (data.subtotalValue || data.subtotalValue == 0)
                this.subTotal.text(data.subtotalValue);
            if (data.shippingValue || data.shippingValue == 0)
                this.freight.text(data.shippingValue);
            if (data.discount || data.discount == 0)
                this.discount.text(data.discount);
            if (data.grandTotal || data.grandTotal == 0)
                this.grandTotal.text(data.grandTotal);
            if (data.cartItemCount || data.cartItemCount == 0){
                var num = data.cartItemCount;
                $.cookie('cartItemCount', num, { path: '/' });
                this.cartNum.text(num);
            }
            if (data.baseInfo) {
                this.itemQty.text(data.baseInfo[this.supplierId]["ItemQty"]);
                this.weight.text(data.baseInfo[this.supplierId]["WeightTotal"]);
            }
        },
        /*更新商品小计*/
        updateItemsPrice: function(data) {
            for (var id in data) {
                var $_item_row = $("#" + id),
                    _qtyName_ = "cart[" + id + "][qty]",
                    $_qty = $_item_row.find("[name='" + _qtyName_ + "']"),
                    $_item_total_price = $_item_row.find(".item-total-price");
                $_item_total_price.text(this.formatPrice.call(this, data[id]["lastPrice"], $_qty.val()));
            }
        },
        /*格式化价格*/
        formatPrice: function(itemPrice, amount) {
            return this.currencySymbol + (parseFloat(itemPrice) * 100 * parseInt(amount) / 100).toFixed(2);
        },
        /*验证限购数量与库存*/
        checkLimitedQty: function($qty) {
            var limitedQty, qty;
            limitedQty = parseInt($qty.attr("data-limitedqty"));
            qty = parseInt($qty.val());
            if (qty >= limitedQty) {
                this.__proto__.showErrorTip.call(this, $qty, "limitedqty");
                return false;
            } else {
                this.__proto__.showErrorTip.call(this, $qty);
                return true;
            }
        },
        checkLimitedStorage: function($qty) {
            var limitedStorage, qty;
            limitedStorage = parseInt($qty.attr("data-limitedstorage"));
            qty = parseInt($qty.val());
            if (qty > limitedStorage) {
                this.__proto__.showErrorTip.call(this, $qty, "limitedstorage");
                return false;
            } else {
                this.__proto__.showErrorTip.call(this, $qty);
                return true;
            }
        },
        checkLimited: function($qty) {
            return this.__proto__.checkLimitedQty.call(this, $qty) &&
                this.__proto__.checkLimitedStorage.call(this, $qty);
        },
        /*显示限购与库存提示*/
        showErrorTip: function($qty, errorType) {
            var $errorTip = $("#" + $qty.attr("data-itemid")).find(".errorTip");
            if (errorType == "limitedqty") {
                $errorTip.text("产品限购" + $qty.attr("data-limitedqty") + "件").addClass("error");
            } else if (errorType == "limitedstorage") {
                $errorTip.text("产品库存还有" + $qty.attr("data-limitedstorage") + "件").addClass("error");
            } else {
                $errorTip.text("").removeClass("error");
            }
        },
        /*取消上次未完成的请求*/
        cancelLastRequest: function() {
            if (this.updateSettlementXhr) {
                this.updateSettlementXhr.abort && this.updateSettlementXhr.abort();
            }
        },
        /*使用优惠券*/
        useCoupon: function(options) {
            this.__proto__.cancelLastRequest.call(this);
            var _this_ = this;
            var defaultSettings = {
                url: "/checkout/cart/couponPost",
                type: "GET",
                dataType: "json",
            };
            $.extend(defaultSettings, options.settings);
            var oldBeforeSend;
            if (defaultSettings.beforeSend) {
                oldBeforeSend = defaultSettings.beforeSend;
            }
            defaultSettings.beforeSend = function(xhr) {
                _this_.updateSettlementXhr = xhr;
                oldBeforeSend && oldBeforeSend.call(_this_);
            }
            $.ajax(defaultSettings)
                .done(function(data) {
                    if (data.ret == 0 || data.ret == 3) {
                        _this_.__proto__.updateCartSettlement.call(_this_, {
                            discount: data.discount,
                            grandTotal: data.grandTotal,
                            shippingValue: data.ship
                        });
                    }
                    if (options.done && typeof options.done === "function") {
                        options.done.call(_this_, data);
                    }
                    _this_.showDialog.call(_this_, {
                        header: "提示",
                        content: data.msg,
                        yesFn: function() {}
                    });
                })
                .fail(function(data) {
                    if (options.fail && typeof options.fail === "function") {
                        options.fail.call(_this_, data);
                    }
                })
                .always(function(data) {
                    _this_.updateSettlementXhr = null;
                    if (options.always && typeof options.always === "function") {
                        options.always.call(_this_, data);
                    }
                });
        },
        /*重置选择优惠券*/
        resetSelectedCoupon: function() {
            this.cancelSelectedCoupon.hide();
            this.couponSelected.text("选择优惠券");
        },
        /*重置优惠码*/
        resetCouponCode: function() {
            this.couponCode.val("");
        },
        /*重置优惠码及优惠券*/
        resetSelectedCouponAndCode: function() {
            this.__proto__.resetSelectedCoupon.call(this);
            this.__proto__.resetCouponCode.call(this);
        },
        /*获取异步参数*/
        getItemsData: function() {
            var itemsData = [];
            $supplier = this.supplier;
            $supplier.each(function() {
                var _supplier_ = $(this),
                    _items_tr_ = _supplier_.find("tr.item-row"),
                    _items_ = [];
                _items_tr_.each(function(index, ele) {
                    var _tr_ = $(ele),
                        _itemId_ = _tr_.attr("id"),
                        _qty_ = _tr_.find(".qty-num").val();
                    _isSelected_ = _tr_.find(".item-checkbox").is(":checked");
                    _items_.push({
                        id: _itemId_,
                        qty: _qty_,
                        isSelected: _isSelected_
                    });
                });
                itemsData.push({
                    parterId: _supplier_.attr("id"),
                    shipping_method: _supplier_.find(".shipping-way .shipping-method").val(),
                    items: _items_
                });
            });
            return itemsData;
        },

        /*异步更新商品价格*/
        updateSettlement: function(isQtyChange) {
            var _this_,
                itemsData,
                tempData;
            this.__proto__.cancelLastRequest.call(this);
            itemsData = this.__proto__.getItemsData.call(this);
            tempData = {
                timestamp: new Date().getTime(),
                Data: itemsData
            };
            _this_ = this;
            $.ajax({
                type: "post",
                url: !isQtyChange ? _this_.selectItemUrl : "/cart/item/qtychange",
                dataType: "json",
                data: {
                    Data: JSON.stringify(tempData),
                    timestamp: new Date().getTime()
                },
                beforeSend: function(xhr) {
                    _this_.updateSettlementXhr = xhr;
                    _this_.__proto__.disableCheckout.call(_this_);
                }
            }).done(function(data) {
                _this_.__proto__.updateCartSettlement.call(_this_, data.Data);
                if (isQtyChange) {
                    _this_.__proto__.updateItemsPrice.call(_this_, data.Data.itemPriceArray);
                }
            }).always(function() {
                _this_.__proto__.enableCheckout.call(_this_);
                _this_.__proto__.resetSelectedCouponAndCode.call(_this_);
                _this_.updateSettlementXhr = null;
            });
        },
        disableCheckout: function() {
            this.checkout.attr("disabled", "disabled").addClass("disabled");
        },
        enableCheckout: function() {
            this.checkout.attr("disabled", false).removeClass("disabled");
        },
        checkLogin: function() {
            if (!$.cookie('loginRet') || $.cookie('loginRet') == 10 || $.cookie('loginRet') == '') {
                this.showLoginBox.call(this);
                return false;
            } else {
                return true;
            }
        },
        showLoginBox: function(){
           /*  easyDialog.open({
                container : "ajaxlogin"
            }); */
        },
        toggleRowStatus: function($checkbox){
            $checkbox.each(function(index,ele){
                var $this = $(ele);
                var itemId = $this.attr("data-item");
                var $itemRow = $("#"+itemId);
                $itemRow.is(".selected") ? $itemRow.removeClass("selected") : $itemRow.addClass("selected");
            });
        }
    };
    var checkout = new Checkout();
    /**
     * 优惠券交互
     **/
    $(".coupon-ctn").find(".coupon-tit a").on("click",function(event) {
        event.preventDefault();
        var $this = $(this), index = $this.index();
        $this.addClass("on").siblings().removeClass("on");
        var content=$('.coupon-con').eq(index);
        $(".coupon-con").hide();
        content.show();
    });
    /* Freesample */
    $(function(){
        jQuery('#mysamples').on('click','.J-img-container',function(){
            var quote_id=jQuery(this).attr('data-quote-id'),
                sku=jQuery(this).attr('data-samples-sku'),
                postUrl=jQuery(this).attr('data-samples-product-id'),
                spend_threshold=jQuery(this).attr('data-spend-threshold'),
                free_suit = jQuery(this).parents('.sample').find('.free_suit').text();
            var url='/freesample/index/checksample?quote_id='+quote_id+'&sku='+sku+'&spend_threshold='+spend_threshold;
            jQuery.ajax({
                url: url,
                type: 'get',
                async: false,
                dataType: 'json',
                success: function (data) {
                    var type=data.ret;
                    // 返回值：0表示可以加入购物车
                    // 1表示参数不正确
                    // 2没有达到赠送条件，金额应该超过40.00
                    // 3表示赠送商品数量最多不能超过2个

                    switch(type){
                        case 0:
                            addCart(postUrl);
                            break;
                        case 1:
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: '抱歉,加入购物车失败！',
                                    yesText: '再去逛逛',
                                    noText: '取消',
                                    yesFn: function (){
                                        window.location.href="/";
                                    },
                                    noFn: function(){

                                    }
                                }
                            });
                            break;
                        case 2:
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: '买'+free_suit+"免费获取该赠品，您当前尚不满足该条件。",
                                    yesText: '再去逛逛',
                                    noText: '取消',
                                    yesFn: function (){
                                        window.location.href="/";
                                    },
                                    noFn: function(){

                                    }
                                }
                            });
                            break;
                        case 3:
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: '赠品已经存在',
                                    yesFn: function (){},
                                    noFn: false
                                }
                            });
                            break;
                        case 4:
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: '赠品已经存在',
                                    yesFn: function (){},
                                    noFn: false
                                }
                            });
                            break;
                        case 5:
                            easyDialog.open({
                                container: {
                                    header: '提示',
                                    content: '抱歉,赠品已经送完',
                                    yesFn: function (){},
                                    noFn: false
                                }
                            });
                            break;
                    };

                }
            });
        })
        function addCart(postUrl) {
            jQuery.ajax({
                type: 'get',
                url: postUrl,
                async: false,
                dataType: 'json',
                success: function (data) {
                    if (data.ret == 1) {
                        var itemCount=data.itemCount,
                            cartSubtotal=data.cartSubtotal;
                        $.cookie('cartItemCount', itemCount, { path: '/' });
                        easyDialog.open({
                            container: {
                                header: '提示',
                                content: '赠品已成功加入购物车',
                                yesFn: function (){
                                    location.reload();
                                },
                                noFn: false
                            }
                        });
                        //成功点击关闭按钮刷新页面
                        jQuery("#closeBtn,#easyDialogBox").on('click',function(){
                            location.reload();
                        })
                    }else if(data.ret == 2){
                        easyDialog.open({
                            container: {
                                header: '提示',
                                content: '抱歉，当前商品不存在！',
                                yesFn: function (){},
                                noFn: false
                            }
                        });
                    }
                }
            });
        }
    })
    //添加右上角的样式
    $('.secondTop').find(".cart-step-2").removeClass("cart-step-2").addClass("cart-step-1");
    //页面滚动到底部时，自己固定结账条
/*    jQuery('.cart-right').wrap('<div class="cart-right-wrap"></div>');
        sticky();
    jQuery(window).on('scroll', function () {
        sticky();
    });
    function sticky() {
        var docHeight = jQuery(document).height(),
            footHeight = jQuery('.footer').outerHeight(),
            clientHeight = jQuery(window).height(),
            colHeight = jQuery('.col-main').outerHeight(true);

        if (jQuery(document).scrollTop() >= docHeight - clientHeight - footHeight) {
            jQuery('.cart-right').addClass('sticky');
        } else if (colHeight + 193 < clientHeight) {
            jQuery('.cart-right').removeClass('sticky');
        } else {
            jQuery('.cart-right').removeClass('sticky');
        }
    };*/
});
