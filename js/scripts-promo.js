/**************************  ui模块 ************************************/
/**
 * 结账页ui
 */
var isLogin;
var AccountCartView = (function($){
    var o;
    o = {};
    /**
     * 信息提示
     */
    o.msg = function (msg, type) {
        easyDialog.open({
            container: {
                header: '提示',
                content: msg,
                yesFn: function () {
                },
                noFn: false
            }
        });
    };
    /**
     * 商品数量错误提示
     */
    o.show_error = function (ele, msg) {
        var errorTip;
        $(ele).parents('tr').find('p.errorTip').html(msg);
    };
    /**
     * 商品数量错误提示隐藏
     */
    o.hide_error = function (ele) {
        $(ele).parents('tr').find('p.errorTip').html("");
    };
    /**
     * 更新购物车合计信息
     */
    o.initInfo = function (data) {
        if (String(data["ship"]) !== 'undefined') {
            $('.value', "#quote_shipping").text(data["ship"]);
        }
        if (String(data["discount"]) !== 'undefined') {
            $("#discount").text('-€' + data["discount"]);
        }
        if (String(data["discount"])== '0.00') {
            $("#discount").text('-€' +"0.00");
        }
        if (String(data["subtotal"]) !== 'undefined') {
            if ($('.value', "#quote_subtotal ").length) {
                $('.value', "#quote_subtotal ").text(data["subtotal"]);
            } else {
                $('#quote').val(data["subtotal"])
            }
        }
        if (String(data["grandtotal"]) !== 'undefined') {
            $(".all-price .main-total .all-grandtotal").text(data["grandtotal"]);
        }
        $("#total_weight").text(data["weight"]);
    };
    /**
     * 计算购物车中单行商品的总价。先获取单价，然后再乘以个数。
     */
    o.updateTableInfo = function (itemsData, itemPriceArray) {
        for (var id in itemPriceArray) {
            var $itemContain, itemPrice, qty, subtotal, currency, weight;
            $itemContain = $("#" + id);
            //从参数的qty里面获取数量而不是直接获取当前input。因为用户做了操作提交请求后还会改变值。
            qty = Number(itemsData[id].qty);
            subtotal = (Number(itemPriceArray[id]["lastPrice"]) * qty).toFixed(2);
            currency = $('#currency').val();  //货币符号
            weight = itemPriceArray[id]["itemWeight"];
            itemPrice =itemPriceArray[id]["itemPrice"];
            $itemContain.find('.qty').val(qty);
            $itemContain.find('.subtotal .cart-price').text(currency + itemPrice);
            $("#calculate-weight-item-id" + id).html(weight);
        }
    };
    /**
     * 获取当前item的数量和id
     */
    o.getItemsData = function () {
        var itemsData = {};
        $('.country-part table .tr-active').each(function () {
            var item = {};
            item.id = $(this).attr('id');
            item.qty = $(this).find('.qty').val();
            itemsData[item.id] = item;
        });
        return itemsData;
    };
    /**
     * 把所有购物车里面的数据解析为json,用于ajax使用(用于选择商品的数据)
     */
    o.getAllItemsDataChose = function () {
        var data,$container,good_info,isSelecteds,itemIds;
        isSelecteds = [];
        itemIds = [];
        data = {};
        good_info = {};
        $container = $(".supplier");
        //遍历获取商品信息
        $container.find('.item-checkbox').each(function (index) {
            isSelecteds[index] = $(this).prop('checked');
            itemIds[index] = $(this).attr('data-item');
        });
        good_info["parterId"] = $container.attr("id");
        good_info["shipping_method"] = $container.find('.shipping_method option:selected').val();
        good_info["id"] = itemIds.join("_");
        good_info["isSelected"] = isSelecteds.join("_");
        data["timestamp"] = new Date().getTime();
        data["Data"] = [good_info];
        return JSON.stringify(data);
    };
    /**
     * 获取所有item的id和数量等信息
     */
    o.getAllItemJsonData = function () {
        var $contain,data,good_info,itemInfo,good_list;
        $contain = $(".supplier");
        data = {};
        good_info = {};
        good_list = $contain.find('.qty');
        itemInfo = [];
        //获取选择商品的信息
        for (var i = 0; i < good_list.length; i++) {
            itemInfo[i] = {
                id: good_list.eq(i).parents('tr').attr('id'),
                qty: good_list.eq(i).val(),
                isSelected: good_list.eq(i).parents('tr').find('.item-checkbox').prop('checked')
            };
        }
        good_info["parterId"] = $contain.attr("id");
        good_info["shipping_method"] = $contain.find('.shipping_method option:selected').val();
        good_info["items"] = itemInfo;
        data["timestamp"] = new Date().getTime();
        data["Data"] = [good_info];
        return JSON.stringify(data);
    };
    /**
     * ajax过程中禁用按钮
     */
    o.beforeSend = function () {
        //禁用按钮
        $('#AccountButton').addClass("disabled")
            .attr("disabled", "disabled");
    };
    /**
     * ajax完成后启用按钮
     */
    o.complete = function () {
        //启用按钮
        $('#AccountButton').removeClass("disabled")
            .removeAttr("disabled");
    };
    return o;
}(jQuery));
window.lib = {};
/* 产品价格库存异步 */  
window.lib.ajaxProducts = window.lib.ajaxProducts || function(opt){
    var porduct_id='';
    $('.ajax-products').find('.ajax-products-item').each(function(){
        var id = $(this).attr("data-productid");
            porduct_id += id+',';
    });      
    $.ajax({
        url:"/pt_catalog/productservice/list?product_id="+porduct_id,
        dataType:"json",
        type:"GET",
        cache: false,
        global : false  ,  
        beforeSend:function(){
            $('.OrangeButton').attr("disabled","disabled");
        },
        complete:function(){
            $('.OrangeButton').removeAttr("disabled","disabled");
        },        
        success:function(resJSON){
            typeof opt.success === "function" && opt.success.call(window,resJSON);            
        },
    });
}  
/**
 * 订单确认页ui
 */
