/*专题详情页*/
jQuery(function () {
    !function ($) {
        //获取专题详情页banner
        $.ajax({
            url: specialUrl+"/v1/special-detail",
            dataType: "json",
            type: "get",
            cache: false,
            data: {"specialId": ParamId},
            success: function (data) {
                var ret = data.status,
                    res_data = data.data;
                if (ret == 200) {
                    if (res_data.banner_url) {
                        $("#topic-banner").find("img").attr("src", res_data.banner_url);
                    };
                    if(res_data.title) {
                        document.title = res_data.title;
                    }
                }
            }
        });
        //获取更多专题页列表
        $.ajax({
            url: specialUrl+"/v1/special-relation",
            dataType: "json",
            type: "get",
            cache: false,
            data: {"specialId": ParamId},
            success: function (data) {
                var ret = data.status;
                if (ret == 200) {
                    var source = $('#more-topics-list').html(),
                        template = Handlebars.compile(source),
                        html = template(data);
                    $('#m-topics-wrap').html(html);
                }
            }
        });
    }(jQuery);
});