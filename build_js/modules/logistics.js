'use strict';
import serviceData from 'build_js/api/index';
var logisticsHbs = require("build_js/hbs/logistics.hbs"); 

const Logistics = {
    getData:function(that,num){
        const url = serviceData.requestURL.logisticsTrackUrl;
        const orderId = that.attr('data-order-no');
        const itemAtive = that.attr('data-logistics');
        const itemUrl = that.attr('data-details');
        const logistics = that.parents('.order-ctrl').find('.logistics');
        const argument = {
            orderNo:orderId,
            method:'GET'
        }
        if(!orderId) return false;
        if(itemAtive){
            logistics.addClass('active');
            return false;//第一次请求避免后续继续请求
        }
        serviceData.requestdata(url,argument ,function(res){
            let result = res.data;
            let data = {};
            if(res.code == 200){
                if(num && result.length > num){
                    result = result.slice(0,num);//只选取前面几条
                }
                if(!result || result.length == 0){
                    result = null;
                }
                data = {
                    data: result,
                    url : itemUrl
                } 
            }else{
                data = {
                    message:res.message
                }
            }
            const text = logisticsHbs({
                title:'',
                result : data
            });
            logistics.html(text);
            logistics.addClass('active');
            that.attr('data-logistics','true');
        })
    },
    close:function(){

    }
}
export default  Logistics;