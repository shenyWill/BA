$(function() {
    var Index = function() {
        this.initSlider = initSlider;
        this.ajax_products = ajax_products;
        this.initBrandSlider = initBrandSlider;
        this.initAnchor = initAnchor;
        this.initAnchorFollowScreen = initAnchorFollowScreen;

        function initSlider() {
            var $slidebox = $("#slidebox");
            $slidebox.slidesjs({
                width: 1190,
                height: 380,
                pagination: {
                    effect: "fade"
                },
                effect: {
                    fade: {
                        speed: 700
                    }
                },
                navigation: {
                    active: true,
                    effect: "fade"
                },
                play: {
                    effect: "fade",
                    active: true,
                    interval: 5000,
                    auto: true,
                    swap: true,
                    pauseOnHover: true,
                    restartDelay: 5000
                },
                callback: {
                    loaded: function() {
                        $slidebox.find(".slidesjs-pagination").addClass("clearfix");
                        $slidebox.find(".slidesjs-navigation").attr("href","javascript:;");
                        var imgs = $slidebox.find("img"),
                            paginationItem = $slidebox.find(".slidesjs-pagination a");
                        paginationItem.each(function(index, item) {
                            var $page_text = $(imgs[index]).data("title");
                            $(item).html($page_text).attr("href","javascript:;");
                        }).on("mouseover", function(event) {
                            $(event.currentTarget).trigger("click");
                        })
                    }
                }
            })
        }
        function initBrandSlider(){
            var $contain = $(".js-brandlist");
            $contain.slidesjs({
                width: 150,
                height: 260,
                navigation: false,
                effect: {
                    fade: {
                        speed: 700
                    }
                },
                play: {
                    effect: "fade",
                    interval: 4000,
                    pauseOnHover: true,
                    swap: true,
                    auto: true,
                    restartDelay: 500
                },
                pagination: {
                    active: true,
                    effect: "fade"
                },
                callback: {
                    loaded: function() {
                        var paginationItem = $contain.find(".slidesjs-pagination a");
                        paginationItem.each(function(index, item) {
                            $(item).attr("href","javascript:;");
                        }).on("mouseover", function(event) {
                            $(event.currentTarget).trigger("click");
                        });
                    }
                }
            });

        }
        function ajax_products(){
            window.lib.ajaxProducts({
                success:function(resJSON){
                    var data=resJSON.data;
                    if(resJSON.code == 200){
                        for (var i = 0; i < data.length; i++) {
                            var data_id=data[i].product_id;
                            var symbol = $('.ajax-products-item').attr("data-product-symbol");
                            var rmb_symbol = "￥";
                            var par_data = $('.ajax-products-item[data-productid='+data_id+']');
                            //价格
                            if(data[i].sales > 0){
                                par_data.find('.PriceNow').html(symbol + data[i].final_price);
                                par_data.find('.PriceWas').show().html(symbol + data[i].price);
                            }else{
                                par_data.find('.PriceNow').html(symbol + data[i].final_price);
                                par_data.find('.PriceWas').hide();
                            }
                            par_data.find('.PriceRmb span').html(rmb_symbol + data[i].rmb);
                            //库存
                            if(data[i].is_in_stock == 0){
                                par_data.find('.OrangeButton').addClass('disabled').text("已售罄");
                                par_data.find('.product-bundle button').addClass('disabled').text("已售罄");
                            }else{
                                par_data.find('.OrangeButton').removeClass('disabled').text("添加至购物车");
                            }
                            //折扣率
                            if(data[i].show_sales == 0){
                                par_data.find('.DiscountPercent').hide();
                            }else{
                                par_data.find('.DiscountPercent').html(data[i].sales+ "%" + "<span>OFF</span>").show();
                            }
                        }
                    }            
                }           
            });
        }

        //侧边导航
        /*初始化锚点*/
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
            var scollTimer = null;
            $(win).scroll(function() {
                var winScrollTop = $(win).scrollTop();
                var winHalfHeight = $(win).height() / 2;
                var changePositonThreshold = anchorOffsetTop + productAnchorHalfHeight - winHalfHeight;
                var anchorFixedTop = winHalfHeight - productAnchorHalfHeight;
                if(scollTimer){
                    clearTimeout(scollTimer);
                }
                scollTimer =  setTimeout(function(){
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
                    //滚动到页面底部时
                    if ($(document).scrollTop() + $(window).height() >= $(document).height()) {
                        $("anchorNav").hide();
                    }else{
                        $("anchorNav").show();
                    };
                },100);

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
    };
    var index = new Index();
    index.initSlider();
    index.initBrandSlider();
    index.ajax_products();
    index.initAnchor("#productAnchor",".anchor-link");
    index.initAnchorFollowScreen("#productAnchor",$(".main").find(".ajax-products"));
});