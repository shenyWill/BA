import serviceData from 'build_js/api/index';
'use strict';
const Base = {
    init: function() {
        this.isLogin();
        //this.getCartNum();
    },
    setCookie: function(name, value, time) {
        if (time != '-1') {
            time ? time : time = '30';
            var exp = new Date();
            exp.setTime(exp.getTime() + time * 24 * 60 * 60 * 1000);
            time = exp.toGMTString();
        } else {
            time = '-1';
        }
        if (this.getCookie(name)) {
            this.delCookie(name)
        }
        document.cookie = name + "=" + escape(value) + ";expires=" + time + ';path=/';
    },
    getCookie: function(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    },
    delCookie: function(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getCookie(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    },
    /* 登录状态等重置 */
    customerShow: function(data) {
        // $('.num-box').html(data.cartItemCount);
        if (data.loginRet == 1 && data.customerName) {
            let name = data.customerName;
            if (name.length > 19) {
                name = name.substring(0, 16) + '...';
            }
            const headStr = `
                <li class="left" style="display: inline-block;">
                    Hello,<a href="/customer/account/index">${name}</a>
                </li>
                <li class="left logout" style="display: inline-block;">
                    <a class="" href="javascript:void(0)" data-href="/customer/account/logout">&nbsp;&nbsp;&nbsp;退出</a>
                </li>
            `;
            $('.HearderWord').html(headStr).show();
            $('.header-right .login,.header-right .regist,.login-btn,.regist-btn').hide();
            $('#CartPrice').html(data.total);
            $('.favors').find('b').text(data.favourite);
            $('.cart-empty').find('.tologin').hide();
            $('.header-right .logout').show();
        } else {
            $('.search_grid .top-links .login-status').html('<a href="' + ROOT_URL + '/customer/account/login/">LOG IN</a>');
            //购物车页面，把登录显示出来
            $('#discount-coupon-form').find('.not-logged-in').show();
            //购物车页面，把优惠券的交互去掉，并添加弹层提示
            $('body').off('click');
        }
    },
    /* 重置登录cookie */
    setCookieFn: function() {
        this.setCookie('loginRet', '1');
        this.setCookie('loginErrorTime', '0');
        this.setCookie('unionLoginErrorTime', '0');
        //this.isLogin();
    },
    /* 根据cookie判断登录状态 */
    isLogin: function() {
        const that = this;
        const loginRet = that.getCookie('loginRet');
        let [customerId, customerName, parmas, cartItemCount] = [];
        const url = serviceData.requestURL.getCustomerUrl;
        serviceData.requestdata(url, {}, function(data) {
            customerId = data.customerId;
            customerName = data.customerName;
            if (data.ret == 1) {
                that.setCookie('loginRet', '1');
                that.setCookie('customerId', customerId);
                that.setCookie('customerName', customerName);
                parmas = {
                    customerId: customerId,
                    customerName: customerName,
                    loginRet: '1'
                }
                that.customerShow(parmas);
            } else {
                that.setCookie('customerId','');
                that.setCookie('loginRet','10');
                parmas = {
                    loginRet: '',
                }
                that.customerShow(parmas);
            }
        })
        this.logOutFn();
    },
    /* 根据cookie判断登录状态 */
    getCartNum: function() {
        let cartItemCount = 0;
        let that = this;
        const url = serviceData.requestURL.getCustomerUrl;
        serviceData.requestdata(url, {}, function(data) {
            if (data.status == 200) {
                cartItemCount = data.data.count;
            } 
            $('.num-box').html(cartItemCount);
            that.setCookie('cartItemCount', cartItemCount);
        })
        this.logOutFn();
    },
    /* 退出 */
    logOutFn: function() {
        const that = this;
        $('.HeaderTop').on('click', '.logout a', function(e) {
            e.preventDefault();
            that.setCookie('loginRet', '10');
            that.delCookie('is_union');
            serviceData.windowUrl($(this).attr('data-href'));
            return false;
        })
    }
}
export default Base;