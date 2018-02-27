/*专题列表页*/
jQuery(function () {
    !function ($) {
        //当选中专题列表页加载专题标签
        var option = {
            url: specialUrl+"/v1/tags",
            dataType: "json",
            type: "get",
            cache: false,
            data: {"websiteId": websiteId},
            success: function (data) {
                var ret = data.status,
                    res_data = data.data;
                if (ret == 200) {
                    //显示结果页的函数
                    var result = "";
                    if(!res_data.length){
                        $(".js-topics-list-nav").hide();
                        return;
                    }else {
                        $.each(res_data, function (index, item) {
                            var html = '<li id=' + item.id + '><a href="javascript:;">' + item.name + '</a></li>';
                            result += html;
                        });
                        $(".js-topics-list-nav").append(result);
                    }
                }
            },
            beforeSend: function () {
                $('<div class="com-loading"></div>').appendTo('.js-topics-wrap').show();
            },
            complete: function () {
                $(".com-loading").hide();
            }
        };
        $.ajax(option);
        ////当选中专题列表页加载专题标签对应的专题列表
        topicAjax(specialUrl+"/v1/tag-special", {"websiteId": websiteId, "tagId": 0, "page": 1, "pageSize": 10});
        $(".js-topics-list-nav").on("click", "li", function () {
            var _this = $(this);
            _this.addClass("active").siblings().removeClass("active");
            var i = $(this).index();
            var tagId = $(this).attr("id");
            $(".js-topics-wrap").eq(i).show().siblings(".js-topics-wrap").hide();
            if (i == 0) {
                topicAjax(specialUrl+"/v1/tag-special", {
                    "websiteId": websiteId,
                    "tagId": 0,
                    "page": 1,
                    "pageSize": 10
                });
            } else {
                topicAjax(specialUrl+"/v1/tag-special", {
                    "websiteId": websiteId,
                    "tagId": tagId,
                    "page": 1,
                    "pageSize": 10
                });
            }
        });
        function topicAjax(url, data) {
            $.ajax({
                url: url,
                dataType: "json",
                type: "get",
                cache: false,
                data: data,
                success: function (data) {
                    var ret = data.status;
                    if (ret == 200) {
                        if(data.data == null){
                            $('.js-topics-wrap').html('<div class="empty-tip">'+'抱歉,该专题下没有产品,请查看其它专题'+'</div>');
                            return;
                        }
                        var source = $('#topics-content').html(),
                            template = Handlebars.compile(source),
                            html = template(data);
                        $('.js-topics-wrap').html(html);
                    }
                }
            });
        }
    }(jQuery);
});