var OrderPageView = function ($) {
    return {
        init_pay_info: function (d) {
            var $html;
            d.total && jQuery(".should-pay .fee").find('strong').html(d.total);
            d.ship && jQuery(".computed-price p").eq(1).find('strong').html(d.ship);
            if (d.discount){
                $html = $(d.discount);
                $html.html("-" + $html.html());
                jQuery("#discount").html($html[0]);
            }
        },
        msg: function (msg, type) {
            easyDialog.open({
                container: {
                    header: '提示',
                    content: msg,
                    yesFn: function () {
                    },
                    noFn: false
                }
            });
        },
        beforeSend: function(){
            $("#onestepcheckout-place-order").attr("disabled","disabled").addClass("disabled");
        },
        complete:function(){
            $("#onestepcheckout-place-order").removeAttr("disabled","disabled").removeClass("disabled");
        }
    }
}(jQuery);
/**
 * 地址管理页ui
 */
var PageAddressView;
PageAddressView = (function ($) {
    var o = {};
    o.show_error = function ($ele, msg) {
        $ele.siblings(".adck-tip").html(msg).show();
    };
    o.hide_error = function ($ele) {
        $ele.siblings(".adck-tip").html("").hide();
    };
    return o
}(jQuery));
/**
 * 身份验证ui
 */
var IdValidatorView = (function ($, disableify) {
    var o, $name, $is_confirm, $contain, $pass_tip, $need_tip, $success_img, $input, $ing_ele, $fail_msg, $id_input;
    o = {};
    $name = $('#receiver');
    $is_confirm = $("#autonym_bool");
    $contain = $("#certification");
    $pass_tip = $contain.find(".pass-validate");
    $need_tip = $("#idnum_text");
    $success_img = $contain.find(".J_succeed");
    $input = $("#J_card_show");
    $ing_ele = $contain.find(".validating");
    $fail_msg = $contain.find(".prompt.restrictions_guo");
    $id_input = $("#receiver-id");

    o.confirm_passed = function (name) {
        $contain.show();
        $success_img.show();
        $pass_tip.show();
        $need_tip.hide();
        $input.hide();
        $ing_ele.hide();
        //全局验证状态设为已验证
        $name.html(name);
        $is_confirm.val(1);

    };
    o.need_confirm = function (name) {
        $contain.show();
        $need_tip.show();
        $input.show();
        $pass_tip.hide();
        $success_img.hide();
        $fail_msg.hide();
        $ing_ele.hide();
        $name.html(name);
        $is_confirm.val(0);
        $id_input.val("");
    };
    o.confirm_needless = function () {
        $contain.hide();
        $is_confirm.val(1);
    };
    o.confirm_fail = function (msg) {
        $pass_tip.hide();
        $success_img.hide();
        $ing_ele.hide();
        $input.show();
        $need_tip.show();
        $fail_msg.html(msg).show();
        $is_confirm.val(0);
        $('#idSubBtn').removeAttr("disabled").css("background","#cc1439");
    };
    o.confirming = function () {
        $fail_msg.hide();
        $ing_ele.show();
        $('#idSubBtn').attr("disabled","disabled").css("background","#ccc");
    };
    return o;
})(jQuery);
/************************** ui end ************************************/
/***************************  确认订单页  ***********************************************/
jQuery(function () {
    if(jQuery('#autonym_bool').val() == ""){
        jQuery('.pass-validate').hide();
    }
    //添加右上角的样式
    jQuery('.secondTop').append('<div class="cart-step-2 cart-step clearfix"><span class="step-1">我的购物车</span><span class="step-2">订单提交</span></div>');
    /**
     * 身份验证
     */
    !function ($) {
        $("#idSubBtn").on("click", function (e) {
            e.preventDefault();
            var $select = $('.address.selectd');
            var data = {
                id_no: $.trim($('#receiver-id').val()),
                customer_address_id: $('.address.selectd').find('.name-phone > input').val(),
                id_name: $('#receiver').text(),
                mail:$select.find(".mail").html(),
                phone:$select.find(".phone").html()
            };
            //身份验证
            IdValidator(IdValidatorView, data)
        });
    }(jQuery);


    /**
     * 更多地址收起隐藏
     */
    !function ($) {
        //收货地址显示
        $('.J_unfold_add').click(function () {
            if ($(this).hasClass('expand')) {
                $(this).removeClass('expand');
                $('.J_begin').hide();
                $('.J_address_text').text('更多地址');
            } else {
                $(this).addClass('expand');
                $('.J_begin').show();
                $('.J_address_text').text('收起地址');
            }
        });
    }(jQuery);
});
/***************************************** 确认订单页 end  ****************************/
/*****************************************  首页  ***********************************************/
/**
 * 可拉动商品列表
 */
