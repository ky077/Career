$(function(){
	//更新通知
	$(".alert-btn").click(function(){
		$(".alert-content").slideToggle();
		$(this).html( ($(this).html() !="展開<span>+</span>") ? "展開<span>+</span>" : "關閉<span>-</span>" );
		return false;
	})

	
	//新舊切換
	$(".tab-compare ul.tab-menu li").click(function(){
		var nowClickTab = $(this).find("a").attr("href");
		$(this).parent().next(".tab-content").find(nowClickTab).fadeIn(100).siblings().fadeOut(100);
		
		if( $(this).find("a").hasClass("linkage") ){
			$(this).parents(".tab-menu").find("a").removeClass("nowTab");
			$(this).parents(".tab-menu").find("a.linkage").addClass("nowTab");
			
		}else{
			$(this).parents(".tab-menu").find("a").removeClass("nowTab");
			$(this).find("a").addClass("nowTab");
		}
		
		return false;
	});
})

