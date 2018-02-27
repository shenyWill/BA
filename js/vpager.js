var Vpager = Class.create({
    initialize: function () {
        this.request = null;
        this.loading = {
            'lnav': false,
            'list': false
        };
        this.isNav = false;
        this.afterInit();
        document.observe("dom:loaded", this.olinks.bind(this));
    },
    afterInit: function () {
        hashTag = location.hash.split('#!');
        if (hashTag.length > 1) {
            this.riff(location.href);
        }
    },
    getUP: function (u) {
        u = decodeURI(u);
        p = u.split('#!');
        if (p.length > 1) {
            params = p[1];
        }
        params = params.toQueryParams();
        if (this.isNav) {
            params['l'] = 1;
        } else {
            params['l'] = 0;
        }
        result = {'params': params, 'url': p[0]};
        return result;
    },
    riff: function (u) {
        location.href = u;
        u = this.getUP(u);
        this.showLoading(false);
        if (this.request !== null) {
            this.request.abort();
        }
        this.request = new Ajax.Request(u.url, {
            method: 'get',
            parameters: u.params,
            onSuccess: this.glist.bind(this),
            onComplete: this.olinks.bind(this)
        });
    },
    getResult: function (event) {
        sEle = Event.element(event);
        if (sEle.tagName.toLowerCase() == 'a') {
            this.riff(sEle.href);
        } else {
            this.riff(sEle.value);
        }
        Event.stop(event);
    },
    getNavRes: function (event) {
        event.stop();
        this.isNav = true;
        sEle = Event.element(event);
        if (sEle.tagName.toLowerCase() == 'a') {
            this.riff(sEle.href);
        } else {
            if (sEle.tagName.toLowerCase() == 'span') {
                this.riff(sEle.up().href);
            }
        }
    },
    olinks: function (event) {
        //jQuery(function () {
        //    var length = jQuery('#animate_stop').length;
        //    if (length == 0) {
                //滚动条自动滚到最上方
                //jQuery('html, body').animate({scrollTop:0}, 800);
            //}
            //jQuery('.form-language, .header .block-currency, .toolbar .sort-by, .toolbar .limiter').jqTransform({imgPath:'<?php echo $this->getSkinUrl("images/") ?>'});
        //});
        //jQuery(".add-to-links li a.tooltips").easyTooltip();
        //jQuery(".products-grid .add-to-links .link-wishlist").easyTooltip();
        //jQuery(".products-grid .add-to-links .link-compare ").easyTooltip();

        //var grids = $$('.products-grid');
        //grids.each(function (n) {
        //    var columns = n.select('li.item');
        //    var max_height = 0;
        //    columns.each(function (m) {
        //        if (m.getHeight() > max_height) {
        //            max_height = m.getHeight();
        //        }
        //    });
        //    var boxes = n.select('li .product-box');
        //    boxes.each(function (b) {
        //        var this_column = b.up('li.item');
        //        var box_indent = this_column.getHeight() - b.getHeight();
        //        b.setStyle({
        //            height: max_height - box_indent + 'px'
        //        });
        //    });
        //});
        $$('.pages li a', '.view-mode a', '.sorter a', '.limiter a', '.pages li .previous').each(function (item) {
            item.observe('click', this.getResult.bindAsEventListener(this));
        }.bind(this));
        $$('.limiter select', '.sorter select').each(function (item) {
            item.observe('change', this.getResult.bindAsEventListener(this));
        }.bind(this));
        $$('.block-layered-nav a').each(function (item) {
            item.stopObserving();
            item.observe('click', this.getNavRes.bindAsEventListener(this));
        }.bind(this));
    },
    glist: function (transport) {
        ft = transport.responseText;
        var bagEle = new Element('div');
        bagEle.update(ft);
        var plist = bagEle.select('div#ajax-list-container')[0];
        var lnav = bagEle.select('div#ajax-nav-container')[0];
        $$('.category-products').each(function (item) {
            Element.replace(item, plist.innerHTML);
            /*jQuery("#is_in_stock_btn").remove();
            delete_btn('choose');*/
        });
        if (lnav) {
            $$('.block-layered-nav').each(function (item) {
                Element.replace(item, lnav.innerHTML);
                /*jQuery("#is_in_stock_btn").remove();
                delete_btn('choose');*/
            });
        }
        /* edit by hzh 12.12 列表图片延迟加载处理 */
        jQuery(".category-products").find(".lazy_product").each(function () {
            this.src = this.getAttribute("data-original");
        })
    },
    showLoading: function (flag) {
        $$('.amount').each(function (item) {
            item.update('&nbsp;').addClassName('spinner');
        });
        if (flag) {
            $$('.block-subtitle').each(function (item) {
                item.update('&nbsp;').addClassName('spinner');
            });
        }
    }
});
Object.extend(Ajax);
Ajax.Request.prototype.abort = function () {
    this.transport.onreadystatechange = Prototype.emptyFunction;
    this.transport.abort();
    Ajax.activeRequestCount--;
};
var ajaxPager = new Vpager();

/*显示有货*/
jQuery(function(){
     //read_cookie('ready');
     delete_btn();
     is_in_stock();
})
function set_cookie(data)
{
  document.cookie='is_in_stock='+data+'; path=/"';
}
 //read_cookie();