jQuery(function () {
    /**
     * tab标签切换
     */
    /*!function($){
     var $contain, $tab_list,$product_list;
     $contain = $("#IndexProduct");
     $tab_list = $contain.find(".single-tab");
     $product_list = $contain.find(".list_scroll");
     if (!$contain.length){return}
     $contain.on("click",".single-tab",function(){
     var index;
     //tab切换
     $(this).addClass("current").siblings(".current").removeClass("current");
     //产品列表切换
     index = $tab_list.index(this);
     $contain.find(".IndexProductContain .current").removeClass("current").hide();
     $product_list.eq(index).addClass("current").show();
     });
     //点击显示第一个
     $tab_list.eq(0).trigger("click");
     }(jQuery);*/
    /***鼠标移动在商品***/
    jQuery('.J_hover').hover(function(){
        jQuery(this).addClass('hover_top');
    },function(){
        jQuery('.J_hover').removeClass('hover_top');
    })
    /***鼠标移动在商品2***/
    jQuery('.J_tab').hover(function(){
        var index=jQuery(this).index();
        jQuery('.J_tab').removeClass('on');
        jQuery(this).addClass('on');
        jQuery('.J_IndexProductContain .hlock').hide();
        jQuery('.J_IndexProductContain .hlock').eq(index).show();
    })
    /**
     * 品牌列表拉动
     */
    !function($){
        if (!$(".PopBrandsContain").length){return;}
        var slider = H_slider(".PopBrandsContain",8,1000,121);
        $(".PopBrandsArrow.left").on("click",function(){
            if($(this).hasClass('on')){
                $('.PopBrandsArrow').removeClass('PopBrandsArrow2').removeClass('on');
                $(".PopBrandsArrow.right").addClass('on');
                slider.slide("right",8)
            }
        });
        $(".PopBrandsArrow.right").on("click",function(){
            if($(this).hasClass('on')){
                $('.PopBrandsArrow').addClass('PopBrandsArrow2').removeClass('on');
                $(".PopBrandsArrow.left").addClass('on');
                slider.slide("left",8)
            }
        });
        setInterval(function(){
            // jQuery(".PopBrandsArrow.right").trigger("click");
        },4000)
    }(jQuery);
    /**
     * 顶部公告栏伸缩
     */
    !function($){
        $("#TopNotice").on("click",function(){
            $(this).toggleClass("active");
            $(this).find(".content").slideToggle();
        })
    }(jQuery)
});
/******************************  首页 end *************************************/
/***********************  商品详情页  ***************************/

