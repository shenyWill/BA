$(function () {
	$("#clean-recently").click(function () {
		$.ajax({
			url : window.ROOT_URL+"o_customer/service/deleteRecentlyViewed",
			type : "POST",
			dataType:"json",
			success: function (data) {
				if(data.ret=="0"){
					$("#recently-view").remove();
				}else{
					easyDialog.open({
						container : {
							"header":"提示",
							"content": "删除最近浏览记录失败，请稍后重试。",
							"yesFn": true,
							"noFn" : true
						}
					});
				}
			},
			error: function (data) {
				console.error("ask for the delete recently viewed API failed,error info:"+data.statusText);
			}
		})
	});
});