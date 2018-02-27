import userCenter from 'scss/customer/userCenter.scss';
import serviceData from 'build_js/api/index';
import Logistics from 'build_js/modules/logistics';
import popBind from 'build_js/modules/popBind';
import Timecountdown from 'build_js/plugins/time';
'use strict';
var userCenterFn = {
    init: function () {
        window.formId = $('#popSecurityBindEmail'); /* 弹窗绑定 */
        this.typeSelect();
        this.addCart();
        this.allSelect();
        this.allCancle();
        this.cancleFavourite();
        this.getLogistics();
        this.favouriteSliderProduct();
        this.likeSliderEmarsys();
        this.recommendSliderEmarsys();
        this.historySliderEmarsys();
        this.OrderRebuy();
        this.OrderRebuyGo();
        this.SecurityCellphoneMainBtn();
        this.initCouponSum();
        popBind.getPopFn();

        const path = window.location.pathname;
        if (/sales\/order\/view\/order_id/.test(path)) {
            this.orderOverPlus();
        }
        if (/o_share\/activity\/index/.test(path)) {
            this.share();
        }
        if (/customer\/account\/coupon/.test(path)) {
            this.userCouponFn();
        }
    },
    /*获取优惠券数量*/
    initCouponSum: function () {
        var url = serviceData.requestURL.promoCouponSumUrl;
        var argument = {
            method:'GET'
        }
        serviceData.requestdata(url,argument,function(data){
            var dataObj = 0;
            if(data.status == 200){
                dataObj = data.data.count;
            }
            $('.num-detail').last().find('i').html(dataObj);
        })
    },    
    typeSelect: function () {
        const _self = this;
        $('.select-option').hover(function () {
            $(this).find('.all-item').addClass('active');
            _self.itemSelect($(this));
        }, function () {
            $(this).find('.all-item').removeClass('active');
        })
    },
    itemSelect: function (_self) {
        const selected = _self.find('.selected-item');
        const item = selected.parents('.select-type').find('.all-item');
        const that = item.find('li');
        that.on('click', function () {
            const _self = $(this);
            const value = _self.attr('data-value');
            const text = _self.html();
            $(formId).off('click','.phone-captcha');
            item.removeClass('active');
            that.removeClass('selected');
            _self.addClass('selected');
            selected.attr('data-value', value).html(text);
            serviceData.windowUrl(value);
        })
        $('.select-type,.time-type').click(function () {
            $(this).find('.all-item').addClass('active');
        }).hover(function () {
            $(window).unbind('click')
        }, function () {
            $(window).click(function () {
                $('.all-item').removeClass('active');
            });
        })
    },
    /* 弹窗绑定 */
    SecurityCellphoneMainBtn: function () {
        var that = this;
        $('.btn-binding').on('click', function () {
            popBind.getPopFn('btn');
        })
    },
    addCart: function () {
        $('.product-addcart').on('click', function () {
            const type = $(this).attr('data-type');
            const link = $(this).attr('data-link');
            const productId = $(this).attr('data-id');
            if (type == 'simple') {
                serviceData.promoAddCart(productId);
            } else {
                serviceData.windowUrl(link);
            }
        })
    },
    productReplace: function () {
        $('.btn-pruduct').on('click', function () {
            let index = $(this).attr('data-index') || '0';
            const tab = $('.recommend-product-list');
            const length = tab.length;
            index++;
            if (index > length || index == length) {
                index = 0;
            }
            $(this).attr('data-index', index);
            tab.removeClass('active').eq(index).addClass('active');
        })
    },
    allSelect: function () {
        $('.all-select').on('click', function (e) {
            e.stopPropagation();
            const checked = $('#all-item');
            const list = $('.favourite-product-list .clause-checkbox');
            if (checked.attr('checked')) {
                list.removeAttr('checked');
                checked.removeAttr('checked');
            } else {
                checked.attr('checked', 'checked');
                list.attr('checked', 'checked');
            }
        })
    },
    allCancle: function () {
        $('.all-cancle').on('click', function (e) {
            e.stopPropagation();
            const list = $('.favourite-product-list .product-item');
            let product = '';
            list.each(function () {
                const id = $(this).find('.clause-checkbox');
                if (id.attr('data-product') && id.attr('checked')) {
                    product += id.attr('data-product') + ',';
                }
            })
            const argument = {
                productIds: product
            }
            const url = serviceData.requestURL.deleteAllFavouriteUrl;
            easyDialog.open({
                container: {
                    header: '关闭',
                    content: '您确定要取消收藏该商品吗？ ',
                    yesFn: function () {
                        serviceData.requestdata(url, argument, function (data) {
                            if (data.ret == 1) {
                                serviceData.reload();
                            } else {
                                easyDialog.open({
                                    container: {
                                        header: '关闭',
                                        content: data.des,
                                        yesFn: true,
                                        noFn: false
                                    }
                                });
                            }
                        })
                    },
                    noFn: true
                }
            });
        })
    },
    //再次购买
    OrderRebuy: function () {
        const that = this;
        $('.rebuy-btn').on('click', function (e) {
            e.stopPropagation();
            const orderId = $(this).attr('data-orderId');
            if (!orderId) return false;
            const argument = {
                order_id: orderId
            }
            const url = serviceData.requestURL.rebuyUrl;
            serviceData.requestdata(url, argument, function (res) {
                const status = res.code;
                let message = '';
                if (status == 200) {
                    serviceData.windowUrl('/cart/index');
                    return false;
                } else if (status === 400) {
                    message = '	参数错误';
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: message,
                            yesFn: function () {},
                            noFn: false
                        }
                    })
                } else if (status === 403) {
                    const length = res.data.length || '0';
                    let message = '';
                    let data = res.data;
                    data.forEach(function (val, index, array) {
                        message += `
                                <a class="rebuy-item" href="${val.product_url}">
                                    <img src="${val.small_image}" class="rebuy-img">
                                    <span class="rebuy-info">
                                        <span class="rebuy-name">${val.name}</span>
                                        <span class="rebuy-stock">已售罄</span>
                                    </span>
                                </a>`;
                    })
                    message = `
                            <p class="message-tips">订单中有${length}个商品不再售，是否继续购买。</p>
                            <div class="reby-main">${message}</div>`;
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: message,
                            yesText: '继续购买',
                            noText: '取消',
                            noFn: function () {},
                            yesFn: function () {
                                that.OrderRebuyGo(orderId);
                            }

                        }
                    })
                } else if (status == 404) {
                    message = '	加入购物车失败';
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: message,
                            yesText: '确定',
                            noFn: function () {}

                        }
                    })
                } else {
                    message = '<p class="message-tips"><i class="icon-mark-tips">!</i>整个订单的商品都已下架或已售罄!</p>';
                    easyDialog.open({
                        container: {
                            header: '提示',
                            content: message,
                            yesText: '确定',
                            yesFn: function () {}

                        }
                    })
                }
                $('.easyDialog_wrapper').addClass('rebuy-alert'); //区分弹窗插件样式
            })
        })
    },
    //再次购买继续购买
    OrderRebuyGo: function (orderId) {
        if (!orderId) return false;
        const argument = {
            order_id: orderId
        }
        const url = serviceData.requestURL.rebuyAddCartUrl;
        serviceData.requestdata(url, argument, function (res) {
            if (res.code == 200) {
                serviceData.windowUrl('/cart/index');
                return false;
            } else {
                easyDialog.open({
                    container: {
                        header: '提示',
                        content: res.message,
                        yesText: '确定',
                        yesFn: function () {}
                    }
                })
                $('.easyDialog_wrapper').addClass('rebuy-alert'); //区分弹窗插件样式
            }
        })
    },
    //获取物流轨迹
    getLogistics: function () {
        $('.logistics-btn').hover(function (e) {
            e.stopPropagation();
            Logistics.getData($(this), '4');
        }, function () {
            setTimeout(function () {
                $('.logistics').removeClass('active');
            }, 300)
        })
    },
    //用户中心首页我的收藏轮播图
    favouriteSliderProduct: function () {
        const favourite = $('.favourite-container');
        let width = favourite.find('.swiper-slide').length * (favourite.find('.swiper-slide').width() - 0 + 18);
        favourite.find('.swiper-wrapper').css({
            'width': width
        }); //待优化
        new Swiper('.favourite-container', {
            direction: 'horizontal',
            loop: false,
            nextButton: '.btn-next',
            prevButton: '.btn-pre'
        })
    },

    //用户中心首页我的足记轮播图
    historySliderProduct: function () {
        const history = $('.history');
        let width = history.find('.swiper-slide').length * (history.find('.swiper-slide').width());
        history.find('.swiper-wrapper').css({
            'width': width
        }); //待优化
        new Swiper('.history-container', {
            direction: 'horizontal',
            loop: false,
            pagination: '.silder-btn',
            paginationClickable: true,
        })
    },
    //我的推荐轮播图
    recommendSliderProduct: function () {
        $('.recommends-product-list').addClass('swiper-wrapper');
        $('.recommends-product-list').find('.product-item').addClass('swiper-slide')
        new Swiper('.recommend-box', {
            loop: false,
            pagination: '.silder-btn',
            paginationClickable: true,
            nextButton: '.recommend-button-prev',
            prevButton: '.recommend-button-next',
            slidesPerView: 4,
            slidesPerGroup: 4,
        })
    },
    //我的足记emarsys
    historySliderEmarsys: function () {
        const _this = this;
        const item = $('#userCenterHistoryEmarsys');
        if (!item.length) return;
        const limit = item.attr('data-limit');
        const logicId = item.attr('data-logic-id');
        let hlogic = logicId.split(",");
        for (var i = 0; i < hlogic.length; i++) {
            ScarabQueue.push(['recommend', {
                logic: hlogic[i],
                limit: limit,
                containerId: 'htopic' + i,
                templateId: 'hsimple-tmpl' + i,
                success: function (SC, render) {
                    window.updateEmarsysProduct(SC, function(data){
                        render(data);
                        _this.historySliderProduct();
                    })
                }
            }]);
        };
        //ScarabQueue.push(['go']);
    },
    //我的推荐emarsys
    recommendSliderEmarsys: function () {
        const _this = this;
        const item = $('#userCenterRecommendsEmarsys');
        if (!item.length) return;
        const limit = item.attr('data-limit');
        const logicId = item.attr('data-logic-id');
        let rlogic = logicId.split(",");
        for (var i = 0; i < rlogic.length; i++) {
            ScarabQueue.push(['recommend', {
                logic: rlogic[i],
                limit: limit,
                containerId: 'rtopic' + i,
                templateId: 'rsimple-tmpl' + i,
                success: function (SC, render) {
                    window.updateEmarsysProduct(SC, function(data){
                        render(data);
                        _this.recommendSliderProduct();
                    })
                }
            }]);
        };
        //ScarabQueue.push(['go']);
    },
    //猜你喜欢emarsys
    likeSliderEmarsys: function () {
        const _this = this;
        const item = $('#userCenterEmarsys');
        if (!item.length) return;
        const limit = item.attr('data-limit');
        const logicId = item.attr('data-logic-id');
        let logic = logicId.split(",");
        for (var i = 0; i < logic.length; i++) {
            ScarabQueue.push(['recommend', {
                logic: logic[i],
                limit: limit,
                containerId: 'topic' + i,
                templateId: 'simple-tmpl' + i,
                success: function (SC, render) {
                     window.updateEmarsysProduct(SC, function(data){
                        render(data);
                        _this.productReplace();
                    })
                }
            }]);
        };
        //ScarabQueue.push(['go']);
    },
    /* 使用优惠券 */
    userCouponFn: function () {
        const _self = this;
        $('#coupon-btn').on('click', function (e) {
            e.preventDefault();
            const _this = $(this);
            const code = $('#code').val();
            let lock = true;
            const url = serviceData.requestURL.bindCouponUrl;
            if (!code) {
                easyDialog.open({
                    container: {
                        header: '关闭',
                        content: '请先输入有效的优惠券 ',
                        yesFn: function () {},
                        noFn: false
                    }
                });
                return false;
            }
            const argument = {
                code: code
            }
            serviceData.requestdata(url, argument, function (data) {
                if (data.ret == 1) {
                    easyDialog.open({
                        container: {
                            header: '关闭',
                            content: data.msg,
                            yesFn: function () {},
                            noFn: false
                        }
                    });
                    if (lock) {
                        location.reload();
                    }
                    lock = false;
                } else {
                    lock = true;
                    easyDialog.open({
                        container: {
                            header: '关闭',
                            content: data.msg,
                            yesFn: function () {},
                            noFn: false
                        }
                    });
                    return false;
                }
            })
        })
    },
    /* 取消收藏 */
    cancleFavourite: function () {
        $('.collect-delete').on('click', function (e) {
            e.stopPropagation();
            const url = serviceData.requestURL.deleteFavouriteUrl;
            const id = $(this).parents('.product-item').find('.clause-checkbox').attr('data-product');
            if (!id) return false;
            const argument = {
                product_id: id
            }
            easyDialog.open({
                container: {
                    header: '关闭',
                    content: '是否确定删除该收藏？ ',
                    yesFn: function () {
                        serviceData.requestdata(url, argument, function (data) {
                            if (data.ret == 0) {
                                serviceData.reload();
                            } else {
                                easyDialog.open({
                                    container: {
                                        header: '关闭',
                                        content: data.des,
                                        yesFn: true,
                                        noFn: false
                                    }
                                });
                            }
                        })
                    },
                    noFn: true
                }
            });
        })
    },
    //订单取消倒计时
    orderOverPlus: function () {
        const url = serviceData.requestURL.orderCancelUrl;
        const item = $('.pending-tips');
        const itemText = item.find('.time-overplus');
        const orderStatus = item.parents('.order-status');
        var [creatTime, str] = [item.attr('data-order-time'), ''];
        let orderCancel = () => {
            orderStatus.removeClass('pending').find('.status-text').html('已取消');
            orderStatus.find('.pending-item').hide();
            return false;
        }
        serviceData.requestdata(url, {}, function (data) {
            if (!data.plus_time) return false;
            const current_time = data.current_time;
            const plus_time = data.plus_time;
            // return false;
            const time = (parseInt(creatTime) + parseInt(plus_time) - current_time) * 1000;
            orderCountdown(time);
        })
        let orderCountdown = (time) => {
            if (time <= 0) {
                orderCancel();
            }
            //console.log(time)
            let orderTimeCancel = setInterval(
                () => {
                    time = time - 1000;
                    // console.log("time:" + time)
                    itemText.html(format(time));
                    if (time < 1) {
                        clearInterval(orderTimeCancel);
                        orderCancel();
                    }
                }, 1000);
            let format = (time) => {
                let D = Math.floor(time / (1000 * 60 * 60 * 24));
                let H = Math.floor(time / (1000 * 60 * 60)) % 24;
                let M = Math.floor(time / (1000 * 60)) % 60;
                let S = Math.floor(time / 1000) % 60;
                var timeArray = [todouble(D), todouble(H), todouble(M), todouble(S)];
                const timeType = ['天', '时', '分', '秒'];
                let array = [];
                //console.log(timeArray);
                timeArray.forEach(function (val, index) {
                    if (val > 0) {
                        array.push(val + timeType[index]);
                    }
                })
                str = array.join('');
                return str;
            };
            let todouble = (t) => {
                var d = parseInt(t);
                if (d < 10) {
                    return '0' + d;
                } else {
                    return d;
                }
            }
        }
    },
    /*分享*/
    share: function () {
        var nowTime = new Date().getTime(); //当前时间戳
        var Share = function () {
            var _self = this;
            _self.run = function (data) {
                var data = data || 1;
                const url = serviceData.requestURL.getShareDataUrl;
                serviceData.requestdata(url, {
                    method: 'GET',
                    page: data
                }, function (data) {
                    var dataObj = data; //JSON.parse(data);
                    if (dataObj.message == "success") {
                        //对数据进行一些处理，方便handlebar渲染
                        for (var i = 0; i < dataObj.data.length; i++) {
                            if (dataObj.data[i].status == '0') {
                                dataObj.data[i].status = '未开始'
                            } else if (dataObj.data[i].status == '1') {
                                dataObj.data[i].status = '进行中'
                            } else {
                                dataObj.data[i].status = '已结束'
                            }
                            //剩余活动时间
                            if (dataObj.data[i].end_time == '' || dataObj.data[i].end_time == null || dataObj.data[i].end_time == undefined) {
                                dataObj.data[i].end_time = 0;
                            } else {
                                dataObj.data[i].end_time = dataObj.data[i].end_time * 1000 - nowTime;
                            }
                            //循环获取数据
                            for (var j = 0; j < dataObj.data[i].list.length; j++) {
                                if (dataObj.data[i].list[j].type == 1) {
                                    dataObj.data[i].list[j].number < dataObj.data[i].list[j].arrive_num ? dataObj.data[i].list[j]['r_arrive_complete'] = "未完成" : dataObj.data[i].list[j]['r_arrive_complete'] = "已获券";
                                }
                                if (dataObj.data[i].list[j].type == 2) {
                                    dataObj.data[i].list[j].number < dataObj.data[i].list[j].arrive_num ? dataObj.data[i].list[j]['o_arrive_complete'] = "未完成" : dataObj.data[i].list[j]['o_arrive_complete'] = "已获券";
                                }
                            }

                        }
                        var source = $("#entry-template").html();
                        var template = Handlebars.compile(source); //handlebars的功能在这里
                        var htmlDom = template(dataObj); //返回字符串
                        $('.f-product-list-share').html(htmlDom); //进行渲染

                        $(".share-red").Timecountdown({ //倒计时效果
                            callback: function () {
                                $(this).text('');
                                $(this).parent('.share-title').text('');
                                $(this).parent('.share-title').prev('.share-status').text('已结束');
                            }
                        })
                    }
                    var pagerJson = {
                        page: data.page,
                        allPage: data.allPage
                    }
                    _self.pages(pagerJson);
                });
            }
            _self.pages = function (data) {
                data = {
                    page: 1,
                    allPage: 1
                }
                data.allPageArr = [];
                for (var i = 1; i <= data.allPage; i++) {
                    data.allPageArr.push(i);
                }
                // console.log(data)
                var pageSource = $('#pager-template').html();
                var template = Handlebars.compile(pageSource);
                Handlebars.registerHelper("compare", function (data, options) {
                    if (data == options.data.root.page) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                })
                var htmlDom = template(data);
                $('.pager').html(htmlDom);
                _self.flip();
            }
            _self.flip = function () {
                $('.page-list').on('click', function (event) {
                    var $target = $(event.target);
                    var currentPage = parseInt($('.page-list').find('.current').html());
                    var page;
                    if ($target.html() == "上一页") {
                        page = currentPage - 1;
                    } else if ($target.html() == "下一页") {
                        page = currentPage + 1;
                    } else {
                        page = $target.html();
                    }
                    _self.run(page);
                    $('body,html').animate({
                        scrollTop: 0
                    }, 200);
                })
            }
        }
        var share = new Share();
        share.run();
    }
}
$(function () {
    userCenterFn.init();
})