/*******************************  商品详情页end **************************/
/******************************  all page  **********************************/
jQuery(function () {
    /**
     * 延迟加载
     */
    !function($){
        var product_list, index_contain,brand_contain;
        index_contain = jQuery(".top-menu-product .item,.IndexProductContain,.f-product-list,.m-topics-wrap");
        product_list = jQuery(".category-products,#samples,.cart-table,.personal-content,.order-outer,.summary-table,.ajax-products");
        brand_contain = jQuery(".PopBrandsContain");
        guess_contain = jQuery(".IndexGuessProductContain");
        try{
            //产品列表
            if (product_list.length) {
                product_list.each(function () {
                $(this).find(".lazy_product").lazyload({
                    placeholder : "/skin/frontend/PlumTree/ba_pc/images/product-placeholder.jpg", //用图片提前占位
                    effect: "fadeIn",
                    threshold: 380
                })
            })
            }
            //产品列表
            if (index_contain.length) {
                index_contain.find(".lazy_product").lazyload({
                    effect: "fadeIn",
                    threshold: 380
                })
            }
            //品牌图片
            if (brand_contain.length){
                brand_contain.find(".PopBrandsImg").lazyload({
                    effect: "fadeIn",
                    threshold: 380
                });
                brand_contain.find(".PopBrandsImg").lazyload({
                    effect: "fadeIn",
                    event: "sporty"
                });
                brand_contain.find(".PopBrandsArrow").on("click",function(){
                    brand_contain.find(".PopBrandsImg").trigger("sporty");
                });
            }
            //猜你喜欢
            if (guess_contain.length) {
                guess_contain.find(".lazy_product").lazyload({
                    effect: "fadeIn",
                    event: "sporty"
                })
            }
            //普通图片
            jQuery("img.lazy_common").lazyload({
                effect: "fadeIn",
                threshold: 380
            });
        }catch(e){}
        

    }(jQuery);
    /**
     * 二级导航栏
     */
    !function ($) {
        if (!$("#H-nav").length){return;}
        $("#H-nav").find(".nav-top").each(function () {
            var $this = $(this);
            $this.one("mouseover", function () {
                var html = $this.find(".brand-html").html();
                $(html).appendTo($this.find(".nav-top-contain"));
            });
        });
        $("#H-nav").one("mouseover",".js-nav-top-topics", function () {
            var url = specialUrl + "/v1/special";
            $.ajax({
                url:url,
                dataType:"json",
                type:"get",
                cache: false,
                data:{"websiteId":websiteId,"count":8},
                success:function(data){
                    var ret = data.status;
                    if(ret == 200){
                        //显示结果页的函数
                        var source = $('#nav-top-topic-product').html(),
                            template = Handlebars.compile(source),
                            html = template(data);
                        $('#nav-topics-wrap').html(html);
                    }
                }
            });
        });
        /*导航选中效果*/
        var urlstatus=false;
        $("#H-nav .nav-top").each(function () {
            var $this = $(this);
            var $nav_title = $this.find(".nav-top-title");
            var urlstr = location.href;
            if ((urlstr + '/').indexOf($nav_title.attr('href')) > -1&&$nav_title.attr('href')!='') {
                $this.addClass('active');
                urlstatus = true;
            } else {
                $this.removeClass('active');
            }
        });
        if (!urlstatus) {$("#H-nav .nav-top").eq(0).addClass('active'); }
    }(jQuery);

    /**
     * 回到顶部
     */
    !function($){
        //回到顶部
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('#right-bar-new,#left-bar-new,#back-top').css('display','block');
            } else {
                $('#right-bar-new,#left-bar-new,#back-top').fadeOut();
            }
        });
        // scroll body to 0px on click
        var back_top = $('#back-top a');
        if (back_top.length) {
            $('#back-top a').click(function () {
                $('body,html').stop(false, false).animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        }
    }(jQuery);

    /**
     * 在线客服
     */
    !function($){
        //回到顶部
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('#right-bar-new,#left-bar-new,#back-top').css('display','block');
            } else {
                $('#right-bar-new,#left-bar-new,#back-top').fadeOut();
            }
        });
        // scroll body to 0px on click
        var back_top = $('#back-top a');
        if (back_top.length) {
            $('#back-top a').click(function () {
                $('body,html').stop(false, false).animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        };

        $(".js-kefu-nav").on("click",function(){
            $("#kf5-support-btn").trigger("click");
        })
    }(jQuery);


    ! function($) {
        $(".num-box").html(components.cartItemCount.get());
    }(jQuery)
    /**
     * 顶部尾部微信交互
     */
    $('.header .rate_tip').hover(function(){
        $('.tip_text').toggle();
    });
    $('.s-right .wechat').hover(function(){
        $('.footer-wx').toggle();
    });
    $('i.kf-e').hover(function(){
       $('.kfe-wx').toggle();
    });
    $('i.kf-f').hover(function(){
        $('.kff-wx').toggle();
    });
    $('i.kf-fu').hover(function(){
        $('.kfu-wx').toggle();
    });
    $('i.kf-cn').hover(function(){
        $('.kcn-wx').toggle();
    });    
    $('.order-title i.contact-kf').hover(function(){
        $('.order-wx').toggle();
    });
    /**
     * 顶部的购物车交互
     */
    //(new ShoppingBag('.shop-bag', '.shop-bag b')).init();
});
function setLocation(url) {
    window.location.href = url;
}
//错误信息显示
//jQuery(document).ready(function () {
//    var $ = jQuery;
//
//    if (!$('ul.messages').length) return;
//
//    $('ul.messages .error-msg').find('span').each(function () {
//        if ($.trim($(this).text())) {
//            $('ul.messages').show();
//            return false;
//        }
//    });
//
//    //点击跳转
//});
/********************** all page end  **********************************/
/******************  结账页 ***************/
jQuery(function () {
    if (!jQuery('#shopping-cart').length) {return;}
});
/******************  结账页 end ***********/

