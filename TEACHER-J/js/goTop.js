$(function(){
	$(window).scroll(function(){
		var HEIGHT = $(window).scrollTop() + $(window).height() - $(".goTop").outerHeight();
		//計算top要到的位置 = 目前捲軸在的位置 +  (視窗高度 - 圖片高度//100 )
		
		if( $(window).scrollTop() > 200 ){
				$(".goTop").stop().animate({top:HEIGHT},300);
		}else{
				$(".goTop").stop().animate({top:-100},300);
		}
	});

	$(".goTop").click(function(){
		$("html,body").animate({scrollTop:0},300);
		return false;
	});

}); 