$.fn.dropdown = function(options) {
    return this.each(function() {
        var $dropdownGroup = $(this);
        var $dropdownBar = $dropdownGroup.find(".dropdown-head");
        $dropdownBar.bind("click", function(event) {
            var target = event.target || event.srcElement;
            var $currentDropdown = $(target).parentsUntil(".dropdown").parent();
            if ($currentDropdown.length == 0) {
                $currentDropdown = $(target).parent();
            }
            // 收起其他的下拉筛选
            var $prevActiveDropdown = $dropdownGroup.find(".dropdown-active");
            if (!$prevActiveDropdown.is($currentDropdown)) {
                $prevActiveDropdown.find(".dropdown-content").slideUp(150, function() {
                    $prevActiveDropdown.removeClass("dropdown-active");
                });
            }
            // 如果点击的是当前展开的，则收起，否则展开
            var $currentDropdownContent = $currentDropdown.find(".dropdown-content");
            if ($currentDropdown.hasClass("dropdown-active")) {
                $currentDropdownContent.slideUp(150, function() {
                    $currentDropdown.removeClass("dropdown-active");
                });
            } else {
                $currentDropdownContent.slideDown(150, function() {
                    $currentDropdown.addClass("dropdown-active");
                });
            }
        });


    });
};
$(function() {
    var ProductList = {};
    ProductList.initDropdown = function() {
        $(".dropdown-group").dropdown();
    };

/*  跟屏
    ProductList.initFixedDropdown = function() {
        var $fixedFilter = $("#pl-filter"),
            timer;
        if($fixedFilter.length ==0 ) return false;
        var staticTop = $fixedFilter.position().top+10;//fixed状态下有10像素padding
        if($fixedFilter.find(".pl-filter-dropdown").length !=0){
            $(window).bind("scroll", function() {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    if ($(window).scrollTop() >= staticTop) {
                        if($fixedFilter.find(".pl-filter-tag").length == 0){//跟屏时，需要给产品添加padding,以防抖动
                            $("#pl-grid-ctn").addClass("without-filter-tag");
                        }else{
                             $("#pl-grid-ctn").addClass("with-filter-tag");
                        }
                        $fixedFilter.addClass("fixed-filter").fadeIn();
                    } else {
                        if($fixedFilter.find(".pl-filter-tag").length == 0){
                            $("#pl-grid-ctn").removeClass("without-filter-tag");
                        }else{
                             $("#pl-grid-ctn").removeClass("with-filter-tag");
                        }
                        $fixedFilter.removeClass("fixed-filter").attr("style","");
                    }
                }, 100);
            });
        }
    };*/
    ProductList.initGrid = {
        loadedColors: {},
        gridHover: function() {
            var timer;
            var hover_start;
            $(".pl-grid > li").hover(function(event) {
                hover_start = new Date().getTime();
                timer = setTimeout(function() {
                    var target = $(event.currentTarget);
                    var productId = target.attr("data-productid");
                    if (!ProductList.initGrid.loadedColors[productId]) {
                        ProductList.initGrid.loadedColors[productId] = {
                            isLoad: true
                        };
                    }
                    if (ProductList.initGrid.loadedColors[productId]["isLoad"]) {
                        ProductList.initGrid.loadedColors[productId]["isLoad"]=false;
                        //ProductList.initGrid.getColorData(productId, target);
                    }
                }, 200);
            },function (event) {
                var hover_end = new Date().getTime();
                var hover_duration = hover_end-hover_start;
                if(hover_duration < 200){
                    timer ? clearTimeout(timer) : false;
                }
            });
        },
/*        getColorData: function(productId, target) {
            $.ajax({
                url: window.ROOT_URL + "o_productlink/product/loadcolours",
                type: "get",
                dataType: "json",
                data: {
                    product_id: productId
                },
                success: function(data) {
                    if (data.ret == 0 && data.colors.length != 0) {
                        ProductList.initGrid.renderHtml(productId, data.colors, target);
                    }
                },
                error: function(data) {
                    console.log(data.responseText);
                }
            });
        },*/
        renderHtml: function(productId, colors, target) {
            var docFragment = document.createDocumentFragment();
            var ul = document.createElement("ul");
            ProductList.initGrid.initToggleImg(ul);
            ul.className = "pl-color dropdown-color";
            for (var i = 0; i < colors.length; i++) {
                if (i < 6) {
                    var li = document.createElement("li");
                    li.setAttribute("data-src", colors[i]["imgUrl"]);
                    var colorCircle = document.createElement("i");
                    if (colors[i]["color"] == "other") {
                        colorCircle.className = "circle colorful";
                    } else {
                        colorCircle.className = "circle";
                    }
                    colorCircle.style.background = colors[i]["color"];
                    li.appendChild(colorCircle);
                    ul.appendChild(li);
                } else {
                    var li = document.createElement("li");
                    var productLink = document.createElement("a");
                    productLink.href = target.find("a").attr("href");
                    productLink.innerHTML = "6+";
                    productLink.className = "circle"
                    li.appendChild(productLink);
                    ul.appendChild(li);
                    break;
                }
            }
            docFragment.appendChild(ul);
            target.get(0).appendChild(docFragment);
        },
        initToggleImg: function(element) {
            $(element).click(function(event) {
                if (event.target != event.currentTarget) {
                    var target = $(event.target);
                    target.is("li") ? true : target = target.parent();
                    var imgUrl = target.attr("data-src");
                    if (imgUrl) {
                        var plImage = target.parentsUntil(".pl-grid").find(".pl-image");
                        plImage.attr("src", imgUrl);
                    }
                }
            });
        }
    };
    ProductList.initColorPicker = function() {
        var colorPicker = $(".product-color-picker");
        colorPicker.each(function() {
            var $this = $(this);
            $this.bind("click", function(event) {
                var target = event.target || event.srcElement;
                if (target != event.currentTarget) {
                    target = $(target);
                    target.is("li") ? "" : target = target.parent();
                    if (!target.hasClass("selected")) {
                        $this.parent().find(".pl-image").attr("src", target.attr("data-src"));
                        $this.find(".selected").removeClass("selected");
                        target.addClass("selected");
                    }
                };
            })
        });
    };
    ProductList.ajax_products = function(){
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
        })    
    };     
    ProductList.initLazyload = function () {
        $(".lazyload").lazyload({threshold:200});
    };
    ProductList.init = function() {
        this.initLazyload();
        this.initDropdown();
        this.ajax_products();
        //this.initFixedDropdown();
        this.initColorPicker();
        this.initGrid.gridHover();
    };
    ProductList.init();
});