/******************  加入购物车模块 ***********/
function addCart(productId) {
    var data = "";
    //捆绑产品传递参数
    var bundleItem = jQuery('.js-bundle-item');
    //如果是可捆绑产品则需要验证和提交参数,bundle为全局变量
    if (bundleItem.length !== 0) {
        // if(!bundle.validateRequireSelect()){
        //     return;
        // }
        bundleItem.each(function (index) {
            if (jQuery(this).prop('checked')) {
                if (index !== 0 || data != "") {
                    data = data + "&";
                }
                var bundleItemName = jQuery(this).attr('name');
                var bundleItemValue = jQuery(this).val();
                data = data + bundleItemName + "=" + bundleItemValue;
            }
        });
    }
    /* 判断数量 */
    var qtyItem = jQuery(".js-qty"), val;
    if (qtyItem.length !== 0) {
        val = qtyItem.val().replace(/\s/g, '');
        if (!/^[1-9]\d*$/.test(val)) {
            alert('数量必须是大于0的整数');
            return false;
        }
    } else if (qtyItem.length !== 0) {
        val = qtyItem.val().replace(/\s/g, '');
        if (!/^[1-9]\d*$/.test(val)) {
            easyDialog.open({
                container: {
                    header: '提示',
                    content: '数量必须是大于0的整数',
                    yesFn: function () {
                    }
                }
            });
            return false;
        }
    }
    qtyItem.each(function (index) {
        if (index !== 0 || data != "") {
            data = data + "&";
        }
        data = data + jQuery(this).attr('name') + "=" + jQuery(this).val();
    });
    /*ajax*/
    jQuery.ajax({
        type: 'GET',
        url: '/v2/item/add',
        dataType: 'jsonp',
        data: {product_id: productId , qty: val},
        success: function (data) {
            if (data.status == 200) {
                jQuery(".num-box").text(data.data.total_count);
                jQuery('#CartNum').html(data.data.total_count);
                components.cartItemCount.set(data.data.total_count);
                easyDialog.open({
                    container: {
                        content: '<div class="tip-success-content"><p>商品已成功添加到购物车</p><p>购物车一共有<span style="color:#f00">' + data.data.total_count + '</span>件商品</p></div>'
                    },
                    autoClose : 1200
                });
                if(sa_enabled && typeof indexSensors !== "undefined") { //神策加入购物车埋点
                    jQuery.ajax({
                        url: '/cart/data/add-shopping-cart',
                        data: {product_id:productId, qty: val},
                        dataType: 'jsonp',
                        type: 'GET',
                        success: function(result){
                            if(result.status == 200){
                                indexSensors.add_shopping_cart('add_shopping_cart', JSON.stringify(result.data)); //神策加入购物埋点                                   
                            }
                        }
                    })
                }
            } else{
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: '<div class="tip-fail-content"><p>' + data.message + '</p></div>',
                        yesFn: function () {
                        }
                    }
                });
            }
        },
        error: function (e) {
            easyDialog.open({
                container: {
                    header: '提示',
                    content: '网络错误，加入购物车失败',
                    yesFn: true
                }
            });
        }
    });
}
/**
 * 全选 / 全不选的交互功能
 * @require jQuery
 * @param {String | HTMLElement} 参数 all，全选的 checkbox
 * @param {String | HTMLElement} 参数 other，其他的 checkbox
 * @param {String} 参数 parents，单个 checkbox 的某个父级元素的选择器
 * @param {String} 参数 klass，用来切换的 className
 */
~function ($) {
    function CheckAllToggle(all, other, parents, klass) {
        this.all = $(all);
        this.other = $(other);
        this.parents = parents;
        this.klass = klass;
    }
    CheckAllToggle.prototype.toggleAll = function () {
        var _that = this;
        this.all.click(function () {
            if ($(this).prop('checked')) {
                _that.other.prop('checked', true);
                _that.other.each(function () {
                    $(this).parents(_that.parents).addClass(_that.klass);
                });
            } else {
                _that.other.prop('checked', false);
                _that.other.each(function () {
                    $(this).parents(_that.parents).removeClass(_that.klass);
                });
            }
        });
    };
    CheckAllToggle.prototype.toggleOther = function () {
        var count = this.other.length,
            _that = this;
        this.other.each(function () {
            $(this).click(function () {
                var len = _that.other.filter(':checked').length;
                if (len === count) {
                    _that.all.prop('checked', true);
                } else {
                    _that.all.prop('checked', false);
                }
                if ($(this).prop('checked')) {
                    $(this).parents(_that.parents).addClass(_that.klass);
                } else {
                    $(this).parents(_that.parents).removeClass(_that.klass);
                }
            });
        });
    };
    CheckAllToggle.prototype.init = function () {
        this.toggleAll();
        this.toggleOther();
    };
    window.CheckAllToggle = CheckAllToggle;
}(jQuery);

