$(function(){
    var shareDom=$("#share-uni");//分享div
    var shareUl=$(".share-ul");//description
    var showDom=document.getElementById('show-dialog');
    var price=$(".current-price").text();
    var productName=$('.pd-maintitle').text();
    var productPic=$("#wrap").find('a').attr("href");
    var titlePrompt='【好友给你推荐一份BA大礼】';
    var shareDate = {
           url:'',
           desc: '', /*默认分享理由(可选)*/
           summary: price, /*摘要(可选)*/
           title: productName, /*分享标题(可选)*/
           site: '', /*分享来源 如：腾讯网(可选)*/
           pics: productPic/*分享图片的路径(可选)*/
        };
                          
    var source = $("#entry-template").html();
    var template = Handlebars.compile(source);//handlebars的功能在这里
    var html='';//弹窗内容
    
    //分享数据和接口
    var shareId='';
    var description='';
    var goodsId=$(".pd-options-ctn.ajax-products-item").attr("data-productid");
    var customerId=getCookie('customerId');//用户id
    var sessionId=getCookie('frontend');//后台设置的cookie,取不到
    var shareUrlShow='/share/activity/check-product?websiteId='+encodeURIComponent(websiteId)+'&goodsId='+encodeURIComponent(goodsId);
    var shareUrlMessage='/o_share/activity/createGoodsUrl';
    //var urlKey=window.location.host+'/o_share/activity/shareGoods'//(设置或获取 URL 的主机部分,不包含协议)
    
    showDom.onclick=function(){
        //异步获取分享url信息
        $.ajax({
            type:"get",
            url: shareUrlMessage,
            data:{
               shareId:shareId,
               goodsId:goodsId
            },
            success: function(data){
                var dataObj=JSON.parse(data);
                if(dataObj.message=='not login'){
                     window.location='/customer/account/login/';
                }else if(dataObj.data.message=='分享活动已结束'){
                    alert(dataObj.data.message)
                }else{
                shareDate.url=dataObj.data.url;//正式站，这行要显示出来
                shareDate.qq='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+encodeURIComponent(shareDate.url)+'&title='+titlePrompt+'&pics='+productPic+'&desc='+productName;//QQ空间分享接口
                shareDate.sina='http://service.weibo.com/share/share.php?url='+encodeURIComponent(shareDate.url)+'&title='+titlePrompt+productName+'&pic='+productPic;//新浪微博分享接口
                shareDate.douban='http://shuo.douban.com/!service/share?href='+encodeURIComponent(shareDate.url)+'&name='+titlePrompt+'&image='+productPic+'&text='+productName;//豆瓣
                html = template(shareDate);//返回字符串
                easyDialog.open({
                    container: {
                        header : '关闭',
                        content: html
                    },
                    callback : callFn ,
                    drag : false
                });
                $("#easyDialogWrapper").css({
                    "width":"initial"
                })
                $('.easyDialog_wrapper .easyDialog_text').css({
                    "padding":"0 20px"
                })
                $('#easyDialogBox').css({
                    "transform":"translateX(-50%) translateY(-50%)",
                    "margin":"0"
                })
                $("#code").qrcode({//生成二维码
                    render: "canvas", //canvas方式 
                    width: 150, //宽度 
                    height:150, //高度 
                    text: shareDate.url //任意内容 
                }); 
            }
            },
            error:function(){
                console.log("获取数据失败")
            }
        });
    } 
    
    $('html').on('click','.share-copy',function(){//复制
        console.log('xxx');
        var aux = document.createElement("input");// 创建元素用于复制
        aux.setAttribute("value",shareDate.url);// 设置元素内容
        document.body.appendChild(aux);// 将元素插入页面进行调用
        aux.select();// 复制内容
        document.execCommand("copy");// 将内容复制到剪贴板
        document.body.removeChild(aux);// 删除创建元素
        alert("已复制好，可贴粘。"); 
    })
    
    
    $(function(){//校验单品页面是否正在参与分享活动
        $.ajax({
            url: shareUrlShow,
            success: function(data){
                var dataObj=JSON.parse(data);
                if(dataObj.code=="1101"){//有分享活动的话
                    shareDom.css({
                        "display":"block"
                    })
                    shareId=dataObj.data.shareId;//重置shareId
                    description=dataObj.data.description;//分享规则
                    //重新渲染分享规则代码
                    shareUl.html(description);
                }
            },
            error:function(){
                console.log("获取数据失败")
            }
        });
    })
    
    function getCookie(name){//获取对应的cookie值
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);//unescape() 函数可对通过 escape() 编码的字符串进行解码。
        else
        return null;
    }
    
    function callFn(){//不应该在公用的div写那么多的修饰，这里怕修改公用css影响其他页面，只能在这里修改
        $("#easyDialogWrapper").css({
            "width":"460px"
        })
        $('.easyDialog_wrapper .easyDialog_text').css({
            "padding":"45px 90px"
        })
        $('#easyDialogBox').css({
            "transform":"initial",
        })
    }
})