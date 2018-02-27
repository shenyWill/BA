jQuery(function(){
    var index=0,
        $=jQuery;
    jQuery('body').on('click','.J_change_viewpoint',function() {
            var _this=$(this);
            if(_this.attr('data-disable')=='disable'){
                return false;
            };
            _this.attr('data-disable','disable');
        var parent=$(this).parents('.J_emarsys'),
            emarsys_page=parent.find('.J_emarsys_page');
            index++;
            if(index>=emarsys_page.length){
                index=0;
                emarsys_page.eq((emarsys_page.length-1)).fadeOut(200);
            };
            emarsys_page.eq(Math.abs(index-1)).fadeOut(200);
            var lazy_emarsys=emarsys_page.eq(index).find('.lazy_emarsys');
                lazy_emarsys.each(function(i) {
                    var src=lazy_emarsys.eq(i).attr('data-original');
                        lazy_emarsys.eq(i).attr('src',src);
                });
            setTimeout(function(){
                emarsys_page.eq(index).fadeIn(500);
            },300);
            setTimeout(function(){
                _this.removeAttr('data-disable');
            },800)
    });
    
    //add by yuands
    var turn_left=false;
    jQuery('body').on("click",'.J_change_viewpoint_mb',function(){
    	var _this=$(this);
        if(_this.attr('data-disable')=='disable'){
            return false;
        };
        _this.attr('data-disable','disable');
       	var parent=$(this).parents('.m-emarsys'),
        emarsys_page_mb=parent.find('.index-pro-box');
        if(!turn_left){
        	emarsys_page_mb[0].style.transform="translateX(-100%)"
        	turn_left=true;
        }else{
        	emarsys_page_mb[0].style.transform="translateX(0)";
        	turn_left=false;
        }
        setTimeout(function(){
            _this.removeAttr('data-disable');
        },800)
    })
})