$(window).on('resize',function() {	
	var $minH = $(window).height() - $(".head").outerHeight() - $(".banner").outerHeight() - $(".toolSection").outerHeight()- $(".footer").outerHeight();
	$(".main").css("min-height", $minH);
	
});
$(document).ready(function() {
    $(window).trigger('resize');
});