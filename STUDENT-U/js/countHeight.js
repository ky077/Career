$(window).on('resize',function() {
	$countMainH = $(window).height() - $(".header").outerHeight() - $(".footer").outerHeight() - 40;	
	$(".table-forMainCenter").css("height", $countMainH);
	
	$('body').css('margin-bottom',$(".footer").outerHeight());

});
$(document).ready(function() {
    $(window).trigger('resize');
});