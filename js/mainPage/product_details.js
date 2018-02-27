Array.prototype.each = function(fn) {
	fn = fn || Function.K;
	var a = [];
	var args = Array.prototype.slice.call(arguments, 1);
	for(var i = 0; i < this.length; i++) {
		var res = fn.apply(this, [this[i], i].concat(args));
		if(res != null) a.push(res);
	}
	return a;
};
Array.prototype.contains = function(item) {
	return RegExp("\\b" + item + "\\b").test(this);
};
Array.prototype.uniquelize = function() {
	var ra = new Array();
	for(var i = 0; i < this.length; i++) {
		if(!ra.contains(this[i])) {
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
	if(obj !== Object(obj))
		throw new TypeError('Object.keys called on a non-object');
	var k = [],
		p;
	for(p in obj)
		if(Object.prototype.hasOwnProperty.call(obj, p)) k.push(p);
	return k;
};

function checkSelectedTitle() {
	var selectedAttr = linkpconfig_checked["attribute_list"];
	for(var key in selectedAttr) {
		$("[data-title='" + key + "']").find(".code").text(selectedAttr[key]);
	}
}

$(function() {
	var ProductDetails = {};
	ProductDetails.ajax_products = function() {
		window.lib.ajaxProducts({
			success: function(resJSON) {
				var data = resJSON.data;
				if(resJSON.code == 200) {
					for(var i = 0; i < data.length; i++) {
						var data_id = data[i].product_id;
						var symbol = $('.ajax-products-item').attr("data-product-symbol");
						var rmb_symbol = "￥";
						var par_data = $('.ajax-products-item[data-productid=' + data_id + ']');
						//价格
						if(data[i].sales > 0) {
							par_data.find('.current-price').html(symbol + data[i].final_price);
							par_data.find('.origion-price').show().html(symbol + data[i].price);
						} else {
							par_data.find('.current-price').html(symbol + data[i].final_price);
							par_data.find('.origion-price').hide();
						}
						par_data.find('.rmb-price').html(rmb_symbol + data[i].rmb);
						//库存
						if(data[i].is_in_stock == 0) {
							par_data.find('.pd-buy').prop("onclick",null).off("click").addClass('disabled').text("已售罄");
						} else {
							par_data.find('.pd-buy').removeClass('disabled').text("加入购物车");
						}
						//折扣
						if(data[i].show_sales == 0) {
							par_data.find('.percent').hide();
						} else {
							console.log(9)
							par_data.find('.percent').html(data[i].sales + "%" + "<span>OFF</span>").show();
						}

					}
				}
			}
		})
	};
	/*    ProductDetails.checkQty = function () {
	        var $cartBtn = $("#cart_btn");
	        var $price = $('.pd-price').find('.current-price');
	        var $s_price = $('.pd-price').find('.origion-price');
	        var $rmb_price = $('.pd-price').find('.rmb-price');
	        var productId = $cartBtn.attr("data-product-id");
	        $.ajax({
	            url : window.ROOT_URL+"pt_catalog/product/detail",
	            data: {
	                id : productId
	            },
	            dataType:"json",
	            type: "GET",
	            success:function (data) {
	                if(data.status == 200){
	                    if(data.product.is_in_stock == 1 && data.product.status==1){
	                        $cartBtn.removeClass("disabled").text("加入购物车");
	                    }else if(data.product.status==2){
	                        $cartBtn.removeAttr("onclick").addClass("disabled").text("商品已下架");
	                    }else{
	                        $cartBtn.removeAttr("onclick").addClass("disabled").text("暂时缺货");
	                    }
	                    $s_price.html("€" + data.product.price);
	                    $price.html("€" + data.product.final_price);
	                    $rmb_price.html("￥" + data.product.rmb);
	                }else{
	                    easyDialog.open({
	                        container: {
	                            header: '提示',
	                            content: '页面错误，请刷新重试',
	                            yesText: '确认',
	                            noText: '取消',
	                            yesFn: function() {

	                            },
	                            noFn: true
	                        }
	                    });
	                }
	            }
	        })
	    };*/
	ProductDetails.initGallery = function() {
		var $gallery = $("#gallery"),
			$galleryImages = $gallery.find("img");
		$preview = $("#preview");
		/*鼠标悬浮切换大图*/
		$galleryImages.hover(function(event) {
			target = $(event.target);
			var bigImgUrl = target.attr("data-src");
			var jqimg = target.attr("data-jqimg");
			$preview.attr("src", bigImgUrl).attr("jqimg", jqimg);
			$gallery.find(".selected").removeClass("selected");
			target.addClass("selected");
		});
		if($galleryImages.length > 4) {
			/*大于4张图片时初始化前后切换事件*/
			var params = {
				width: 78,
				height: 68,
				view: 0,
				maxView: $galleryImages.length - 4
			};
			/*向前*/
			$("#gallery-previous").click(function() {
				$gallery.animate({
					marginTop: -1 * --params.view * params.height
				}, 300);
				var currentSlected = $gallery.find(".selected");
				if(currentSlected.index() - 4 == params.view) {
					/*如果向前切换时，当前被选中的切换后处于不可见区域，则选中其前一个*/
					currentSlected.removeClass("selected")
						.prev().addClass("selected");
					var bigImgUrl = currentSlected.prev().attr("data-src");
					$preview.attr("src", bigImgUrl);
				}
				$("#gallery-next").addClass("show");
				/*第一个已出现，隐藏向前*/
				if(params.view == 0) {
					$(this).removeClass("show");
				}
			});
			/*向后*/
			$("#gallery-next").click(function() {
				$gallery.animate({
					marginTop: -1 * ++params.view * params.height
				}, 300);
				/*如果向后切换时，当前被选中的切换后处于不可见区域，则选中其后一个*/
				var currentSlected = $gallery.find(".selected");
				if(currentSlected.index() + 1 == params.view) {
					currentSlected.removeClass("selected")
						.next().addClass("selected");
					var bigImgUrl = currentSlected.next().attr("data-src");
					$preview.attr("src", bigImgUrl);
				}
				$("#gallery-previous").addClass("show");
				if(params.view == params.maxView) {
					/*最后一个已出现，隐藏向前*/
					$(this).removeClass("show");
				}
			});
		}
	};
	ProductDetails.initZoom = function() {
		$(".pd-preview-big").jqueryzoom({
			xzoom: 450,
			yzoom: 450,
			offset: 20,
			position: "right",
			preload: 1,
		});
	};
	ProductDetails.initAnchor = function() {
		$(".anchor").click(function() {
			var _dataAnchor = $(this).attr("data-anchor");
			var _dataAnchorTop = $(_dataAnchor).position().top;
			$("html,body").animate({
				scrollTop: _dataAnchorTop
			}, 300);
		});
	};
	ProductDetails.initQtyValidator = function() {
		$("#qty").bind("keyup", function() {
			if(!this.value.match(/^[1-9]\d*$/)) {
				this.value = 1;
			}
		});
	};
	ProductDetails.initQtyCtrl = function() {
		var $qty = $("#qty");

		function setColor() {
			if($qty.val() == 1) {
				$("#qty-reduce").addClass("num-sub");
			} else {
				$("#qty-reduce").removeClass("num-sub");
			}
		}
		setColor();
		$("#qty-add").bind("click", function() {
			$qty.val(parseInt($qty.val()) + 1);
			setColor();
		});
		$("#qty-reduce").bind("click", function() {
			$qty.val() != 1 ? $qty.val(parseInt($qty.val()) - 1) : "";
			setColor();
		});

	};
	/*初始化判断是否收藏 */
	ProductDetails.initIsCollect = function(){
		product_id = $('.add-to-box').find('.pd-buy').attr('data-product-id');
		$.ajax({
			type: 'get',
			url: '/o_customer/favourites/check?&product_id=' + product_id,
			success:function(data) {
				if(JSON.parse(data).ret == 1){
					$('.pd-collect').removeClass('no-collected').addClass('collected');
					$('.collect-name').html('收藏成功');
				}
			}
		})
	}

	ProductDetails.initCollect = function() {
		$("#J-display-block").on("click", function() {
			var customer_id = $(this).attr('data-customer-id') ? $(this).attr('data-customer-id') : "",
				product_id = $(this).attr('data-product-id'),
				data_url = $(this).attr("data-url");

			var postUrl = '/o_customer/favourites/save?customer_id=' + customer_id + '&product_id=' + product_id;
			jQuery.ajax({
				type: 'get',
				url: postUrl,
				dataType: 'json',
				success: function(data) {
					if(data.ret == 0) {
						$("#J-display-block").find(".pd-collect").removeClass("no-collected").addClass("collected");
						$("#J-display-block").find("collect-name").text("收藏成功");
						easyDialog.open({
							container: {
								header: '提示',
								content: '<div class="tip-success-content"><p>商品已成功添加到收藏夹</p></div>',
								yesText: '查看收藏夹',
								noText: '继续购物',
								yesFn: function() {
									location.href = '/o_customer/favourites/info/';
								},
								noFn: true
							}
						});
						if(sa_enabled) {  //神策加入收藏埋点
							indexSensors.add_favorite(data.properties);  
						}
					} else if(data.ret == 2) {
						$("#J-display-block").find(".pd-collect").removeClass("no-collected").addClass("collected");
						$("#J-display-block").find("collect-name").text("收藏成功");
						easyDialog.open({
							container: {
								header: '提示',
								content: '<div class="tip-success-content"><p>您已经收藏过该商品了</p></div>',
								yesText: '查看收藏夹',
								noText: '继续购物',
								yesFn: function() {
									location.href = '/o_customer/favourites/info/';
								},
								noFn: true
							}
						});
					} /* else {
						easyDialog.open({
							container: {
								header: '提示',
								content: '<div class="tip-success-content"><p>需登录才可收藏商品</p></div>',
								yesText: '登录',
								noText: '继续购物',
								yesFn: function() {
									jQuery.ajax({
										type: 'post',
										url: "/o_customer/favourites/setCurUrl",
										dataType: 'json',
										data: {
											url: data_url
										},
										success: function(ret) {
											if(ret.ret == 1) {
												window.location.href = '/customer/account/login/favourites/1';
												return false;
											}
										}
									});
								},
								noFn: true
							}
						});
					} */
				},
			})
		});
	};
	
	
	   //缩略图JS
    ProductDetails.initMoreiImg = function(){
        $('.more-views li').hover(function() {
            var index =$(this).index()
            var img = $(this).find('img').attr('data-img');
            var bigImg = $(this).find('img').attr('data-bigImg');
            $('.more-views li.active').removeClass("active");
            $(this).addClass("active");
            $('.product-image img').attr({'src': img}).show(100);
            $('#zoom1').attr({'href': bigImg});
            $('.mousetrap').remove();
            $('.cloud-zoom, .cloud-zoom-gallery').CloudZoom();
        });
        var sum=$('li.more-img').length,
            w=$('.more-views li').width(),
            $container=$(".more-img-container"),
            $prev=$('.more-views .prev'),
            $next=$('.more-views .next'),
            index=5,
            slide_sum=0;
        if(sum<=7) return false;
        $prev.click(function(){
            if(slide_sum<=0) return false;
            slide_sum--;
            $container.animate({marginLeft: -1*w*slide_sum+28},300);
        })
        $next.click(function(){
            if(slide_sum>=(sum-7)) return false;
            slide_sum++;
            $container.animate({marginLeft: -1*w*slide_sum+28},300);
        })
    };
    
    ProductDetails.initMoreiImg();
	ProductDetails.ajax_products();
	ProductDetails.initGallery();
	ProductDetails.initZoom();
	ProductDetails.initAnchor();
	ProductDetails.initQtyValidator();
	ProductDetails.initQtyCtrl();
	ProductDetails.initIsCollect();
	ProductDetails.initCollect();
});