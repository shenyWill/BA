var allBrand = function() {
    //左侧导航菜单效果
    this.initAnchor = initAnchor;
    this.initAnchorFollowScreen = initAnchorFollowScreen;

    //品牌推荐页侧边导航begin
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
                    scrollTop: anchorTargetOffsetTop-$(anchorNav).outerHeight()
                }, 400);
            }
        });
    }
    function initAnchorFollowScreen(anchorNav,anchorContentTitle) {
        var win = window;
        var anchorOffsetTop = $(anchorNav).offset().top;
        var productAnchorHalfHeight = $(anchorNav).outerHeight();
        var scollTimer = null;
        $(win).scroll(function() {
            var winScrollTop = $(win).scrollTop();
            var anchorFixedTop = anchorOffsetTop;
            if(scollTimer){
                clearTimeout(scollTimer);
            }
            scollTimer = setTimeout(function(){
                if (winScrollTop > anchorFixedTop) {
                    $(anchorNav).css({
                        "position": "fixed",
                        "top": 0
                    });
                } else {
                    $(anchorNav).css({
                        "position": "static"
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
    //品牌推荐页侧边导航end


};
$(function() {
    var all_brand = new allBrand();
    all_brand.initAnchor("#brand-anchor",".anchor-link");
    all_brand.initAnchorFollowScreen("#brand-anchor",$(".js-all-brands-main").find(".js-brands-wrap"));
});
