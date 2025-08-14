$(window).on('resize',function() {	
	$countMainH = $(window).height() - $(".header").outerHeight() - $(".footer").outerHeight();
	
	$(".img-formobile").css("max-height",$countMainH);
	
	$(".main, .table-forMainCenter").outerHeight($countMainH);
	if( $(".table-forMainCenter td").height() > $countMainH){
		$(".main, .table-forMainCenter").outerHeight('auto');
	}else{
		$(".main, .table-forMainCenter").outerHeight($countMainH);
	}
});
$(document).ready(function() {
    $(window).trigger('resize');
});
$(window).load(function() {
    $(window).trigger('resize');
});
