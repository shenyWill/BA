/**
 * Created by 翔宇 on 14-3-13.
 */
//
//var spConfig =new Product();
//spConfig.initialize(jsonConfig);
/**
 * 选择不同颜色或自定义的属性
 * @param id 属性对应下拉菜单的id
 * @param value 该选项的id
 * @param product_image_src 对应产品的image src
 * @param front_label 1前台要显示的label
 * @param imageName 1
 */
function colorSelected(id, value, product_image_src, front_label, imageName, mainImgUrl, bigImgUrl) {
    var $ = jQuery;
    var temp=$("#" + value).parent();
    //如果不可用则不进行操作
    if ($("#" + value).parent().attr('class').indexOf('disabledSelect') > -1) {
        return;
    }
    //如果都不为空则改变详情页主图的图片
    if(mainImgUrl!=="" && bigImgUrl!==""){
        var zoomImg = jQuery('.product-view .product-img-box .product-img-zoom img');
        zoomImg.attr('src',mainImgUrl);
        zoomImg.attr('jqimg',bigImgUrl);
    }

    var element = $('#' + id)[0];
    jQuery(element).val(value);
    spConfig.configureElement(element);
}

/*
 * Created by 小熊 14-3-21
 */
jQuery(function () {
    var $ = jQuery;
    $('li.swatchContainer').click(function () {
        var $this = $(this);

        if ($this.attr('class').indexOf('disabledSelect') > -1) {
            return;
        }
        
        $('#product-options-wrapper').find('.colorAlarm').remove();
        $this.parent().find('i').remove();
        $this.parent().find('.selected').removeClass('selected');
        $this.append('<i></i>');
        $this.addClass('selected');
    });
});