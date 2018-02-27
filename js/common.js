Array.prototype.each = function(fn) {
    fn = fn || Function.K;
    var a = [];
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < this.length; i++) {
        var res = fn.apply(this, [this[i], i].concat(args));
        if (res != null) a.push(res);
    }
    return a;
};
Array.prototype.contains = function(item) {
    return RegExp("\\b" + item + "\\b").test(this);
};
Array.prototype.uniquelize = function() {
    var ra = new Array();
    for (var i = 0; i < this.length; i++) {
        if (!ra.contains(this[i])) {
            ra.push(this[i]);
        }
    }
    return ra;
};
Array.intersect = function(a, b) {
    return a.uniquelize().each(function(o) {
        return b.contains(o) ? o : null
    });
};
Object.keys = Object.keys || function(obj) {
        if (obj !== Object(obj))
            throw new TypeError('Object.keys called on a non-object');
        var k = [],
            p;
        for (p in obj)
            if (Object.prototype.hasOwnProperty.call(obj, p)) k.push(p);
        return k;
    };

var Common = function() {
    this.getCustomer = getCustomer;
    this.initAddcart = initAddcart;
    this.initBacktop = initBacktop;
    this.initBacktopEvent = initBacktopEvent;
    this.$cartNum = $(".cart-num"); //购物车数量
    this.initLazyload = initLazyload;
    this.initGetCartPreview = initGetCartPreview;
    //左侧导航菜单效果
    this.initAnchor = initAnchor;
    this.initAnchorFollowScreen = initAnchorFollowScreen;



    var _self = this;

    function getCustomer() {
        $.ajax({
            url: "/o_customer/info/getCustomer",
            dataType: "json",
            type: "GET",
            cache: false,
        }).done(function(data) {
            _setCartNum_(data.cartItemCount);
            if (data.ret == 1) {
                $("#login,#register").hide();
                $("#customerName").text(data.customerName);
                $("#welcome").show();
                $("#logout").show();
                window.isLogin = true;
            }
        });
    }

    function initAddcart() {
        var $addcartBtn = $("[data-event='addcart']");
        $addcartBtn.on("click", function(event) {
            var $btn = $(event.currentTarget);
            if($btn.is(".disabled") || $btn.is(":disabled")){
                return false;
            }
            var addcartUrl = $btn.attr("data-url");
            var qty = $("#qty").length ? $("#qty").val() : 1;
            _doAjaxAddcart_({
                btn : $btn,
                url: addcartUrl,
                data: {
                    qty: qty
                }
            });
        });
    }

    function _doAjaxAddcart_(options) {
        $.ajax({
            url: options.url,
            type: "post",
            dataType: "json",
            data: options.data,
            beforeSend: function() {
                options.beforeSend && opitons.beforeSend();
                options.btn.attr("disabled","disabled").addClass("disabled").showBtnLoading();
            }
        }).done(function(data) {
            options.success && options.success(data);
            easyDialog.open({
                container: {
                    header: "提示",
                    content: data.msg,
                    yesText: "去购物车结算",
                    noText: "继续购物",
                    yesFn: function() {
                        window.location.href = "/cart/index";
                    },
                    noFn: function() {}
                }
            });
            if (data.ret == 1) {
                _setCartNum_(data.itemCount);
            }
        }).fail(function() {
            options.error && options.error();
        }).always(function() {
            options.always && options.always();
            options.btn.removeAttr("disabled").removeClass("disabled").hideBtnLoading();
        });
    }

    function _setCartNum_(itemCount) {
        var cartNum = itemCount > 99 ? "99+" : itemCount;
        _self.$cartNum.text(cartNum);
    }

    function initBacktop() {
        var win = window;
        var $backtop = $("#backtop");
        $(win).scroll(function(event) {
            if ($(win).scrollTop() > 650) {
                $backtop.fadeIn();
            } else {
                $backtop.hide();
            }
        });
    }

    function initBacktopEvent() {
        var $backtopAnchor = $("#backtopAnchor");
        $backtopAnchor.on("click", function(event) {
            event.preventDefault();
            $("html,body").stop().animate({
                scrollTop: 0
            });
        });
    }

    function initLazyload() {
        $("img.lazyload").lazyload({
            threshold: 320
        });
    }

    function initGetCartPreview() {
        $("#cartBox").hover(function(event) {
            _getCartPreview();
        }, function(event) {
            _hideCartPreview();
        });
    }

    function _getCartPreview() {
        $.ajax({
            url: "/checkout/cart/getMiniCart",
            type: "get",
            dataType: "json",
            beforeSend: function(xhr) {
                _hideCartPreviewNothing();
                _hideCartPreviewList();
                _showCartPreview();
                _showCartPreviewLoading();
                _self.cartPreviewXhr && _self.cartPreviewXhr.abort();
                _self.cartPreviewXhr = xhr;
            }
        }).done(function(data) {
            _hideCartPreviewLoading();
            if (data.ret == 0) {
                _renderCartPreviewItem(data.cart);
            }
        });
    }

    function _renderCartPreviewItem(cart) {
        if (cart.products.length) {
            $("#previewCount").text(cart.num ? parseInt(cart.num) : 0);
            $("#previewSubtotal").text(cart.subtotal);
            var $previewList = $("#previewList").children().remove().end();
            var previewProducts = cart.products;
            var previewItemTemplate = $("#previewItemTemplate").html();
            for (var i = 0; i < previewProducts.length; i++) {
                var productData = previewProducts[i];
                var tempItemTemplate = previewItemTemplate;
                for (var key in productData) {
                    var tempRegExp = new RegExp("{{" + key + "}}", "g");
                    tempItemTemplate = tempItemTemplate.replace(tempRegExp, productData[key]);
                }
                $previewList.append(tempItemTemplate);
            }
            _showCartPreviewList();
        } else {
            _showCartPreviewNothing();
        }
    }

    function _showCartPreviewList() {
        $("#previewTitle").show();
        $("#previewList").show();
        $("#previewSummary").show();
    }

    function _hideCartPreviewList() {
        $("#previewTitle").hide();
        $("#previewList").hide();
        $("#previewSummary").hide();
    }

    function _showCartPreview() {
        $("#cartPreview").addClass("visable");
    }

    function _hideCartPreview() {
        $("#cartPreview").removeClass("visable");
    }

    function _showCartPreviewLoading() {
        $("#cartPreview").addClass("loading");
    }

    function _hideCartPreviewLoading() {
        $("#cartPreview").removeClass("loading");
    }

    function _showCartPreviewNothing() {
        $("#cartPreviewNothing").show();
    }

    function _hideCartPreviewNothing() {
        $("#cartPreviewNothing").hide();
    }


    //品牌推荐页侧边导航begin
    function initAnchor(anchorNav,anchorLink) {
        $(anchorNav).on("click", function(event) {
            event.preventDefault();
            var $target = $(event.target).closest(anchorLink);
            if ($target.is($(event.currentTarget))) {
                return false;
            } else {
                var anchorHref = $target.attr("data-href");
                var $anchorTarget = $(anchorHref);
                var anchorTargetOffsetTop = $anchorTarget.offset().top;
                $('html,body').stop().animate({
                    scrollTop: anchorTargetOffsetTop
                }, 400);
            }
        });
    }
    function initAnchorFollowScreen(anchorNav,anchorContentTitle) {
        var win = window;
        var productAnchorHalfHeight = $(anchorNav).height() / 2;
        var anchorOffsetTop = $(anchorNav).offset().top;
        var absoluteTop = $(anchorNav).position().top;
        $(win).scroll(function() {
            var winScrollTop = $(win).scrollTop();
            var winHalfHeight = $(win).height() / 2;
            var changePositonThreshold = anchorOffsetTop + productAnchorHalfHeight - winHalfHeight;
            var anchorFixedTop = winHalfHeight - productAnchorHalfHeight;
            if (winScrollTop > changePositonThreshold) {
                $(anchorNav).css({
                    "position": "fixed",
                    "top": anchorFixedTop
                });
            } else {
                $(anchorNav).css({
                    "position": "absolute",
                    "top": absoluteTop
                });
            }
            _doToggleAnchor(anchorContentTitle,productAnchorHalfHeight, winScrollTop);
        });
    }
    function _doToggleAnchor(anchorContentTitle,productAnchorHalfHeight,winScrollTop) {
        anchorContentTitle.each(function(index, ele) {
            var $productSection = $(ele);
            if ($productSection.offset().top + productAnchorHalfHeight  - winScrollTop > 0) {
                var targetAnchor = $productSection.attr("data-anchor");
                $("[data-id='" + targetAnchor + "']").addClass("active").siblings().removeClass("active");
                return false;
            }
        });
    }
    //品牌推荐页侧边导航end

};
$(function() {
    var common = new Common();
    common.getCustomer();
    common.initAddcart();
    common.initBacktop();
    common.initBacktopEvent();
    common.initLazyload();
    common.initGetCartPreview();
    common.initAnchor("#brand-anchor",".anchor-link");
    common.index.initAnchorFollowScreen("#brand-anchor",$(".js-all-brands-main").find(".js-brands-wrap"));
});