//读取cookie
function read_cookie(type)
{
  var url = window.location.href;
  var strCookie=document.cookie;
  var arrCookie=strCookie.split("; ");
  for(var i=0;i<arrCookie.length;i++)
  {
    var arr=arrCookie[i].split("=");
    if(arr[1] == 'active'){
        if(type=="ready"){
            if(url.indexOf("is_in_stock=1")>=0){
                jQuery(".choose_box .check-box-input").addClass('active');
                break;
            }
        }
    }
  }
}
//删除cookie
function delete_cookie(data)
{
  var date=new Date();
  var expiresDays=10;
  //将date设置为?天以后的时间
  date.setTime(date.getTime()+expiresDays*24*3600*1000*30);
  document.cookie='is_in_stock='+data;
}
function checked_is_in_stock(){
    var url = jQuery('.is_in_stock_btn').attr('href');
    window.location.href=url;
    if(jQuery(".choose_box .check-box-input").attr("checked") == "checked"){
        /*delete_cookie('active');
        set_cookie('false');
        read_cookie('btn');*/
    }
    else{
        /*delete_cookie('false');
        set_cookie('active');
        read_cookie('btn');*/
    }
}
function delete_btn(type){
    var url = window.location.href;
    if(url.indexOf("order=")>=0 || url.indexOf("limit=")>=0){
        jQuery(".is_in_stock_btn").remove();
    }
    if(type=="choose"){
        jQuery(".is_in_stock_btn").remove();
    }
    else{
        jQuery(".toolbar-bottom .choose_box").remove();
    }
}

var is_in_stock=function(){
    var url = window.location.href;
    var btn = jQuery(".is_in_stock_btn");
    var length = jQuery(".pages li").length;
    var page= jQuery(".pages li a");
    var new_url = '';
    var str='';
    var type='';
    var type_icon='';
    /*分类列表*/
    if(url.indexOf("is_in_stock=1")>=0){
        jQuery(".choose_box .check-box-input").addClass('active');
    }
    if(url.indexOf("q=")<0){
        /*不存在*/
        if(url.indexOf("is_in_stock=") < 0){
            url.indexOf("p=") < 0 ? (new_url = url +'?is_in_stock=1') : (new_url = url +'&is_in_stock=1');
            page_url('1');
        }
        else if(url.indexOf("is_in_stock=") >= 0){
            /*已选择显示*/
            url.indexOf("is_in_stock=1") >= 0 ? (str='1') : (str='0') ;
            str=='0' ? ( type = "1") : (type = "0");
            url.indexOf("p=") >= 0 ? (new_url = url.replace("is_in_stock="+str,"is_in_stock="+type)) : (new_url =url.replace("is_in_stock="+str,"is_in_stock="+type));
            page_url(str);
        }
    }
    /*搜索页*/
    else if(url.indexOf("q=") >= 0){
        /*不存在*/
        if(url.indexOf("is_in_stock=") < 0){
            url.indexOf("q=") >= 0 ? type_icon ='\&' : type_icon ='\?';
            url.indexOf("p=") < 0 ? (new_url = url +type_icon+'is_in_stock=1') : (new_url = url +type_icon+'is_in_stock=1');
            page_url('1');
        }
        else if(url.indexOf("is_in_stock=") >= 0){
            /*已选择显示*/
            url.indexOf("is_in_stock=1") >= 0 ? (str='1') : (str='0') ;
            str=='0' ? ( type = "1") : (type = "0");
            url.indexOf("p=") >= 0 ? (new_url = url.replace("is_in_stock="+str,"is_in_stock="+type)) : (new_url = url.replace("is_in_stock="+str,"is_in_stock="+type));
            page_url(str);
        }
    }
    btn.attr("href",new_url);
}
var page_url =function(data){
      var length = jQuery(".pages li").length;
      var url = window.location.href;
      var new_href='';
      var str='';
      var type='';
      var type_icon='';
      for(var i=0;i<length;i++)
      {
        if(jQuery(".pages li a").length>0){
            var href_attr= jQuery(".pages li a").eq(i).attr("href");
            if(href_attr){
                /*分类页*/
                if(url.indexOf("q=") <0 && url.indexOf('result') <0){
                    url.indexOf("is_in_stock=1") >= 0 ? (str='1') : (str='0') ;
                    str=='0' ? ( type = "1") : (type = "0");
                    url.indexOf("p=") >= 0 ? type_icon ='\&' : type_icon ='\?';
                    href_attr.indexOf("is_in_stock=1") >= 0 ? (new_href = href_attr.replace("is_in_stock="+type,"is_in_stock="+str)) : (new_href = href_attr.replace("is_in_stock="+str,"is_in_stock="+str));
                }
                /*搜索页*/
                else if(url.indexOf("q=") >=0){
                    url.indexOf("is_in_stock=1") >= 0 ? (str='1') : (str='0') ;
                    str=='0' ? ( type = "1") : (type = "0");
                    if(href_attr.indexOf("p=")<0){
                        href_attr.indexOf("is_in_stock=") >= 0 ? (new_href = href_attr.replace("is_in_stock="+str,"is_in_stock="+type)) : (new_href = href_attr.replace("is_in_stock="+str,"is_in_stock="+type));
                    }
                    else{
                        href_attr.indexOf("is_in_stock=") >= 0 ? (new_href = href_attr.replace("is_in_stock="+type,"is_in_stock="+str)) : (new_href = href_attr.replace("is_in_stock="+type,"is_in_stock="+str));
                    }
                }
                 jQuery(".pages li a").eq(i).attr("href",new_href);

            }
        }
      }
}
