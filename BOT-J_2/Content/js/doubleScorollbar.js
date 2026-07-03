$(document).ready(function () {
	//多個Modal，使最新開啟的modal顯示在最上層 
	//深思海数_willschang http://www.jianshu.com/p/0f05e628f87b
	$(document).on('show.bs.modal', '.modal', function (event) {
		var zIndex = 1045 + (10 * $('.modal:visible').length); 
		$(this).css('z-index', zIndex);  
		 setTimeout(function() {
			 $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
		 }, 0);
	});
	//for modal scrollbar disappear
	$(document).on('hidden.bs.modal', '.modal', function () {
		$('.modal:visible').length && $(document.body).addClass('modal-open');
	});
});