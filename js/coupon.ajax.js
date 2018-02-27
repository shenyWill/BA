(function($) {
    window.components = window.components || {};
    window.components.coupon = window.components.coupon || {
        _config: {
            couponItemTemplate: "#couponItemTemplate",
            couponTabContent: "#couponTabContent",
            couponInput: "#coupon_code",
            pageSize: 12,
            page: {
                now: 1,
                used: 1,
                old: 1
            },
            isLoaded: {
                now: false,
                used: false,
                old: false
            },
            status: {
                now: 1,
                used: 2,
                old: 3
            },
            container: {
                now: "#couponNowList",
                used: "#couponUsedList",
                old: "#couponOldList"
            },
            pager : {
                now : "#couponNowPager",
                used : "#couponUsedPager",
                old : "#couponOldPager"
            },
            compiler: null
        },
        setConfig: function(config) {
            $.extend(this._config, config);
        },
        getConfig: function(configName) {
            return this._config[configName];
        },
        init: function() {
            this._getCoupon({type : "now",page: this.getConfig("page")["now"]});
        },
        toggleTab: function(obj,type) {
        	var $target = $(obj);
        	$target.addClass("active").siblings().removeClass("active");
            $(this.getConfig("couponTabContent")).find("[data-type='" + type + "']").show().siblings().hide();
            if (!this.getConfig("isLoaded")[type]) {
                this._getCoupon({type : type,page: this.getConfig("page")[type]});
            }
        },
        bindCoupon: function() {
            var $couponInput = $(this.getConfig("couponInput"));
            if (!$.trim($couponInput.val())) {
                easyDialog.open({
                    container: {
                        header: "提示",
                        content: "请输入优惠券编码",
                        yesFn: function() {}
                    }
                })
            } else {
                var _self = this;
                $.ajax({
                    url: "/coupon/index/bind-code",
                    type: "GET",
                    dataType: "json",
                    data: {
                        code: $.trim($couponInput.val())
                    }
                }).done(function(res) {
                    if (res.status == 200) {
                        window.location.reload();//服务层暂无返回数据，需刷新页面;
                        return false;
                        _self._renderCouponList({
                            type: "now",
                            res: res,
                            isPrepend: true
                        });
                    }else{
                    	easyDialog.open({
	                        container: {
	                            header: "提示",
	                            content: res.message,
	                            yesFn: function() {}
	                        }
	                    })
                    }
                }).fail(function() {
                    easyDialog.open({
                        container: {
                            header: "提示",
                            content: "绑定优惠券失败，请稍后再试",
                            yesFn: function() {}
                        }
                    })
                })
            }
        },
        _getCoupon: function(options) {
            var _self = this;
            $.ajax({
                url: "/coupon/index/my-coupon",
                type: "GET",
                dataType: "json",
                data: {
                    status: _self.getConfig("status")[options.type],
                    page: options.page,
                    pageSize: _self.getConfig("pageSize")
                }
            }).done(function(res) {
                if (res.status == 200) {
                	var currentLoaded = _self.getConfig("isLoaded"),
                        currentPage = _self.getConfig("page");
                	currentLoaded[options.type] =  true;
                    currentPage[options.type] = options.page;
                	_self.setConfig({
                		isLoaded : currentLoaded,
                        page : currentPage
                	});
                    _self._renderCouponList({
                        res: res,
                        type: options.type
                    });
                    _self._updateCouponCount(res.data);
                   
                } else {
                    easyDialog.open({
                        container: {
                            header: "提示",
                            content: res.message,
                            yesFn: function() {}
                        }
                    })
                }
            });
        },
        _renderCouponList: function(options) {
            if(options.res.data.coupons.length){
                this.getConfig("compiler") ? void(0) : this.setConfig({ compiler: Handlebars.compile($(this.getConfig("couponItemTemplate")).html()) });
                $.each(options.res.data.coupons,function(index,coupon){
                	if(options.type != 'now'){
                        coupon.type = options.type == "used" ? "used" : "expired";
                		coupon.isInvalid = true;
                	}else{
                        coupon.type = "active";
                		coupon.isInvalid = false;
                	}
                });
                var html = this.getConfig("compiler")(options.res.data);
                if (options.isPrepend) {
                    $(this.getConfig("container")[options.type]).prepend(html).show();
                    var $coupons = $(this.getConfig("container")[options.type]).children();
                    if($coupons.length > this.getConfig("pageSize")){
                        $coupons.last().remove();
                    }
                } else {
                    $(this.getConfig("container")[options.type]).html(html).show();
                }
            }else{
                $("[data-type='"+options.type+"']").find(".no-items").show();
            }
        },
        _renderCouponPagination: function(options) {
            var _self = this;
            if(options["res"]["data"]["coupons"].length > _self.getConfig("pageSize")){
                var itemsKey = options.type == "now" ? "can_use_num" : options.type == "used" ? "used_num" : "invalid_num";
                var pagerOptions = {
                    items : options["res"]["data"][itemsKey],
                    itemsOnPage : _self.getConfig("pageSize"),
                    currentPage : _self.getConfig("page")[options.type],
                    prevText : "上一页",
                    nextText : "下一页",
                    onPageClick : function(pageNumber){
                        _self._getCoupon({type:options.type,page : pageNumber});
                    }
                };
                $(_self.getConfig("pager")[options.type]).pagination(pagerOptions);
            }else{
                $(_self.getConfig("pager")[options.type]).empty();
            }
        },
        _updateCouponCount : function(data){
        	$("[data-tab]").each(function(index,tab){
        		var type = $(tab).attr("data-tab");
        		if(type == "now"){
        			$(tab).html("未使用（"+data.can_use_num+"）");
        		}else if(type == "used"){
        			$(tab).html("已使用（"+data.used_num+"）");
        		}else if(type == "old"){
        			$(tab).html("已过期（"+data.invalid_num+"）");
        		}
        	})
        }
    }
})(jQuery);

jQuery(function() {
    components.coupon.init();
});