/* 头部交互 */
jQuery('.HeaderPop .cart_tip').hover(function(){
    jQuery('.tip_text').toggle();
});
/**
 * 二级菜单
 */
!function($){
    if (!$("#H-nav").length){return;}
    var out_width;
    out_width = $("#H-nav").width();
    $(".nav-top","#H-nav").on("hover",function(){
        var width,tab_position,$this,$pop;
        $this = $(this);
        tab_position = $this.position();
        $pop = $this.find(".nav-top-contain");
        width = $pop.width();
        if ((width + tab_position.left) > out_width){
            //弹出层位置: -(弹出层宽度 - (外层元素宽度 - 父级tab距离外层元素左侧距离))
            var tar_left = -((width+40) - (out_width - tab_position.left));
            $pop.css("left",tar_left);
        }
    })
}(jQuery);

/* 一级分类落地页scoll */
jQuery(function(){
    var $ = jQuery;

    (function($){
        $.extend($.easing,{
            easeInSine: function (x, t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            }
        });

        $.fn.Xslider=function(settings){
            settings=$.extend({},$.fn.Xslider.sn.defaults,settings);
            this.each(function(){
                var scrollobj=settings.scrollobj ? $(this).find(settings.scrollobj) : $(this).find("ul"),
                    viewedSize=settings.viewedSize || (settings.dir=="H" ? scrollobj.parent().width() : scrollobj.parent().height()),//length of the wrapper visible;
                    scrollunits=scrollobj.find("li"),//units to move;
                    unitlen=settings.unitlen || (settings.dir=="H" ? scrollunits.eq(0).outerWidth() : scrollunits.eq(0).outerHeight()),
                    unitdisplayed=settings.unitdisplayed,//units num displayed;
                    numtoMove=settings.numtoMove > unitdisplayed ? unitdisplayed : settings.numtoMove,
                    scrollobjSize=settings.scrollobjSize || scrollunits.length*unitlen,//length of the scrollobj;
                    offset=0,//max width to move;
                    offsetnow=0,//scrollobj now offset;
                    movelength=unitlen*numtoMove,
                    pos=settings.dir=="H" ? "left" : "top",
                    moving=false,//moving now?;
                    btnright=$(this).find("a.aright"),
                    btnleft=$(this).find("a.aleft");

                btnright.unbind("click");
                btnleft.unbind("click");

                settings.dir=="H" ? scrollobj.css("left","0px") : scrollobj.css("top","0px");

                if(scrollobjSize>viewedSize){
                    if(settings.loop=="cycle"){
                        btnleft.removeClass("agrayleft");
                        if(scrollunits.length<2*numtoMove+unitdisplayed-numtoMove){
                            scrollobj.find("li").clone().appendTo(scrollobj);
                        }
                    }else{
                        btnleft.addClass("agrayleft");
                        offset=scrollobjSize-viewedSize;
                    }
                    btnright.removeClass("agrayright");
                }else{
                    btnleft.addClass("agrayleft");
                    btnright.addClass("agrayright");
                }

                btnleft.click(function(){
                    if($(this).is("[class*='agrayleft']")){return false;}

                    if(!moving){
                        moving=true;

                        if(settings.loop=="cycle"){
                            scrollobj.find("li:gt("+(scrollunits.length-numtoMove-1)+")").prependTo(scrollobj);
                            scrollobj.css(pos,"-"+movelength+"px");
                            $.fn.Xslider.sn.animate(scrollobj,0,settings.dir,settings.speed,function(){moving=false;});
                        }else{
                            offsetnow-=movelength;
                            if(offsetnow>unitlen*unitdisplayed-viewedSize){
                                $.fn.Xslider.sn.animate(scrollobj,-offsetnow,settings.dir,settings.speed,function(){moving=false;});
                            }else{
                                $.fn.Xslider.sn.animate(scrollobj,0,settings.dir,settings.speed,function(){moving=false;});
                                offsetnow=0;
                                $(this).addClass("agrayleft");
                            }
                            btnright.removeClass("agrayright");
                        }
                    }

                    return false;
                });
                btnright.click(function(){
                    if($(this).is("[class*='agrayright']")){return false;}

                    if(!moving){
                        moving=true;

                        if(settings.loop=="cycle"){
                            var callback=function(){
                                scrollobj.find("li:lt("+numtoMove+")").appendTo(scrollobj);
                                scrollobj.css(pos,"0px");
                                moving=false;
                            }
                            $.fn.Xslider.sn.animate(scrollobj,-movelength,settings.dir,settings.speed,callback);
                        }else{
                            offsetnow+=movelength;
                            if(offsetnow<offset-(unitlen*unitdisplayed-viewedSize)){
                                $.fn.Xslider.sn.animate(scrollobj,-offsetnow,settings.dir,settings.speed,function(){moving=false;});
                            }else{
                                $.fn.Xslider.sn.animate(scrollobj,-offset,settings.dir,settings.speed,function(){moving=false;});//滚动到最后一个位置;
                                offsetnow=offset;
                                $(this).addClass("agrayright");
                            }
                            btnleft.removeClass("agrayleft");
                        }
                    }

                    return false;
                });

                if(settings.autoscroll){
                    $.fn.Xslider.sn.autoscroll($(this),settings.autoscroll);
                }
            })
        }

        $.fn.Xslider.sn={
            defaults:{
                dir:"H",
                speed:500
            },
            animate:function(obj,w,dir,speed,callback){
                if(dir=="H"){
                    obj.animate({
                        left:w
                    },speed,"easeInSine",callback);
                }else if(dir=="V"){
                    obj.animate({
                        top:w
                    },speed,"easeInSine",callback);
                }
            },
            autoscroll:function(obj,time){
                var  vane="right";
                function autoscrolling(){
                    if(vane=="right"){
                        if(!obj.find("a.agrayright").length){
                            obj.find("a.aright").trigger("click");
                        }else{
                            vane="left";
                        }
                    }
                    if(vane=="left"){
                        if(!obj.find("a.agrayleft").length){
                            obj.find("a.aleft").trigger("click");
                        }else{
                            vane="right";
                        }
                    }
                }
                var scrollTimmer=setInterval(autoscrolling,time);
                obj.hover(function(){
                    clearInterval(scrollTimmer);
                },function(){
                    scrollTimmer=setInterval(autoscrolling,time);
                });
            }
        }
    })(jQuery);
    (function(){
        $(".one").Xslider({
            unitdisplayed:1,
            numtoMove:1,
            speed:300,
            scrollobjSize:Math.ceil($(".one").find("li").length/1)*481
        });
        $(".second").Xslider({
            unitdisplayed:1,
            numtoMove:1,
            speed:300,
            scrollobjSize:Math.ceil($(".second").find("li").length/1)*481
        });
        $(".third").Xslider({
            unitdisplayed:1,
            numtoMove:1,
            speed:300,
            scrollobjSize:Math.ceil($(".third").find("li").length/1)*481
        });
    }())
});
/**
 * 商品拉动
 */
!function($){
    $(function(){
        var slider_ele = $(".js-scroll-box");
        if (!slider_ele.length){
            return;
        }
        var o = {
            max_num: 5,  //滑动展示的数量
            speed: 400,  //速度
            num: 5,  //每次滑动数
            w: 238
        };
        slider_ele.each(function () {
            var handle, $this;
            $this = $(this);

            handle = H_slider(this, o.max_num, o.speed, o.w);

            $this.siblings(".left-arrow").on("click", function () {
                handle.slide("right", o.num);//1为每次滑动个数
                $this.find(".lazy_product").trigger("sporty");  //触发图片加载
            });
            $this.siblings(".right-arrow").on("click", function () {
                handle.slide("left", o.num);
                $this.find(".lazy_product").trigger("sporty");  //触发图片加载
            });
            if($this.find('.ProductOuter').length<5){    //不足隐藏切换
                $this.siblings('.left-arrow,.right-arrow').hide();
            }
        });
    })
}(jQuery);

/**
 * 商品水平滚动轮播
 * Date : 2017.08.30
 */
!function($){
    $(function(){
        var $container = $(".horizontal-scroll-common");
        if (!$container.length){
            return;
        } 
        $container.each(function(index,item){
            new horSlider({
                selector:this,  //容器
                show_num: 5,    //滚动展示的数量
                slide_num: 5,   //每次滚动数
                speed: 400      //速度
            })
        })
    })
}(jQuery);

/**
 * 切换及滑动商品列表
 */
!function($){
    function TabHover(){
        var index,$this;
        $this = $(this);
        index = $(this).index();
        $this.siblings(".on").removeClass("on");
        $this.addClass("on");
        $this.parents(".bundleProduct")
            .find(".IndexProductInner")
            .hide()
            .eq(index)
            .show()
            .find(".lazy_product").trigger("sporty");
    }
    if ($("#IndexProductTab").length){
        $(".IndexProductTabOuter .IndexTabName").on("hover",TabHover);
        $(".IndexProductTabOuter").each(function(){
            TabHover.call($(this).find(".IndexTabName").eq(0));
        })
    }
}(jQuery)

/* 二级标题 */
jQuery(function(){
    var url = window.location.pathname;
    var sectitles = new Array();
    sectitles[0]={pathname:"/authenticate/check/",title:"支付成功"};
    jQuery.each(sectitles,function(key,value){
        if(url.indexOf(value.pathname)>=0){
            jQuery("title").html(value.title);
        }
    });
});
/**
 * 首页弹出广告
 */
!function($){
    if ($("#acitve_gg").length){
        var $acitve_gg = $('#acitve_gg').on('click','.active_gg_close',function(){
            $acitve_gg[0].style.cssText = 'display:none';
        }).on('show',function(){
            $acitve_gg[0].style.cssText = 'display:block';
            var $box = $acitve_gg.find('.active_gg_box'),
                $content = $acitve_gg.find('.active_gg_content'),
                $boxHeight = $box.height(),
                $contentHeight= $content.height()+4;
            if($boxHeight > $contentHeight){
                $content.css('top',($boxHeight - $contentHeight)/2);
            }
        });
        var cookies = document.cookie;
        if(cookies.indexOf('active_gg') == -1){
            $acitve_gg.triggerHandler('show');
            var exdate=new Date();
            var exM=exdate.getSeconds()+24*3600;
            exdate.setSeconds(exM);
            document.cookie="active_gg=1" + ";expires="+exdate.toGMTString();
        }
    }
}(jQuery);  
/* btnLoading */
$.fn.showBtnLoading = function(isRelative){
    return this.each(function(index,ele){
        var $btn = $(ele);
        var originalValue = $btn.attr("value");
        var originalHtml = $btn.html();
        $btn.attr("data-original-value",originalValue);
        $btn.attr("data-original-html",originalHtml);
        $btn.attr("value","").html("");
        $btn.attr("disabled","disabled");
        $btn.addClass("loading disabled");
        return false;
        if(!isRelative && $btn.attr("data-relative-btn")){
            var $relativeBtn = $($btn.attr("data-relative-btn"));
            $relativeBtn.showBtnLoading(true);
        }
    });
}
$.fn.hideBtnLoading = function(isRelative){
    return this.each(function(index,ele){
        var $btn = $(ele);
        $btn.attr("value",$btn.attr("data-original-value"))
            .html($btn.attr("data-original-html"))
            .removeClass("loading disabled")
            .removeAttr("disabled");
        if(!isRelative && $btn.attr("data-relative-btn")){
            var $relativeBtn = $($btn.attr("data-relative-btn"));
            $relativeBtn.hideBtnLoading(true);
        }
    });
}
$.fn.countdown = function(options){
    return this.each(function(index,element){
        var $this = $(this);
        var _self_ = this;
        _self_.totalTime = options && options.totalTime ? options.totalTime :  (parseInt($this.attr("data-total-time")) ? parseInt($this.attr("data-total-time")) : 0);
        _self_.countdownTime = _self_.totalTime;
        _self_.pastTime = 0;
        _self_.startTime = new Date().getTime();
        _self_.timer = null;

        var daysDivisor,hoursDivisor,minutesDivisor,secondsDivisor;
        daysDivisor = 24 * 60 * 60 * 1000;
        hoursDivisor = 60 * 60 * 1000;
        minutesDivisor = 60 * 1000;
        secondsDivisor = 1000;
        function getCNSurplusTime(surplusTime){
            var days,hours,minutes,seconds;
            days = Math.floor(surplusTime / daysDivisor);
            hours = Math.floor((surplusTime - days * daysDivisor)/hoursDivisor);
            minutes = Math.floor((surplusTime - days * daysDivisor - hours * hoursDivisor) / minutesDivisor);
            seconds = Math.floor((surplusTime - days * daysDivisor - hours * hoursDivisor - minutes * minutesDivisor) / secondsDivisor );
            return paddingTime(days) + "天"+ paddingTime(hours) + "时" + paddingTime(minutes) + "分" + paddingTime(seconds) + "秒"
        }
        function paddingTime(time){
            var timeStr = time.toString();
            if(timeStr.length == 1){
                return "0"+timeStr;
            }else{
                return timeStr;
            }
        }
        function doCallback(){
            if(options && options.callback && typeof options.callback === "function"){
                options.callback.call(_self_);
            }
            _self_.countdownTime = 0;
            clearInterval(_self_.timer);
        }
        function setCountdownText(){
            var CNSruplusTime = getCNSurplusTime(_self_.countdownTime);
            $this.text(CNSruplusTime);
        }
        if(_self_.totalTime > 0){
            setCountdownText();
            _self_.timer = setInterval(function(){
                _self_.pastTime = new Date().getTime() - _self_.startTime;
                _self_.countdownTime = _self_.totalTime - _self_.pastTime;
                _self_.countdownTime <= 0 ? doCallback() : false;
                setCountdownText();
            }, 1000);
        }else{
            doCallback();
        }
    });
}
